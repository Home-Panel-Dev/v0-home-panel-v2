import { NextResponse } from "next/server"
import { createAdminClient, logActivity } from "@/lib/database"
import { createArmalytixCase, getArmalytixCheckUrl, isArmalytixConfigured } from "@/lib/armalytix"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, checkType } = body

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 })
    }

    if (!checkType || !["identity", "source_of_funds", "both"].includes(checkType)) {
      return NextResponse.json({ error: "Invalid check type" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verify token and get enquiry
    const { data: enquiry, error: enquiryError } = await adminClient
      .from("enquiries")
      .select("*")
      .eq("onboarding_token", token)
      .single()

    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 })
    }

    // Get onboarding data
    const onboardingData = enquiry.onboarding_data || {}

    // Check if we already have an Armalytix case
    let armalytixCaseId = onboardingData.armalytix_case_id

    // Build callback URL for webhooks
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || "https://v0-home-panel-v2.vercel.app"
    const callbackUrl = `${baseUrl}/api/webhooks/armalytix`

    if (!armalytixCaseId) {
      // Create new Armalytix case
      const checkTypes: ("identity" | "source_of_funds")[] = checkType === "both"
        ? ["identity", "source_of_funds"]
        : [checkType as "identity" | "source_of_funds"]

      const caseResponse = await createArmalytixCase({
        client: {
          firstName: enquiry.first_name,
          lastName: enquiry.last_name,
          email: enquiry.email,
          phone: enquiry.phone,
          dateOfBirth: onboardingData.personal_details?.date_of_birth,
          address: onboardingData.personal_details?.current_address ? {
            line1: onboardingData.personal_details.current_address,
            city: "",
            postcode: enquiry.property_postcode || "",
          } : undefined,
        },
        transactionType: enquiry.transaction_type,
        propertyValue: enquiry.property_value,
        propertyAddress: enquiry.property_address,
        referenceId: enquiry.id,
        callbackUrl,
        checkTypes,
      })

      if (!caseResponse.success) {
        console.error("[armalytix] Failed to create case:", caseResponse.error)
        return NextResponse.json({ error: caseResponse.error || "Failed to create Armalytix case" }, { status: 500 })
      }

      armalytixCaseId = caseResponse.caseId

      // Store case ID in onboarding data
      await adminClient
        .from("enquiries")
        .update({
          onboarding_data: {
            ...onboardingData,
            armalytix_case_id: armalytixCaseId,
            armalytix_identity_url: caseResponse.identityCheckUrl,
            armalytix_sof_url: caseResponse.sourceOfFundsUrl,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", enquiry.id)

      // Log activity
      await logActivity({
        enquiryId: enquiry.id,
        actorType: "client",
        action: "aml_check_initiated",
        description: `Armalytix case created: ${armalytixCaseId}`,
      })

      // Return the URL directly from case creation
      const checkUrl = checkType === "identity" || checkType === "both"
        ? caseResponse.identityCheckUrl
        : caseResponse.sourceOfFundsUrl

      return NextResponse.json({
        success: true,
        caseId: armalytixCaseId,
        url: checkUrl,
        identityUrl: caseResponse.identityCheckUrl,
        sourceOfFundsUrl: caseResponse.sourceOfFundsUrl,
      })
    }

    // Case already exists, get the check URL
    const urlResponse = await getArmalytixCheckUrl(
      armalytixCaseId,
      checkType === "both" ? "identity" : checkType as "identity" | "source_of_funds"
    )

    if (!urlResponse.success) {
      // Fall back to stored URLs
      const storedUrl = checkType === "identity" || checkType === "both"
        ? onboardingData.armalytix_identity_url
        : onboardingData.armalytix_sof_url

      if (storedUrl) {
        return NextResponse.json({
          success: true,
          caseId: armalytixCaseId,
          url: storedUrl,
        })
      }

      return NextResponse.json({ error: urlResponse.error || "Failed to get check URL" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      caseId: armalytixCaseId,
      url: urlResponse.url,
    })
  } catch (error) {
    console.error("[armalytix] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
