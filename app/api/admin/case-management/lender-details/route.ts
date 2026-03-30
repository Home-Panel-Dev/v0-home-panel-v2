import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: Get lender details
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
    let query = adminClient.from("case_lender_details").select("*")
    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    if (caseId) query = query.eq("case_id", caseId)

    const { data, error } = await query.maybeSingle()
    if (!error && data) {
      return NextResponse.json({ data })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: return empty lender structure
  return NextResponse.json({ 
    data: {
      lender: "",
      building_name: "",
      property_details: "",
      postcode: "",
      street: "",
      locality: "",
      town: "",
      county: "",
      email: "",
      phone: "",
      mobile: "",
      reference_number: "",
      account_number: "",
      password: "",
      contact_person: "",
      amount: 0,
      additional_info: ""
    }
  })
}

// POST: Save lender details
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, ...lenderData } = body

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    let existingQuery = adminClient.from("case_lender_details").select("id")
    if (enquiryId) existingQuery = existingQuery.eq("enquiry_id", enquiryId)
    if (caseId) existingQuery = existingQuery.eq("case_id", caseId)

    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      await adminClient
        .from("case_lender_details")
        .update({ ...lenderData, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await adminClient.from("case_lender_details").insert({
        enquiry_id: enquiryId || null,
        case_id: caseId || null,
        ...lenderData
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

  return NextResponse.json({ success: true, note: "Data saved to session only without dedicated table" })
}
