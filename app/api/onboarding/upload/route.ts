import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const token = formData.get("token") as string

    if (!file || !token) {
      return NextResponse.json(
        { error: "Missing file or token" },
        { status: 400 }
      )
    }

    // Verify token
    const { data: enquiry, error: fetchError } = await supabase
      .from("enquiries")
      .select("id")
      .eq("onboarding_token", token)
      .single()

    if (fetchError || !enquiry) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 404 }
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`onboarding/${enquiry.id}/${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
