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
  let query = adminClient.from("case_status_history").select("*")

  if (enquiryId) {
    query = query.eq("enquiry_id", enquiryId)
  }
  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data: history, error } = await query.order("created_at", { ascending: false })

  if (error) {
    // Table might not exist yet, return empty array
    return NextResponse.json({ history: [] })
  }

  return NextResponse.json({ history: history || [] })
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

  // Get user profile for name
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  const createdByName = profile 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() 
    : user.email

  // Insert status history
  const { error: historyError } = await adminClient
    .from("case_status_history")
    .insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      status,
      created_by: user.id,
      created_by_name: createdByName,
      notes: `Status changed to ${status}`,
    })

  if (historyError) {
    console.error("Status history insert error:", historyError)
  }

  // Update the main record status
  if (enquiryId) {
    await adminClient
      .from("enquiries")
      .update({ 
        status,
        expected_completion_date: expectedCompletionDate || null,
        next_action_date: nextActionDate || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", enquiryId)
  }

  if (caseId) {
    await adminClient
      .from("cases")
      .update({ 
        status,
        expected_completion_date: expectedCompletionDate || null,
        next_action_date: nextActionDate || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId)
  }

  // Log activity
  await logActivity({
    enquiryId: enquiryId || undefined,
    caseId: caseId || undefined,
    actorType: "admin",
    actorId: user.id,
    action: "status_updated",
    description: `Status changed to "${status}"`,
    metadata: { new_status: status, email_reminder: emailReminder }
  })

  return NextResponse.json({ success: true })
}
