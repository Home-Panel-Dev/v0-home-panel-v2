import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, generateCaseReference, logActivity } from "@/lib/database"

// GET: List all cases
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminClient = createAdminClient()
  const { data: cases, error } = await adminClient
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(cases)
}

// POST: Create a new case from an enquiry
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId } = body

  if (!enquiryId) {
    return NextResponse.json({ error: "enquiryId is required" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Get the enquiry
  const { data: enquiry, error: enquiryError } = await adminClient
    .from("enquiries")
    .select("*")
    .eq("id", enquiryId)
    .single()

  if (enquiryError || !enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 })
  }

  // Check if case already exists for this enquiry
  const { data: existingCase } = await adminClient
    .from("cases")
    .select("id, case_reference")
    .eq("enquiry_id", enquiryId)
    .single()

  if (existingCase) {
    return NextResponse.json({ 
      error: "Case already exists for this enquiry",
      case: existingCase 
    }, { status: 400 })
  }

  // Generate case reference
  const caseReference = await generateCaseReference()

  // Get onboarding data for compliance statuses
  const onboardingData = enquiry.onboarding_data || {}

  // Create the case
  const { data: newCase, error: caseError } = await adminClient
    .from("cases")
    .insert({
      enquiry_id: enquiryId,
      case_reference: caseReference,
      status: enquiry.onboarding_status === "completed" ? "onboarding_complete" : "pending_onboarding",
      client_name: `${enquiry.first_name} ${enquiry.last_name}`,
      client_email: enquiry.email,
      client_phone: enquiry.phone,
      property_address: enquiry.property_address,
      property_postcode: enquiry.property_postcode,
      property_value: enquiry.property_value,
      transaction_type: enquiry.transaction_type,
      tenure: enquiry.tenure,
      id_verification_status: onboardingData.id_verification?.completed ? "completed" : "not_started",
      source_of_funds_status: onboardingData.source_of_funds?.completed ? "completed" : "not_started",
      aml_review_status: "not_started",
      assigned_admin_id: user.id,
    })
    .select()
    .single()

  if (caseError) {
    return NextResponse.json({ error: caseError.message }, { status: 500 })
  }

  // Update enquiry status
  await adminClient
    .from("enquiries")
    .update({ 
      status: "converted",
      case_reference: caseReference 
    })
    .eq("id", enquiryId)

  // Log activity
  await logActivity({
    enquiryId,
    caseId: newCase.id,
    actorType: "admin",
    actorId: user.id,
    action: "case_created",
    description: `Case ${caseReference} created from enquiry`,
    metadata: { case_reference: caseReference }
  })

  return NextResponse.json(newCase, { status: 201 })
}
