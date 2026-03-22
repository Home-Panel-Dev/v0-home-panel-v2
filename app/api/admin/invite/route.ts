import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { randomUUID } from "crypto"

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

    // Create admin Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey)

    const { data: enquiry, error: enquiryError } = await adminSupabase
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single()

    if (enquiryError || !enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
    }

    // Generate unique onboarding token and case reference
    const onboardingToken = randomUUID()
    const caseReference = enquiry.case_reference || `HP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, "0")}`

    // Build onboarding URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    const onboardingUrl = `${baseUrl}/onboarding/${onboardingToken}`

    // Update enquiry with token and status
    const { error: updateError } = await adminSupabase
      .from("enquiries")
      .update({ 
        status: "onboarding_invited",
        case_reference: caseReference,
        onboarding_token: onboardingToken,
        onboarding_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", enquiryId)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 })
    }

    // Send email via Resend
    // Use resend.dev for testing until homepanel.co.uk is verified at https://resend.com/domains
    const fromEmail = process.env.RESEND_FROM_EMAIL || "HomePanel <onboarding@resend.dev>"
    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: enquiry.email,
      subject: `Complete Your Onboarding - ${caseReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; width: 48px; height: 48px; background-color: #059669; border-radius: 12px; margin-bottom: 16px;"></div>
            <h1 style="margin: 0; font-size: 24px; color: #0f172a;">HomePanel</h1>
          </div>
          
          <h2 style="font-size: 20px; margin-bottom: 16px;">Hello ${enquiry.first_name},</h2>
          
          <p>We're ready to start your property transaction. Please complete your onboarding by clicking the button below.</p>
          
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">Case Reference</p>
            <p style="margin: 0; font-size: 18px; font-weight: 600;">${caseReference}</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${onboardingUrl}" style="display: inline-block; background-color: #059669; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 500; font-size: 16px;">
              Start Onboarding
            </a>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">This link is unique to you and will expire in 7 days. If you did not request this, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
          
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            HomePanel - Making property transactions simple<br>
            <a href="${baseUrl}" style="color: #64748b;">homepanel.co.uk</a>
          </p>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error("Resend email error:", emailError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Log activity (ignore errors since this is non-critical)
    try {
      await adminSupabase.from("activity_log").insert({
        enquiry_id: enquiryId,
        action: "onboarding_invited",
        description: `Onboarding invite sent to ${enquiry.email}`,
        actor_type: "admin",
        actor_id: user.id,
      })
    } catch {
      // Activity logging is non-critical, ignore errors
    }

    return NextResponse.json({ 
      success: true, 
      caseReference,
      onboardingUrl,
      message: `Onboarding invite sent to ${enquiry.email}` 
    })

  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 })
  }
}
