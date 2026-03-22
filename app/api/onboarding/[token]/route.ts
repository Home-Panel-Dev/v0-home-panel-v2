import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

// GET - Fetch enquiry by onboarding token
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    const { data: enquiry, error } = await supabase
      .from("enquiries")
      .select("id, first_name, last_name, email, phone, property_address, transaction_type, case_reference, onboarding_status, onboarding_data")
      .eq("onboarding_token", token)
      .single()

    if (error || !enquiry) {
      return NextResponse.json(
        { error: "Invalid or expired onboarding link" },
        { status: 404 }
      )
    }

    return NextResponse.json({ enquiry })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 }
    )
  }
}

// POST - Save onboarding progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { step, data } = await request.json()

    // Fetch current enquiry
    const { data: enquiry, error: fetchError } = await supabase
      .from("enquiries")
      .select("id, email, first_name, onboarding_data")
      .eq("onboarding_token", token)
      .single()

    if (fetchError || !enquiry) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      )
    }

    // Merge new data with existing
    const currentData = enquiry.onboarding_data || {}
    let updatedData: Record<string, unknown> = { ...currentData }
    let newStatus = "in_progress"
    let notifyAdmin = false
    let stepLabel = ""

    switch (step) {
      case "personal_details":
        updatedData.personal_details = data
        stepLabel = "Personal Details"
        notifyAdmin = true
        break
      case "id_verification":
        updatedData.id_verification = data
        stepLabel = "ID Verification"
        notifyAdmin = true
        break
      case "source_of_funds":
        updatedData.source_of_funds = data
        stepLabel = "Source of Funds"
        notifyAdmin = true
        break
      case "documents":
        updatedData.documents = data
        stepLabel = "Documents"
        notifyAdmin = true
        break
      case "complete":
        newStatus = "completed"
        updatedData.completed_at = new Date().toISOString()
        stepLabel = "Onboarding Complete"
        notifyAdmin = true
        break
    }

    // Update enquiry
    const { error: updateError } = await supabase
      .from("enquiries")
      .update({
        onboarding_data: updatedData,
        onboarding_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enquiry.id)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to save progress" },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from("activity_log").insert({
      enquiry_id: enquiry.id,
      action: `onboarding_${step}`,
      description: `Client completed: ${stepLabel}`,
      actor_type: "client",
    }).catch(() => {}) // Don't fail if activity_log doesn't exist

    // Notify admin
    if (notifyAdmin && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "HomePanel <onboarding@resend.dev>",
          to: process.env.ADMIN_EMAIL || "joshua@madebymclean.com",
          subject: `Onboarding Update: ${enquiry.first_name} - ${stepLabel}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Onboarding Progress Update</h2>
              <p><strong>${enquiry.first_name}</strong> has completed: <strong>${stepLabel}</strong></p>
              <p>View the full details in your <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enquiries/${enquiry.id}">admin dashboard</a>.</p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error("Email error:", emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error:", err)
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    )
  }
}
