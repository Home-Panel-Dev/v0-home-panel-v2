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
  let query = adminClient.from("case_notes").select("*", { count: "exact" })

  if (enquiryId) {
    query = query.eq("enquiry_id", enquiryId)
  }
  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data: notes, error, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (error) {
    // Table might not exist yet
    return NextResponse.json({ notes: [], totalPages: 1 })
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return NextResponse.json({ 
    notes: notes || [], 
    totalPages,
    currentPage: page
  })
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
    emailClient,
    clientName,
    clientEmail
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
    : user.email

  // Insert client note if provided
  if (clientNote) {
    await adminClient.from("case_notes").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      content: clientNote,
      note_type: "to_client",
      email_sent: emailClient || false,
      created_by: user.id,
      created_by_name: createdByName,
    })

    // Log activity
    await logActivity({
      enquiryId: enquiryId || undefined,
      caseId: caseId || undefined,
      actorType: "admin",
      actorId: user.id,
      action: "note_added",
      description: `Note added for client`,
      metadata: { note_type: "to_client", emailed: emailClient }
    })
  }

  // Insert solicitor note if provided
  if (solicitorNote) {
    await adminClient.from("case_notes").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      content: solicitorNote,
      note_type: "to_solicitor",
      email_sent: false,
      created_by: user.id,
      created_by_name: createdByName,
    })

    await logActivity({
      enquiryId: enquiryId || undefined,
      caseId: caseId || undefined,
      actorType: "admin",
      actorId: user.id,
      action: "note_added",
      description: `Note added for solicitor/EA`,
      metadata: { note_type: "to_solicitor" }
    })
  }

  return NextResponse.json({ success: true })
}
