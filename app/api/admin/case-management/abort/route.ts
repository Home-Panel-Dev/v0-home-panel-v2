import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

// POST: Request abort for a case/enquiry
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, reason } = body

  if (!reason) {
    return NextResponse.json({ error: "Reason required" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Get user profile for name
  const { data: profile } = await adminClient
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  const requestedByName = profile 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() 
    : user.email

  // Update the main record status to aborted (using existing status column only)
  if (enquiryId) {
    const { error } = await adminClient
      .from("enquiries")
      .update({ 
        status: "aborted",
        updated_at: new Date().toISOString()
      })
      .eq("id", enquiryId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (caseId) {
    const { error } = await adminClient
      .from("cases")
      .update({ 
        status: "aborted",
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Try to add status history entry (may fail if table doesn't exist)
  try {
    await adminClient.from("case_status_history").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      status: "Aborted",
      notes: `Abort requested: ${reason}`,
      created_by: user.id,
      created_by_name: requestedByName,
    })
  } catch {
    // Table doesn't exist, skip
  }

  // Log activity (ignore errors)
  try {
    await logActivity({
      enquiryId: enquiryId || undefined,
      caseId: caseId || undefined,
      actorType: "admin",
      actorId: user.id,
      action: "abort_requested",
      description: `Abort requested: ${reason}`,
      metadata: { reason }
    })
  } catch {
    // Activity logging may fail, that's OK
  }

  return NextResponse.json({ success: true })
}
