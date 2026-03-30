import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

// GET: List status history
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const enquiryId = searchParams.get("enquiryId")
  const caseId = searchParams.get("caseId")

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    let query = adminClient.from("case_status_history").select("*")
    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    if (caseId) query = query.eq("case_id", caseId)

    const { data: history, error } = await query.order("created_at", { ascending: false })
    if (!error) {
      return NextResponse.json({ history: history || [] })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: get from activity_log table
  try {
    let query = adminClient
      .from("activity_log")
      .select("*")
      .eq("action", "status_updated")

    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    
    const { data: activities } = await query.order("created_at", { ascending: false }).limit(50)

    if (activities) {
      const history = activities.map(a => ({
        id: a.id,
        status: a.description?.replace("Status changed to ", "").replace(/"/g, "") || "Unknown",
        created_at: a.created_at,
        created_by_name: a.actor_type === "admin" ? "Admin" : "System",
        notes: a.description
      }))
      return NextResponse.json({ history })
    }
  } catch {
    // activity_log also doesn't exist
  }

  // Last fallback: get from enquiries/cases status_history_data JSON
  if (enquiryId) {
    const { data: enquiry } = await adminClient
      .from("enquiries")
      .select("status_history_data, status, updated_at")
      .eq("id", enquiryId)
      .single()

    if (enquiry) {
      const history = Array.isArray(enquiry.status_history_data) ? enquiry.status_history_data : []
      return NextResponse.json({ history })
    }
  }

  if (caseId) {
    const { data: caseData } = await adminClient
      .from("cases")
      .select("status_history_data, status, updated_at")
      .eq("id", caseId)
      .single()

    if (caseData) {
      const history = Array.isArray(caseData.status_history_data) ? caseData.status_history_data : []
      return NextResponse.json({ history })
    }
  }

  return NextResponse.json({ history: [] })
}

// POST: Add status history entry and update main record
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { 
    enquiryId, 
    caseId, 
    status, 
    expectedCompletionDate, 
    nextActionDate,
    emailReminder 
  } = body

  if (!status) {
    return NextResponse.json({ error: "Status required" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Get user profile for name
  const { data: profile } = await adminClient
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  const createdByName = profile 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() 
    : user.email || "Admin"

  const statusEntry = {
    id: crypto.randomUUID(),
    status,
    created_at: new Date().toISOString(),
    created_by: user.id,
    created_by_name: createdByName,
    notes: `Status changed to ${status}`,
  }

  // Try to insert into dedicated table
  try {
    await adminClient.from("case_status_history").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      ...statusEntry,
    })
  } catch {
    // Table doesn't exist, use fallback
  }

  // Update the main record status and add to history
  if (enquiryId) {
    const { data: enquiry } = await adminClient
      .from("enquiries")
      .select("status_history_data")
      .eq("id", enquiryId)
      .single()

    const history = Array.isArray(enquiry?.status_history_data) ? enquiry.status_history_data : []
    history.unshift(statusEntry)

    await adminClient
      .from("enquiries")
      .update({ 
        status,
        status_history_data: history,
        expected_completion_date: expectedCompletionDate || null,
        next_action_date: nextActionDate || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", enquiryId)
  }

  if (caseId) {
    const { data: caseData } = await adminClient
      .from("cases")
      .select("status_history_data")
      .eq("id", caseId)
      .single()

    const history = Array.isArray(caseData?.status_history_data) ? caseData.status_history_data : []
    history.unshift(statusEntry)

    await adminClient
      .from("cases")
      .update({ 
        status,
        status_history_data: history,
        expected_completion_date: expectedCompletionDate || null,
        next_action_date: nextActionDate || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId)
  }

  // Log activity
  await logActivity({
    enquiryId: enquiryId || undefined,
    actorType: "admin",
    actorId: user.id,
    action: "status_updated",
    description: `Status changed to "${status}"`,
  })

  return NextResponse.json({ success: true })
}
