import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStatusUpdateEmail } from "@/lib/email-templates"

const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

const VALID_STATUSES = ["new", "reviewing", "accepted", "onboarding", "active", "exchanged", "completed", "aborted"]

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { enquiryId, newStatus, message, sendEmail = true } = body

    if (!enquiryId || !newStatus) {
      return NextResponse.json({ error: "Enquiry ID and status required" }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get current enquiry
    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single()

    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    const previousStatus = enquiry.status

    // Update status
    const { error: updateError } = await supabase
      .from("enquiries")
      .update({ status: newStatus })
      .eq("id", enquiryId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
    }

    // Send status update email if requested
    if (sendEmail && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      const emailData = getStatusUpdateEmail({
        firstName: enquiry.first_name,
        caseReference: `HP-${enquiry.id.slice(0, 8).toUpperCase()}`,
        previousStatus,
        newStatus,
        message,
      })

      await resend.emails.send({
        from: FROM_EMAIL,
        to: enquiry.email,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      })
    }

    return NextResponse.json({ 
      success: true,
      previousStatus,
      newStatus,
    })
  } catch (error) {
    console.error("[v0] Status update error:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
