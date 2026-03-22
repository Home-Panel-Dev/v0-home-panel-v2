import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getOnboardingInviteEmail } from "@/lib/email-templates"

const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check admin auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { enquiryId } = body

    if (!enquiryId) {
      return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 })
    }

    // Get enquiry details
    const { data: enquiry, error: enquiryError } = await supabase
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single()

    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    // Generate case reference
    const caseReference = `HP-${Date.now().toString(36).toUpperCase()}`

    // Generate magic link for client
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: enquiry.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/onboarding`,
      },
    })

    if (magicLinkError) {
      console.error("[v0] Magic link error:", magicLinkError)
      
      // Fallback: create invite link manually
      const { data: inviteLinkData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(enquiry.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/onboarding`,
        data: {
          first_name: enquiry.first_name,
          last_name: enquiry.last_name,
          role: "client",
          enquiry_id: enquiryId,
          case_reference: caseReference,
        },
      })

      if (inviteError) {
        return NextResponse.json({ error: "Failed to create invite" }, { status: 500 })
      }
    }

    // Update enquiry status
    await supabase
      .from("enquiries")
      .update({ 
        status: "onboarding",
      })
      .eq("id", enquiryId)

    // Send onboarding email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const emailData = getOnboardingInviteEmail({
        firstName: enquiry.first_name,
        lastName: enquiry.last_name,
        email: enquiry.email,
        caseReference,
        magicLink: magicLinkData?.properties?.action_link || 
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login?email=${encodeURIComponent(enquiry.email)}`,
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
      caseReference,
      message: "Invite sent successfully" 
    })
  } catch (error) {
    console.error("[v0] Invite error:", error)
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 })
  }
}
