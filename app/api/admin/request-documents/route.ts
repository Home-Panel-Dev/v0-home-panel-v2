import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDocumentRequestEmail } from "@/lib/email-templates"

const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { enquiryId, documents, message } = body

    if (!enquiryId || !documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: "Enquiry ID and documents required" }, { status: 400 })
    }

    // Get enquiry
    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single()

    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    // Send document request email
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const emailData = getDocumentRequestEmail({
        firstName: enquiry.first_name,
        caseReference: `HP-${enquiry.id.slice(0, 8).toUpperCase()}`,
        documents,
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
      message: "Document request sent successfully" 
    })
  } catch (error) {
    console.error("[v0] Document request error:", error)
    return NextResponse.json({ error: "Failed to send document request" }, { status: 500 })
  }
}
