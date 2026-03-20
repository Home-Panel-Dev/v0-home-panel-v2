// Client Invite API - Sends magic link via Supabase OTP - Updated March 2026
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

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

    const caseReference = `HP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, "0")}`

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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
    const redirectUrl = `${baseUrl}/dashboard/onboarding`

    const { error: otpError } = await adminSupabase.auth.signInWithOtp({
      email: enquiry.email,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: enquiry.first_name,
          last_name: enquiry.last_name,
          role: "client",
          enquiry_id: enquiryId,
          case_reference: caseReference
        },
        shouldCreateUser: true
      }
    })

    if (otpError) {
      console.error("OTP error:", otpError)
      return NextResponse.json({ error: otpError.message }, { status: 500 })
    }

    await supabase
      .from("enquiries")
      .update({ status: "onboarding" })
      .eq("id", enquiryId)

    return NextResponse.json({ 
      success: true, 
      caseReference,
      message: `Magic link sent to ${enquiry.email}` 
    })

  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 })
  }
}
