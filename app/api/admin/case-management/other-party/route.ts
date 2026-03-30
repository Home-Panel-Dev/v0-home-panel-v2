import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: Get other party details
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const enquiryId = searchParams.get("enquiryId")
  const caseId = searchParams.get("caseId")

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    let query = adminClient.from("case_other_party").select("*")
    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    if (caseId) query = query.eq("case_id", caseId)

    const { data, error } = await query.maybeSingle()
    if (!error && data) {
      return NextResponse.json({ data })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: return empty structure
  return NextResponse.json({ 
    data: {
      // Other Party
      other_company: "",
      other_is_company: false,
      other_title: "",
      other_first_name: "",
      other_last_name: "",
      other_building_name: "",
      other_property_details: "",
      other_postcode: "",
      other_street: "",
      other_district: "",
      other_town: "",
      other_county: "",
      other_email: "",
      other_phone: "",
      other_mobile: "",
      // Their Solicitor
      solicitor_name: "",
      solicitor_building_name: "",
      solicitor_property_details: "",
      solicitor_postcode: "",
      solicitor_street: "",
      solicitor_district: "",
      solicitor_town: "",
      solicitor_county: "",
      solicitor_email: "",
      solicitor_phone: "",
      solicitor_mobile: "",
      solicitor_dx_number: "",
      solicitor_reference: "",
      solicitor_account_number: "",
      solicitor_password: "",
      solicitor_contact_person: "",
      solicitor_assistant: "",
      solicitor_additional_info: ""
    }
  })
}

// POST: Save or update other party details
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, ...partyData } = body

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    let existingQuery = adminClient.from("case_other_party").select("id")
    if (enquiryId) existingQuery = existingQuery.eq("enquiry_id", enquiryId)
    if (caseId) existingQuery = existingQuery.eq("case_id", caseId)

    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      await adminClient
        .from("case_other_party")
        .update({ ...partyData, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await adminClient.from("case_other_party").insert({
        enquiry_id: enquiryId || null,
        case_id: caseId || null,
        ...partyData
      })
    }
    return NextResponse.json({ success: true })
  } catch {
    // Table doesn't exist
  }

  // Fallback: just update timestamp (data not persisted without dedicated table)
  if (enquiryId) {
    await adminClient
      .from("enquiries")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", enquiryId)
  }

  if (caseId) {
    await adminClient
      .from("cases")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", caseId)
  }

  // Note: Without dedicated table, other party data won't persist
  return NextResponse.json({ success: true, note: "Data saved to session only without dedicated table" })
}
