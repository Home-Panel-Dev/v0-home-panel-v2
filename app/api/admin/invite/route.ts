import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { getOnboardingInviteEmail } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { enquiryId } = await request.json()
    
    if (!enquiryId) {
      return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 })
    }

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

    // Create admin Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Generate magic link using admin client
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: "magiclink",
      email: enquiry.email,
      options: {
        redirectTo: `${baseUrl}/admin`,
      }
    })

    if (linkError) {
      console.error("Magic link generation error:", linkError)
      return NextResponse.json({ error: linkError.message }, { status: 500 })
    }

    // Get the magic link URL
    const magicLink = linkData.properties?.action_link || `${baseUrl}/auth/login`

    // Send email via Resend with our custom template
    const emailContent = getOnboardingInviteEmail({
      firstName: enquiry.first_name,
      lastName: enquiry.last_name,
      email: enquiry.email,
      caseReference,
      magicLink,
    })

    const { error: emailError } = await resend.emails.send({
      from: "HomePanel <noreply@homepanel.co.uk>",
      to: enquiry.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    })

    if (emailError) {
      console.error("Resend email error:", emailError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Update enquiry status
    await supabase
      .from("enquiries")
      .update({ 
        status: "onboarding",
        case_reference: caseReference 
      })
      .eq("id", enquiryId)

    // Create client profile
    if (linkData.user) {
      await adminSupabase
        .from("profiles")
        .upsert({
          id: linkData.user.id,
          email: enquiry.email,
          first_name: enquiry.first_name,
          last_name: enquiry.last_name,
          role: "client",
        })
    }

    return NextResponse.json({ 
      success: true, 
      caseReference,
      message: `Onboarding invite sent to ${enquiry.email}` 
    })

  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 })
  }
}
