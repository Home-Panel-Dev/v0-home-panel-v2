import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

// GET: Get a single document
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  const { data: document, error } = await adminClient
    .from("documents")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  return NextResponse.json(document)
}

// PATCH: Update document (review status, notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const adminClient = createAdminClient()

  // Get current document for logging
  const { data: currentDoc } = await adminClient
    .from("documents")
    .select("review_status, file_name, enquiry_id, case_id")
    .eq("id", id)
    .single()

  // Update the document
  const updateData: Record<string, unknown> = {}
  
  if (body.review_status) {
    updateData.review_status = body.review_status
    updateData.reviewed_by = user.id
    updateData.reviewed_at = new Date().toISOString()
  }
  
  if (body.review_notes !== undefined) {
    updateData.review_notes = body.review_notes
  }
  
  if (body.document_type) {
    updateData.document_type = body.document_type
  }

  const { data: document, error } = await adminClient
    .from("documents")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  if (body.review_status && currentDoc?.review_status !== body.review_status) {
    await logActivity({
      enquiryId: currentDoc?.enquiry_id,
      caseId: currentDoc?.case_id,
      actorType: "admin",
      actorId: user.id,
      action: "document_reviewed",
      description: `Document "${currentDoc?.file_name}" ${body.review_status}`,
      metadata: { 
        previous_status: currentDoc?.review_status,
        new_status: body.review_status 
      }
    })
  }

  return NextResponse.json(document)
}

// DELETE: Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("documents")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
