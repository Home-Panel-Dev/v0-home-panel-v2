// HomePanel Enquiry Submission API - Updated
import { NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"
import type { EnquiryFormData } from "@/lib/form-schema"
import { getCustomerConfirmationEmail, getInternalAlertEmail } from "@/lib/email-templates"

const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || "team@homepanel.co.uk"
// Use Resend's test sender by default (works without domain verification)
// Set FROM_EMAIL env var once you've verified your domain in Resend
const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

// Log at startup to verify environment
console.log("[v0] API route loaded, RESEND_API_KEY configured:", !!process.env.RESEND_API_KEY)

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
      console.log("[v0] Sending emails via Resend...")
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      // Get email templates
      const customerEmail = getCustomerConfirmationEmail(validatedData)
      const internalEmail = getInternalAlertEmail(validatedData)

      // Send customer confirmation email
      console.log("[v0] Sending customer confirmation to:", validatedData.email)
      const customerResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: validatedData.email,
        subject: customerEmail.subject,
        html: customerEmail.html,
        text: customerEmail.text,
      })
      console.log("[v0] Customer email result:", customerResult)

      // Send internal alert email
      console.log("[v0] Sending internal alert to:", INTERNAL_EMAIL)
      const internalResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: INTERNAL_EMAIL,
        subject: internalEmail.subject,
        html: internalEmail.html,
        text: internalEmail.text,
      })
      console.log("[v0] Internal email result:", internalResult)
    } else {
      console.log("[v0] RESEND_API_KEY not configured, skipping email send")
      console.log("[v0] Enquiry data:", JSON.stringify(validatedData, null, 2))
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
