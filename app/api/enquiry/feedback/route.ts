import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || "joshua@madebymclean.com"
const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

const feedbackSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  reasons: z.array(z.string()),
  otherReason: z.string().optional(),
  quoteAmount: z.number().optional(),
})

const reasonLabels: Record<string, string> = {
  price: "Price too high",
  timing: "Not ready to proceed yet",
  comparison: "Comparing other law firms",
  service: "Prefer a different service",
  location: "Want a local solicitor",
  recommendation: "Going with a recommendation",
  other: "Other reason",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = feedbackSchema.parse(body)
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`

    // Save feedback to database if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Try to save feedback - table may not exist yet
      await supabase.from("enquiry_feedback").insert({
        email: validatedData.email,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        reasons: validatedData.reasons,
        other_reason: validatedData.otherReason || null,
        quote_amount: validatedData.quoteAmount || null,
      }).catch(() => {
        // Table might not exist - that's ok, we'll still send the email
      })
    }

    // Send internal notification about the feedback
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey && validatedData.reasons.length > 0) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)

      const reasonsText = validatedData.reasons
        .map(r => reasonLabels[r] || r)
        .join(", ")

      await resend.emails.send({
        from: FROM_EMAIL,
        to: INTERNAL_EMAIL,
        subject: `Quote Declined: ${fullName}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="background-color: #fef2f2; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #991b1b;">Quote Declined</h2>
    <p style="margin: 0; color: #666;">A potential customer has decided not to proceed.</p>
  </div>

  <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px;">Customer Details</h3>
    <p style="margin: 0 0 8px;"><strong>Name:</strong> ${fullName}</p>
    <p style="margin: 0 0 8px;"><strong>Email:</strong> ${validatedData.email}</p>
    ${validatedData.quoteAmount ? `<p style="margin: 0;"><strong>Quote Amount:</strong> £${validatedData.quoteAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>` : ""}
  </div>

  <div style="background-color: #fff7ed; border-radius: 16px; padding: 24px;">
    <h3 style="margin: 0 0 16px; color: #9a3412;">Feedback Reasons</h3>
    <p style="margin: 0 0 8px;"><strong>Selected:</strong> ${reasonsText}</p>
    ${validatedData.otherReason ? `<p style="margin: 16px 0 0; padding: 16px; background: white; border-radius: 8px;"><strong>Additional comments:</strong><br>${validatedData.otherReason}</p>` : ""}
  </div>

  <p style="color: #666; font-size: 14px; margin-top: 24px;">
    This feedback can help identify common concerns and improve conversion rates.
  </p>
</body>
</html>
        `,
        text: `
Quote Declined

Customer: ${fullName}
Email: ${validatedData.email}
${validatedData.quoteAmount ? `Quote Amount: £${validatedData.quoteAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : ""}

Feedback Reasons: ${reasonsText}
${validatedData.otherReason ? `\nAdditional comments:\n${validatedData.otherReason}` : ""}
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
