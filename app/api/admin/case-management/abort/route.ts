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

  // Update the main record
  if (enquiryId) {
    await adminClient
      .from("enquiries")
      .update({ 
        status: "aborted",
        abort_requested: true,
        abort_reason: reason,
        abort_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", enquiryId)
  }

  if (caseId) {
    await adminClient
      .from("cases")
      .update({ 
        status: "aborted",
        abort_requested: true,
        abort_reason: reason,
        abort_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId)
  }

  // Add status history entry
  await adminClient.from("case_status_history").insert({
    enquiry_id: enquiryId || null,
    case_id: caseId || null,
    status: "Aborted",
    notes: `Abort requested: ${reason}`,
    created_by: user.id,
    created_by_name: requestedByName,
  })

  // Log activity
  await logActivity({
    enquiryId: enquiryId || undefined,
    caseId: caseId || undefined,
    actorType: "admin",
    actorId: user.id,
    action: "abort_requested",
    description: `Abort requested: ${reason}`,
    metadata: { reason }
  })

  return NextResponse.json({ success: true })
}
