import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  console.log("[v0] Upload API called")
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    if (!blobToken) {
      console.error("[v0] Missing BLOB_READ_WRITE_TOKEN")
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

    console.log("[v0] Upload request:", { fileName: file?.name, hasToken: !!token, documentType })

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
      console.error("[v0] Token lookup failed:", fetchError)
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      )
    }

    console.log("[v0] Enquiry found:", enquiry.id)

    // Upload to Vercel Blob
    let blob
    try {
      blob = await put(
        `onboarding/${enquiry.id}/${Date.now()}-${file.name}`, 
        file, 
        { access: "public" }
      )
      console.log("[v0] Blob uploaded:", blob.url)
    } catch (blobError) {
      console.error("[v0] Blob upload failed:", blobError)
      return NextResponse.json(
        { error: "File upload failed" },
        { status: 500 }
      )
    }

    // Create document record in database - try simple insert first
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        enquiry_id: enquiry.id,
        name: file.name,
        file_name: file.name,
        file_type: file.type,
        mime_type: file.type,
        file_url: blob.url,
        file_size: file.size,
        document_type: documentType,
        status: "pending",
        review_status: "pending_review",
        uploaded_by: `${enquiry.first_name} ${enquiry.last_name}`,
        uploaded_by_type: "client",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Document insert error:", insertError)
      // Don't fail - the blob was uploaded successfully
    } else {
      console.log("[v0] Document record created:", document?.id)
    }

    // Log activity without blocking (ignore errors)
    supabase.from("activity_log").insert({
      enquiry_id: enquiry.id,
      actor_type: "client",
      action: "document_uploaded",
      description: `Document "${file.name}" (${documentType}) uploaded`,
    }).then(() => {
      console.log("[v0] Activity logged")
    }).catch(err => {
      console.error("[v0] Activity log failed (non-blocking):", err)
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      documentId: document?.id,
    })
  } catch (err) {
    console.error("[v0] Upload error:", err)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
