import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getOnboardingInviteEmail } from "@/lib/email-templates"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { enquiryId } = await request.json()
    
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
    const caseReference = `HP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, "0")}`

    // Generate magic link for the client
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/onboarding`
      : "http://localhost:3000/dashboard/onboarding"

    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: enquiry.email,
      options: {
        redirectTo: redirectUrl,
        data: {
          first_name: enquiry.first_name,
          last_name: enquiry.last_name,
          role: "client",
          enquiry_id: enquiryId,
          case_reference: caseReference
        }
      }
    })

    if (magicLinkError) {
      console.error("[v0] Magic link error:", magicLinkError)
      return NextResponse.json({ error: "Failed to generate invite link" }, { status: 500 })
    }

    // Update enquiry status to onboarding
    await supabase
      .from("enquiries")
      .update({ 
        status: "onboarding",
        case_reference: caseReference
      })
      .eq("id", enquiryId)

    // Send onboarding invite email
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey && magicLinkData?.properties?.action_link) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const emailContent = getOnboardingInviteEmail({
        firstName: enquiry.first_name,
        lastName: enquiry.last_name,
        email: enquiry.email,
        caseReference,
        magicLink: magicLinkData.properties.action_link
      })

      await resend.emails.send({
        from: process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>",
        to: enquiry.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
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
