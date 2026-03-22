import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

export async function GET() {
  try {
    // Verify admin auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    // Verify user is admin
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all enquiries
    const { data: enquiries, error } = await adminClient
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch enquiries:", error)
      return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 })
    }

    return NextResponse.json(enquiries || [])
  } catch (error) {
    console.error("Enquiries API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
