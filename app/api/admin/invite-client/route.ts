import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"
import { getOnboardingInviteEmail } from "@/lib/email-templates"
import { randomUUID } from "crypto"

const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check admin auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { enquiryId } = body

    if (!enquiryId) {
      return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Get enquiry details
    const { data: enquiry, error: enquiryError } = await adminClient
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single()

    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    // Generate case reference and onboarding token
    const caseReference = enquiry.case_reference || `HP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, "0")}`
    const onboardingToken = randomUUID()

    // Build onboarding URL - this is the actual onboarding journey page
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || "https://v0-home-panel-v2.vercel.app"
    const onboardingUrl = `${baseUrl}/onboarding/${onboardingToken}`

    // Update enquiry with token and status
    const { error: updateError } = await adminClient
      .from("enquiries")
      .update({ 
        status: "onboarding_invited",
        case_reference: caseReference,
        onboarding_token: onboardingToken,
        onboarding_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", enquiryId)

    if (updateError) {
      console.error("[invite-client] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 })
    }

    // Send onboarding email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const emailData = getOnboardingInviteEmail({
        firstName: enquiry.first_name,
        lastName: enquiry.last_name,
        email: enquiry.email,
        caseReference,
        magicLink: onboardingUrl, // Use the token-based onboarding URL
      })

      await resend.emails.send({
        from: FROM_EMAIL,
        to: enquiry.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })
    }

    // Log activity
    try {
      await adminClient.from("activity_log").insert({
        enquiry_id: enquiryId,
        action: "onboarding_invited",
        description: `Onboarding invite sent to ${enquiry.email}`,
        actor_type: "admin",
        actor_id: user.id,
      })
    } catch {
      // Activity logging is non-critical
    }

    return NextResponse.json({ 
      success: true,
      caseReference,
      onboardingUrl,
      message: "Invite sent successfully" 
    })
  } catch (error) {
    console.error("[invite-client] Error:", error)
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 })
  }
}
