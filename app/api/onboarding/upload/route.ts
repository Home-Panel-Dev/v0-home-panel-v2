import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"
import { logActivity } from "@/lib/database"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`onboarding/${enquiry.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    // Create document record in database
    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        enquiry_id: enquiry.id,
        uploaded_by_type: "client",
        uploaded_by_id: token,
        file_name: file.name,
        file_url: blob.url,
        file_size: file.size,
        mime_type: file.type,
        document_type: documentType,
        review_status: "pending_review",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Failed to create document record:", insertError)
      // Still return success if blob was uploaded, even if DB insert fails
    }

    // Log activity
    await logActivity({
      enquiryId: enquiry.id,
      actorType: "client",
      actorId: `${enquiry.first_name} ${enquiry.last_name}`,
      action: "document_uploaded",
      description: `Document "${file.name}" uploaded during onboarding`,
      metadata: { document_type: documentType, file_name: file.name }
    })

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
