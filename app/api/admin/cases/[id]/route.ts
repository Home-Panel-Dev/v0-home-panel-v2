import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

// GET: Get a single case
export async function GET(
  request: NextRequest,
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

    const { data: caseData, error } = await adminClient
      .from("cases")
      .select(`
        *,
        enquiry:enquiries(*)
      `)
      .eq("id", id)
      .single()

    if (error || !caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Get documents
    const { data: documents } = await adminClient
      .from("documents")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: false })

    // Get activity log
    const { data: activities } = await adminClient
      .from("activity_log")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: false })
      .limit(50)

    return NextResponse.json({
      ...caseData,
      documents: documents || [],
      activities: activities || []
    })
  } catch (error) {
    console.error("Case GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update a case
export async function PATCH(
  request: NextRequest,
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

    // Get current case for logging
    const { data: currentCase } = await adminClient
      .from("cases")
      .select("status, case_reference")
      .eq("id", id)
      .single()

    // Update the case
    const { data: updatedCase, error } = await adminClient
      .from("cases")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log status change if status was updated
    if (body.status && currentCase?.status !== body.status) {
      await logActivity({
        caseId: id,
        actorType: "admin",
        actorId: user.id,
        action: "case_status_changed",
        description: `Status changed from ${currentCase?.status} to ${body.status}`,
        metadata: { 
          previous_status: currentCase?.status,
          new_status: body.status 
        }
      })
    }

    // Log firm assignment
    if (body.assigned_firm_name) {
      await logActivity({
        caseId: id,
        actorType: "admin",
        actorId: user.id,
        action: "firm_assigned",
        description: `Case assigned to ${body.assigned_firm_name}`,
        metadata: { firm_name: body.assigned_firm_name }
      })
    }

    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error("Case PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
