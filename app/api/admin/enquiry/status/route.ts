import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStatusUpdateEmail } from "@/lib/email-templates"

const VALID_STATUSES = ["new", "under_review", "accepted", "onboarding", "active", "completed", "rejected"]

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { enquiryId, status, sendNotification = false } = await request.json()
    
    if (!enquiryId || !status) {
      return NextResponse.json({ error: "Enquiry ID and status required" }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get current enquiry
    const { data: enquiry, error: fetchError } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single()

    if (fetchError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    const previousStatus = enquiry.status

    // Update status
    const { error: updateError } = await supabase
      .from("enquiries")
      .update({ status })
      .eq("id", enquiryId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    // Send notification email if requested
    if (sendNotification && enquiry.email) {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const { Resend } = await import("resend")
        const resend = new Resend(apiKey)
        
        const emailContent = getStatusUpdateEmail({
          firstName: enquiry.first_name,
          caseReference: enquiry.case_reference || `ENQ-${enquiryId.slice(0, 8).toUpperCase()}`,
          previousStatus,
          newStatus: status
        })

        await resend.emails.send({
          from: process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>",
          to: enquiry.email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      previousStatus,
      newStatus: status
    })

  } catch (error) {
    console.error("[v0] Status update error:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
