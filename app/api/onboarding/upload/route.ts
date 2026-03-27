import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg", 
  "image/png",
]

export async function POST(request: Request) {
  try {
    // 1. Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        { error: "Upload service not configured" },
        { status: 500 }
      )
    }

    if (!blobToken) {
      console.error("Missing BLOB_READ_WRITE_TOKEN")
      return NextResponse.json(
        { error: "Upload service not configured" },
        { status: 500 }
      )
    }

    // 2. Parse form data
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      )
    }

    const file = formData.get("file") as File | null
    const token = formData.get("token") as string | null
    const documentType = (formData.get("documentType") as string) || "other"

    // 3. Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: "Missing authentication token" },
        { status: 400 }
      )
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      )
    }

    // 5. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, JPEG, or PNG files." },
        { status: 400 }
      )
    }

    // 6. Initialize Supabase with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 7. Verify token and get enquiry
    const { data: enquiry, error: fetchError } = await supabase
      .from("enquiries")
      .select("id, first_name, last_name")
      .eq("onboarding_token", token)
      .single()

    if (fetchError || !enquiry) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      )
    }

    // 8. Generate unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const path = `onboarding/${enquiry.id}/${timestamp}-${safeName}`

    // 9. Upload to Vercel Blob (private store)
    let blob
    try {
      blob = await put(path, file, {
        access: "private",
      })
    } catch (blobError) {
      console.error("Blob upload failed:", blobError)
      return NextResponse.json(
        { error: "File upload failed. Please try again." },
        { status: 500 }
      )
    }

    // 10. Save document record to database (non-blocking on failure)
    // For private blobs, store the pathname instead of URL
    const fileUrl = `/api/files?pathname=${encodeURIComponent(blob.pathname)}`
    
    const documentRecord = {
      enquiry_id: enquiry.id,
      name: file.name,
      file_url: fileUrl,
      file_size: file.size,
      document_type: documentType,
      status: "pending",
    }

    const { error: insertError } = await supabase
      .from("documents")
      .insert(documentRecord)

    if (insertError) {
      // Log but don't fail - the file is already uploaded successfully
      console.error("Document record insert failed:", insertError.message)
    }

    // 11. Return success
    return NextResponse.json({
      success: true,
      url: fileUrl,
      pathname: blob.pathname,
      filename: file.name,
    })

  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    )
  }
}
