import { NextResponse } from "next/server"
import { createAdminClient, logActivity } from "@/lib/database"
import { validateWebhookSignature, ArmalytixWebhookPayload } from "@/lib/armalytix"

const WEBHOOK_SECRET = process.env.ARMALYTIX_WEBHOOK_SECRET || ""

export async function POST(request: Request) {
  try {
    const payload = await request.text()
    const signature = request.headers.get("x-armalytix-signature") || ""

    // Validate webhook signature
    if (WEBHOOK_SECRET && !validateWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      console.error("[armalytix-webhook] Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data: ArmalytixWebhookPayload = JSON.parse(payload)
    const { eventType, caseId, referenceId, status, checkType, riskLevel, completedAt } = data

    console.log("[armalytix-webhook] Received:", eventType, caseId, referenceId, status)

    const adminClient = createAdminClient()

    // Find the enquiry by reference ID (our enquiry ID)
    const { data: enquiry, error: enquiryError } = await adminClient
      .from("enquiries")
      .select("*")
      .eq("id", referenceId)
      .single()

    if (enquiryError || !enquiry) {
      console.error("[armalytix-webhook] Enquiry not found:", referenceId)
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    const onboardingData = enquiry.onboarding_data || {}

    // Map Armalytix status to our status
    const mapStatus = (armalytixStatus: string) => {
      switch (armalytixStatus) {
        case "approved": return { completed: true, status: "approved" }
        case "flagged": return { completed: true, status: "flagged" }
        case "failed": return { completed: true, status: "failed" }
        default: return { completed: false, status: "pending" }
      }
    }

    const mappedStatus = mapStatus(status)

    // Update onboarding data based on event type
    let updatedOnboardingData = { ...onboardingData }
    let activityDescription = ""

    switch (eventType) {
      case "identity_complete":
        updatedOnboardingData = {
          ...updatedOnboardingData,
          id_verification: {
            ...updatedOnboardingData.id_verification,
            completed: mappedStatus.completed,
            completed_at: completedAt || new Date().toISOString(),
            provider: "armalytix",
            status: mappedStatus.status,
            risk_level: riskLevel,
          },
        }
        activityDescription = `Identity verification ${status}: ${riskLevel || "standard"} risk`
        break

      case "sof_complete":
        updatedOnboardingData = {
          ...updatedOnboardingData,
          source_of_funds: {
            ...updatedOnboardingData.source_of_funds,
            completed: mappedStatus.completed,
            completed_at: completedAt || new Date().toISOString(),
            provider: "armalytix",
            status: mappedStatus.status,
            risk_level: riskLevel,
          },
        }
        activityDescription = `Source of funds check ${status}: ${riskLevel || "standard"} risk`
        break

      case "case_complete":
        updatedOnboardingData = {
          ...updatedOnboardingData,
          armalytix_case_status: "complete",
          armalytix_risk_level: riskLevel,
          armalytix_completed_at: completedAt || new Date().toISOString(),
        }
        activityDescription = `All Armalytix checks complete: ${riskLevel || "standard"} risk`
        break

      case "case_failed":
        updatedOnboardingData = {
          ...updatedOnboardingData,
          armalytix_case_status: "failed",
        }
        activityDescription = "Armalytix checks failed"
        break
    }

    // Update enquiry
    const { error: updateError } = await adminClient
      .from("enquiries")
      .update({
        onboarding_data: updatedOnboardingData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enquiry.id)

    if (updateError) {
      console.error("[armalytix-webhook] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 })
    }

    // Log activity
    await logActivity({
      enquiryId: enquiry.id,
      actorType: "webhook",
      action: eventType === "case_complete" ? "aml_check_completed" : "aml_check_initiated",
      description: activityDescription,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[armalytix-webhook] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
