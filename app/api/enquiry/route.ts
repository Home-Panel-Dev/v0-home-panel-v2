// HomePanel Enquiry API
import { NextResponse } from "next/server"
import { z } from "zod"
import type { EnquiryFormData } from "@/lib/form-schema"
import { getCustomerConfirmationEmail, getInternalAlertEmail } from "@/lib/email-templates"

const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || "joshua@madebymclean.com"
const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

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
    const validatedData = submitSchema.parse(body) as EnquiryFormData

    // Only send emails if RESEND_API_KEY is configured
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      // Dynamic import to avoid module-level instantiation
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const customerEmail = getCustomerConfirmationEmail(validatedData)
      const internalEmail = getInternalAlertEmail(validatedData)

      // Send internal alert email
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: INTERNAL_EMAIL,
          subject: internalEmail.subject,
          html: internalEmail.html,
          text: internalEmail.text,
        })
      } catch (e) {
        console.error("Failed to send internal email:", e)
      }

      // Send customer confirmation email
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: validatedData.email,
          subject: customerEmail.subject,
          html: customerEmail.html,
          text: customerEmail.text,
        })
      } catch (e) {
        console.error("Failed to send customer email:", e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting enquiry:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 })
  }
}
