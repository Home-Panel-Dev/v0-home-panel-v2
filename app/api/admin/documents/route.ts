import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"
import { put } from "@vercel/blob"

// GET: List all documents
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
  let query = adminClient.from("documents").select("*")

  if (enquiryId) {
    query = query.eq("enquiry_id", enquiryId)
  }
  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data: documents, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: documents || [] })
}

// POST: Upload a new document
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File
  const enquiryId = formData.get("enquiryId") as string | null
  const caseId = formData.get("caseId") as string | null
  const documentType = formData.get("documentType") as string || "other"

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!enquiryId && !caseId) {
    return NextResponse.json({ error: "enquiryId or caseId required" }, { status: 400 })
  }

  // Upload to Vercel Blob
  const blob = await put(`documents/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  const adminClient = createAdminClient()

  // Create document record
  const { data: document, error } = await adminClient
    .from("documents")
    .insert({
      enquiry_id: enquiryId,
      case_id: caseId,
      uploaded_by_type: "admin",
      uploaded_by_id: user.id,
      file_name: file.name,
      file_url: blob.url,
      file_size: file.size,
      mime_type: file.type,
      document_type: documentType,
      review_status: "pending_review",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log activity
  await logActivity({
    enquiryId: enquiryId || undefined,
    caseId: caseId || undefined,
    actorType: "admin",
    actorId: user.id,
    action: "document_uploaded",
    description: `Document "${file.name}" uploaded`,
    metadata: { document_type: documentType, file_name: file.name }
  })

  return NextResponse.json(document, { status: 201 })
}
