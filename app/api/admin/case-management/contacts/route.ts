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
  let query = adminClient.from("case_contacts").select("*")

  if (enquiryId) {
    query = query.eq("enquiry_id", enquiryId)
  }
  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data: contacts, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ contacts: [] })
  }

  return NextResponse.json({ contacts: contacts || [] })
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

  const { data: contact, error } = await adminClient
    .from("case_contacts")
    .insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      ...contactData
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logActivity({
    enquiryId: enquiryId || undefined,
    caseId: caseId || undefined,
    actorType: "admin",
    actorId: user.id,
    action: "contact_added",
    description: `Contact "${contactData.company || contactData.contact_person}" added`,
    metadata: { business_type: contactData.business_type }
  })

  return NextResponse.json(contact, { status: 201 })
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

  const { data: contact, error } = await adminClient
    .from("case_contacts")
    .update({
      ...contactData,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(contact)
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

  if (!id) {
    return NextResponse.json({ error: "Contact ID required" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("case_contacts")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
