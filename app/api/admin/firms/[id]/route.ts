import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: Get a single firm with templates and document packs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const adminClient = createAdminClient()

    const [firmResult, templatesResult, packsResult, enquiriesResult] = await Promise.all([
      adminClient.from("firms").select("*").eq("id", id).single(),
      adminClient.from("firm_templates").select("*").eq("firm_id", id),
      adminClient.from("firm_document_packs").select("*").eq("firm_id", id),
      adminClient.from("enquiries").select("id, first_name, last_name, status, created_at").eq("assigned_firm_id", id).order("created_at", { ascending: false }).limit(10)
    ])

    if (firmResult.error || !firmResult.data) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 })
    }

    return NextResponse.json({
      firm: firmResult.data,
      templates: templatesResult.data || [],
      documentPacks: packsResult.data || [],
      recentEnquiries: enquiriesResult.data || []
    })
  } catch (error) {
    console.error("Firm GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update a firm
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
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

    // Update slug if name changed
    const updateData = { ...body }
    if (body.name) {
      updateData.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }
    
    // Sync primary_color with brand_color
    if (body.brand_color) {
      updateData.primary_color = body.brand_color
    }

    const { data: firm, error } = await adminClient
      .from("firms")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Failed to update firm:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(firm)
  } catch (error) {
    console.error("Firm PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete a firm
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
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

    // Check if firm has assigned enquiries
    const { count } = await adminClient
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("assigned_firm_id", id)

    if (count && count > 0) {
      return NextResponse.json({ 
        error: "Cannot delete firm with assigned enquiries. Please reassign enquiries first." 
      }, { status: 400 })
    }

    const { error } = await adminClient
      .from("firms")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Failed to delete firm:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Firm DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
