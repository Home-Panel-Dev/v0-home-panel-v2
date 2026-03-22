import { NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"

const resend = new Resend(process.env.RESEND_API_KEY)

const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || "joshua@madebymclean.com"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
})

const subjectLabels: Record<string, string> = {
  general: "General Enquiry",
  partnership: "Partnership Enquiry",
  support: "Support Request",
  feedback: "Feedback",
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = contactSchema.parse(body)

    const subjectLabel = subjectLabels[validatedData.subject] || validatedData.subject
    const timestamp = new Date().toLocaleString("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
    })

    // Send internal notification email
    await resend.emails.send({
      from: FROM_EMAIL,
      to: INTERNAL_EMAIL,
      replyTo: validatedData.email,
      subject: `Contact Form: ${subjectLabel}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="display: inline-block; background-color: #1a1a1a; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">H</div>
    <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 600;">Contact Form Submission</h1>
  </div>

  <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 30%;">Name</td>
        <td style="padding: 8px 0; font-weight: 500;">${validatedData.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Email</td>
        <td style="padding: 8px 0; font-weight: 500;"><a href="mailto:${validatedData.email}" style="color: #1a1a1a;">${validatedData.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Subject</td>
        <td style="padding: 8px 0; font-weight: 500;">${subjectLabel}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Submitted</td>
        <td style="padding: 8px 0; font-weight: 500;">${timestamp}</td>
      </tr>
    </table>
  </div>

  <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px;">
    <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px; color: #666;">Message</h3>
    <p style="margin: 0; white-space: pre-wrap;">${validatedData.message}</p>
  </div>

  <p style="color: #666; font-size: 14px; margin-top: 24px;">
    Reply directly to this email to respond to ${validatedData.name}.
  </p>
</body>
</html>
      `,
      text: `
Contact Form Submission

Name: ${validatedData.name}
Email: ${validatedData.email}
Subject: ${subjectLabel}
Submitted: ${timestamp}

Message:
${validatedData.message}

---
Reply directly to this email to respond to ${validatedData.name}.
      `,
    })

    // Send confirmation to the user
    await resend.emails.send({
      from: FROM_EMAIL,
      to: validatedData.email,
      subject: "We've received your message",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <div style="display: inline-block; background-color: #1a1a1a; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">H</div>
    <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 600;">HomePanel</h1>
  </div>

  <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Thank you for getting in touch</h2>
  
  <p style="color: #666; margin-bottom: 24px;">
    Dear ${validatedData.name},
  </p>
  
  <p style="color: #666; margin-bottom: 24px;">
    We've received your message and will get back to you as soon as possible, typically within 1-2 business days.
  </p>

  <p style="color: #666; margin-bottom: 8px;">
    Best regards,
  </p>
  <p style="color: #1a1a1a; font-weight: 500; margin: 0;">
    The HomePanel Team
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    HomePanel | Simplifying your home move<br>
    <a href="https://homepanel.co.uk" style="color: #999;">homepanel.co.uk</a>
  </p>
</body>
</html>
      `,
      text: `
Thank you for getting in touch

Dear ${validatedData.name},

We've received your message and will get back to you as soon as possible, typically within 1-2 business days.

Best regards,
The HomePanel Team

---
HomePanel | Simplifying your home move
homepanel.co.uk
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting contact form:", error)
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
