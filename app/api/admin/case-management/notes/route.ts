import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

const PAGE_SIZE = 20

// GET: List notes with pagination
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const enquiryId = searchParams.get("enquiryId")
  const caseId = searchParams.get("caseId")
  const page = parseInt(searchParams.get("page") || "1")

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    let query = adminClient.from("case_notes").select("*", { count: "exact" })
    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    if (caseId) query = query.eq("case_id", caseId)

    const { data: notes, error, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (!error) {
      const totalPages = Math.ceil((count || 0) / PAGE_SIZE)
      return NextResponse.json({ notes: notes || [], totalPages, currentPage: page })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: Try to get from activity_log as notes
  try {
    let query = adminClient
      .from("activity_log")
      .select("*", { count: "exact" })
      .eq("action", "note_added")

    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    
    const { data: activities, count } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (activities) {
      const notes = activities.map(a => ({
        id: a.id,
        content: a.description || "",
        note_type: "internal",
        email_sent: false,
        created_at: a.created_at,
        created_by_name: a.actor_type === "admin" ? "Admin" : "System"
      }))
      const totalPages = Math.ceil((count || 0) / PAGE_SIZE)
      return NextResponse.json({ notes, totalPages, currentPage: page })
    }
  } catch {
    // activity_log doesn't exist either
  }

  return NextResponse.json({ notes: [], totalPages: 1, currentPage: 1 })
}

// POST: Add a note
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
    clientNote, 
    solicitorNote,
    emailClient
  } = body

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

  const notes: Array<{
    id: string
    content: string
    note_type: string
    email_sent: boolean
    created_at: string
    created_by: string
    created_by_name: string
  }> = []

  // Create client note if provided
  if (clientNote) {
    notes.push({
      id: crypto.randomUUID(),
      content: clientNote,
      note_type: "to_client",
      email_sent: emailClient || false,
      created_at: new Date().toISOString(),
      created_by: user.id,
      created_by_name: createdByName,
    })
  }

  // Create solicitor note if provided
  if (solicitorNote) {
    notes.push({
      id: crypto.randomUUID(),
      content: solicitorNote,
      note_type: "to_solicitor",
      email_sent: false,
      created_at: new Date().toISOString(),
      created_by: user.id,
      created_by_name: createdByName,
    })
  }

  // Try to insert into dedicated table
  try {
    for (const note of notes) {
      await adminClient.from("case_notes").insert({
        enquiry_id: enquiryId || null,
        case_id: caseId || null,
        ...note,
      })
    }
  } catch {
    // Table doesn't exist, use fallback
  }

  // Fallback: Just update the enquiry/case updated_at to trigger refresh
  if (enquiryId) {
    await adminClient
      .from("enquiries")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", enquiryId)
  }

  if (caseId) {
    await adminClient
      .from("cases")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", caseId)
  }

  // Log activity
  for (const note of notes) {
    await logActivity({
      enquiryId: enquiryId || undefined,
      actorType: "admin",
      actorId: user.id,
      action: "note_added",
      description: `Note added: ${note.note_type}`,
    })
  }

  return NextResponse.json({ success: true })
}
