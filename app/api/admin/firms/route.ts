import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: List all firms
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    const { data: firms, error } = await adminClient
      .from("firms")
      .select("*")
      .order("name")

    if (error) {
      console.error("Failed to fetch firms:", error)
      return NextResponse.json({ error: "Failed to fetch firms" }, { status: 500 })
    }

    return NextResponse.json(firms || [])
  } catch (error) {
    console.error("Firms API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
