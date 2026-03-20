import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        email: email,
        role: "admin",
      }, { onConflict: "id" })

    if (error) {
      console.error("Profile creation error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
  }
}
