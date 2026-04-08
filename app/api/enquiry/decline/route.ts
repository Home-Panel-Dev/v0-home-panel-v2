import { NextResponse } from "next/server"
import { z } from "zod"
import { getDeclineEmail } from "@/lib/email-templates"

const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

const declineSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = declineSchema.parse(body)

    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const declineEmailContent = getDeclineEmail({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      })

      await resend.emails.send({
        from: FROM_EMAIL,
        to: validatedData.email,
        subject: declineEmailContent.subject,
        html: declineEmailContent.html,
        text: declineEmailContent.text,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Decline email error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
