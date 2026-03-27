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

    // Get enquiry counts per firm
    const { data: enquiryCounts } = await adminClient
      .from("enquiries")
      .select("assigned_firm_id")
      .not("assigned_firm_id", "is", null)
    
    const countMap: Record<string, number> = {}
    enquiryCounts?.forEach(e => {
      if (e.assigned_firm_id) {
        countMap[e.assigned_firm_id] = (countMap[e.assigned_firm_id] || 0) + 1
      }
    })
    
    const firmsWithCounts = (firms || []).map(firm => ({
      ...firm,
      enquiry_count: countMap[firm.id] || 0
    }))

    return NextResponse.json(firmsWithCounts)
  } catch (error) {
    console.error("Firms API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create a new firm
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    // Verify admin role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    
    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    const { data: firm, error } = await adminClient
      .from("firms")
      .insert({
        name: body.name,
        slug,
        logo_url: body.logo_url || null,
        brand_color: body.brand_color || "#1a1a1a",
        primary_color: body.brand_color || "#1a1a1a",
        secondary_color: body.secondary_color || "#f8f8f6",
        sra_number: body.sra_number || null,
        address: body.address || null,
        phone: body.phone || null,
        email: body.email || null,
        contact_email: body.contact_email || body.email || null,
        contact_phone: body.contact_phone || body.phone || null,
        email_domain: body.email_domain || null,
        website: body.website || null,
        is_active: body.is_active !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create firm:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(firm)
  } catch (error) {
    console.error("Create firm error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
