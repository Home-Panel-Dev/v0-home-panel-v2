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

    const { checkId, decision, notes } = await request.json()
    
    if (!checkId || !decision) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the compliance check
    const { data: check, error: checkError } = await adminClient
      .from("compliance_checks")
      .select("id, enquiry_id, case_id, check_type, status")
      .eq("id", checkId)
      .single()

    if (checkError || !check) {
      return NextResponse.json({ error: "Compliance check not found" }, { status: 404 })
    }

    // Update the compliance check
    const { error: updateError } = await adminClient
      .from("compliance_checks")
      .update({
        status: decision,
        review_decision: decision,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", checkId)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Failed to update compliance check" }, { status: 500 })
    }

    // Log activity
    await logActivity({
      enquiryId: check.enquiry_id,
      caseId: check.case_id,
      actorType: "admin",
      actorId: user.id,
      action: "compliance_reviewed" as never,
      description: `${check.check_type} ${decision}: ${notes || "No notes"}`,
      metadata: { check_type: check.check_type, decision }
    })

    // Update enquiry/case compliance summary
    if (check.enquiry_id) {
      await updateComplianceSummary(adminClient, check.enquiry_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Compliance review error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function updateComplianceSummary(adminClient: ReturnType<typeof createAdminClient>, enquiryId: string) {
  // Get all compliance checks for this enquiry
  const { data: checks } = await adminClient
    .from("compliance_checks")
    .select("check_type, status")
    .eq("enquiry_id", enquiryId)

  // Get documents
  const { data: documents } = await adminClient
    .from("documents")
    .select("review_status")
    .eq("enquiry_id", enquiryId)

  const identityCheck = checks?.find(c => c.check_type === "identity_verification")
  const sofCheck = checks?.find(c => c.check_type === "source_of_funds")
  
  const approvedDocs = documents?.filter(d => d.review_status === "approved").length || 0
  const totalDocs = documents?.length || 0

  const summary = {
    identity: {
      status: identityCheck?.status || "not_started",
    },
    sourceOfFunds: {
      status: sofCheck?.status || "not_started",
    },
    documents: {
      total: totalDocs,
      approved: approvedDocs,
    },
  }

  await adminClient
    .from("enquiries")
    .update({ compliance_summary: summary })
    .eq("id", enquiryId)
}
