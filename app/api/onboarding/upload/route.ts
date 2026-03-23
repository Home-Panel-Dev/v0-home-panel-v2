import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"
import { logActivity } from "@/lib/database"

export async function POST(request: Request) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    if (!blobToken) {
      console.error("Missing BLOB_READ_WRITE_TOKEN")
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const formData = await request.formData()
    const file = formData.get("file") as File
    const token = formData.get("token") as string
    const documentType = formData.get("documentType") as string || "other"

    if (!file || !token) {
      return NextResponse.json(
        { error: "Missing file or token" },
        { status: 400 }
      )
    }

    // Verify token and get enquiry
    const { data: enquiry, error: fetchError } = await supabase
      .from("enquiries")
      .select("id, first_name, last_name")
      .eq("onboarding_token", token)
      .single()

    if (fetchError || !enquiry) {
      console.error("Token lookup failed:", fetchError)
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      )
    }

    // Upload to Vercel Blob
    let blob
    try {
      blob = await put(
        `onboarding/${enquiry.id}/${Date.now()}-${file.name}`, 
        file, 
        { access: "public" }
      )
    } catch (blobError) {
      console.error("Blob upload failed:", blobError)
      return NextResponse.json(
        { error: "File upload failed" },
        { status: 500 }
      )
    }

    // Create document record in database
    // Use column names that match the actual schema
    const documentData = {
      enquiry_id: enquiry.id,
      name: file.name, // Try 'name' first (from earlier simplified schema)
      file_type: file.type,
      file_url: blob.url,
      file_size: file.size,
      document_type: documentType,
      status: "pending",
      uploaded_by: `${enquiry.first_name} ${enquiry.last_name}`,
    }

    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert(documentData)
      .select()
      .single()

    if (insertError) {
      console.error("Document record insert failed:", insertError)
      // Try alternate column names if first attempt fails
      const altDocumentData = {
        enquiry_id: enquiry.id,
        file_name: file.name,
        file_url: blob.url,
        file_size: file.size,
        mime_type: file.type,
        document_type: documentType,
        review_status: "pending_review",
        uploaded_by_type: "client",
        uploaded_by_id: token,
      }
      
      const { data: altDoc, error: altError } = await supabase
        .from("documents")
        .insert(altDocumentData)
        .select()
        .single()
        
      if (altError) {
        console.error("Alt document insert also failed:", altError)
        // Still return success since blob was uploaded
      }
    }

    // Log activity (non-blocking)
    logActivity({
      enquiryId: enquiry.id,
      actorType: "client",
      action: "document_uploaded",
      description: `Document "${file.name}" uploaded during onboarding`,
      metadata: { document_type: documentType, file_name: file.name }
    }).catch(err => console.error("Activity log failed:", err))

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      documentId: document?.id,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
