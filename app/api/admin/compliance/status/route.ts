import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

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

    const { enquiryId, caseId, status } = await request.json()
    
    if (!status || (!enquiryId && !caseId)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update enquiry internal status
    if (enquiryId) {
      const { error: updateError } = await adminClient
        .from("enquiries")
        .update({
          internal_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", enquiryId)

      if (updateError) {
        console.error("Update error:", updateError)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
      }

      // Log activity
      await logActivity({
        enquiryId,
        actorType: "admin",
        actorId: user.id,
        action: "case_status_changed",
        description: `Internal status changed to: ${status}`,
        metadata: { new_status: status }
      })
    }

    // Update case internal status and matter readiness
    if (caseId) {
      const updates: Record<string, unknown> = {
        internal_status: status,
        updated_at: new Date().toISOString(),
      }

      if (status === "approved_to_proceed") {
        updates.compliance_approved_at = new Date().toISOString()
        updates.compliance_approved_by = user.id
        updates.matter_readiness = "approved"
      }

      const { error: updateError } = await adminClient
        .from("cases")
        .update(updates)
        .eq("id", caseId)

      if (updateError) {
        console.error("Update error:", updateError)
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
      }

      // Log activity
      await logActivity({
        caseId,
        actorType: "admin",
        actorId: user.id,
        action: "case_status_changed",
        description: `Internal status changed to: ${status}`,
        metadata: { new_status: status }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Status update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
