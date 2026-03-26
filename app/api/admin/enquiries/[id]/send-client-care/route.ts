import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"
import { sendFirmClientCareEmail, sendFirmOnboardingInvite } from "@/lib/firm-emails"
import { randomUUID } from "crypto"

// POST: Send client care and onboarding emails
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: enquiryId } = await params
    const body = await request.json()
    const { sendClientCare = true, sendOnboarding = true } = body

    const adminClient = createAdminClient()
    
    // Verify admin role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Get the enquiry with firm
    const { data: enquiry, error: enquiryError } = await adminClient
      .from("enquiries")
      .select("*, firm:firms(*)")
      .eq("id", enquiryId)
      .single()
    
    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }
    
    if (!enquiry.firm_id) {
      return NextResponse.json({ error: "No firm assigned to this enquiry" }, { status: 400 })
    }
    
    const results: { clientCare?: boolean; onboarding?: boolean; errors: string[] } = {
      errors: []
    }
    
    // Send client care email
    if (sendClientCare) {
      const clientCareResult = await sendFirmClientCareEmail({ enquiryId })
      results.clientCare = clientCareResult.success
      if (!clientCareResult.success) {
        results.errors.push(`Client care: ${clientCareResult.error}`)
      }
    }
    
    // Send onboarding invite
    if (sendOnboarding) {
      // Generate or get existing token
      let onboardingToken = enquiry.onboarding_token
      
      if (!onboardingToken) {
        onboardingToken = randomUUID()
        await adminClient
          .from("enquiries")
          .update({ 
            onboarding_token: onboardingToken,
            onboarding_status: "invited",
            status: "onboarding_invited"
          })
          .eq("id", enquiryId)
      }
      
      const onboardingResult = await sendFirmOnboardingInvite({ 
        enquiryId, 
        onboardingToken 
      })
      results.onboarding = onboardingResult.success
      if (!onboardingResult.success) {
        results.errors.push(`Onboarding: ${onboardingResult.error}`)
      }
    }
    
    // Log the action
    await logActivity({
      enquiryId,
      actorType: "admin",
      actorId: user.id,
      action: "client_care_onboarding_sent",
      description: `Client care and onboarding emails sent`,
      metadata: { 
        client_care_sent: results.clientCare,
        onboarding_sent: results.onboarding,
        firm_id: enquiry.firm_id
      },
    })
    
    if (results.errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        partial: true,
        results,
        errors: results.errors 
      }, { status: 207 })
    }
    
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Send client care API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
