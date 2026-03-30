import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

// GET: List contacts
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
    let query = adminClient.from("case_contacts").select("*")
    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    if (caseId) query = query.eq("case_id", caseId)

    const { data: contacts, error } = await query.order("created_at", { ascending: false })
    if (!error) {
      return NextResponse.json({ contacts: contacts || [] })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: return empty contacts array
  return NextResponse.json({ contacts: [] })
}

// Helper to generate UUID-like ID for fallback
function generateId() {
  return crypto.randomUUID()
}

// POST: Add a new contact
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, ...contactData } = body

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    const { data: contact, error } = await adminClient
      .from("case_contacts")
      .insert({
        enquiry_id: enquiryId || null,
        case_id: caseId || null,
        ...contactData
      })
      .select()
      .single()

    if (!error) {
      await logActivity({
        enquiryId: enquiryId || undefined,
        actorType: "admin",
        actorId: user.id,
        action: "note_added",
        description: `Contact "${contactData.company || contactData.contact_person}" added`,
      })
      return NextResponse.json(contact, { status: 201 })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: return error - contacts table required
  return NextResponse.json({ error: "Contacts table not available" }, { status: 503 })
}

// PUT: Update a contact
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { id, enquiryId, caseId, ...contactData } = body

  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    const { data: contact, error } = await adminClient
      .from("case_contacts")
      .update({ ...contactData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (!error) {
      return NextResponse.json(contact)
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: return error
  return NextResponse.json({ error: "Contacts table not available" }, { status: 503 })
}

// DELETE: Delete a contact
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id")
  const enquiryId = searchParams.get("enquiryId")
  const caseId = searchParams.get("caseId")

  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    const { error } = await adminClient
      .from("case_contacts")
      .delete()
      .eq("id", id)

    if (!error) {
      return NextResponse.json({ success: true })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: return error
  return NextResponse.json({ error: "Contacts table not available" }, { status: 503 })
}
