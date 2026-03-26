import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

// POST: Assign a firm to an enquiry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: enquiryId } = await params
    const { firmId } = await request.json()
    
    if (!firmId) {
      return NextResponse.json({ error: "Firm ID required" }, { status: 400 })
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
    
    // Get the firm details
    const { data: firm, error: firmError } = await adminClient
      .from("firms")
      .select("id, name")
      .eq("id", firmId)
      .single()
    
    if (firmError || !firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 })
    }
    
    // Update the enquiry
    const { data: updatedEnquiry, error: updateError } = await adminClient
      .from("enquiries")
      .update({
        firm_id: firmId,
        firm_assigned_at: new Date().toISOString(),
      })
      .eq("id", enquiryId)
      .select()
      .single()
    
    if (updateError) {
      console.error("Failed to assign firm:", updateError)
      return NextResponse.json({ error: "Failed to assign firm" }, { status: 500 })
    }
    
    // Log activity
    await logActivity({
      enquiryId,
      actorType: "admin",
      actorId: user.id,
      action: "firm_assigned",
      description: `Firm assigned: ${firm.name}`,
      metadata: { firm_id: firmId, firm_name: firm.name },
    })
    
    return NextResponse.json({ 
      success: true, 
      enquiry: updatedEnquiry,
      firm 
    })
  } catch (error) {
    console.error("Assign firm API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
