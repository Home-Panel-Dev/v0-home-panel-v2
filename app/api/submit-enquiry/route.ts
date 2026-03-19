// HomePanel Enquiry Submission API - Updated
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"
import type { EnquiryFormData } from "@/lib/form-schema"
import { getCustomerConfirmationEmail, getInternalAlertEmail } from "@/lib/email-templates"

// IMPORTANT: Until you verify a domain in Resend, you can only send to your verified email
// Set INTERNAL_EMAIL to your Resend-verified email for testing
const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || "joshua@madebymclean.com"
// Use Resend's test sender by default (works without domain verification)
const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

// Minimal validation for required fields
const submitSchema = z.object({
  transactionType: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
}).passthrough()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const validatedData = submitSchema.parse(body) as EnquiryFormData

    console.log("[v0] Processing enquiry for:", validatedData.email)

    // Only send emails if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      // Get email templates
      const customerEmail = getCustomerConfirmationEmail(validatedData)
      const internalEmail = getInternalAlertEmail(validatedData)

      // Send internal alert email first (to verified email - should always work)
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: INTERNAL_EMAIL,
          subject: internalEmail.subject,
          html: internalEmail.html,
          text: internalEmail.text,
        })
      } catch (emailError) {
        console.error("Failed to send internal email:", emailError)
        // Continue anyway - don't fail the whole submission
      }

      // Send customer confirmation email
      // Note: In test mode, this only works if customer email matches your Resend-verified email
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: validatedData.email,
          subject: customerEmail.subject,
          html: customerEmail.html,
          text: customerEmail.text,
        })
      } catch (emailError) {
        console.error("Failed to send customer email:", emailError)
        // Continue anyway - enquiry was still recorded
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting enquiry:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to submit enquiry" },
      { status: 500 }
    )
  }
}
