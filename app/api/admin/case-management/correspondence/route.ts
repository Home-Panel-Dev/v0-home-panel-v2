import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: Get correspondence details - falls back to enquiries/cases table
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
    let query = adminClient.from("case_correspondence").select("*")
    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    if (caseId) query = query.eq("case_id", caseId)

    const { data, error } = await query.maybeSingle()
    if (!error && data) {
      return NextResponse.json({ data })
    }
  } catch {
    // Table doesn't exist, fall through to fallback
  }

  // Fallback: get from enquiries/cases table
  if (enquiryId) {
    const { data: enquiry } = await adminClient
      .from("enquiries")
      .select("property_address, first_name, last_name, email, phone, correspondence_data")
      .eq("id", enquiryId)
      .single()

    if (enquiry) {
      const correspondenceData = enquiry.correspondence_data as Record<string, unknown> || {}
      return NextResponse.json({
        data: {
          // Primary client
          primary_organisation: correspondenceData.primary_organisation || "",
          primary_flat_plot: correspondenceData.primary_flat_plot || "",
          primary_building_name: enquiry.property_address || "",
          primary_street_no: correspondenceData.primary_street_no || "",
          primary_street: correspondenceData.primary_street || "",
          primary_locality: correspondenceData.primary_locality || "",
          primary_post_town: correspondenceData.primary_post_town || "",
          primary_postcode: correspondenceData.primary_postcode || "",
          primary_county: correspondenceData.primary_county || "",
          primary_email: enquiry.email || "",
          primary_phone: enquiry.phone || "",
          primary_mobile: correspondenceData.primary_mobile || "",
          primary_sms_enabled: correspondenceData.primary_sms_enabled || false,
          // Joint client
          joint_organisation: correspondenceData.joint_organisation || "",
          joint_flat_plot: correspondenceData.joint_flat_plot || "",
          joint_building_name: correspondenceData.joint_building_name || "",
          joint_street_no: correspondenceData.joint_street_no || "",
          joint_street: correspondenceData.joint_street || "",
          joint_locality: correspondenceData.joint_locality || "",
          joint_post_town: correspondenceData.joint_post_town || "",
          joint_postcode: correspondenceData.joint_postcode || "",
          joint_county: correspondenceData.joint_county || "",
          joint_email: correspondenceData.joint_email || "",
          joint_phone: correspondenceData.joint_phone || "",
          joint_mobile: correspondenceData.joint_mobile || "",
          joint_same_as_primary: correspondenceData.joint_same_as_primary || false,
        }
      })
    }
  }

  if (caseId) {
    const { data: caseData } = await adminClient
      .from("cases")
      .select("property_address, client_name, client_email, client_phone, correspondence_data")
      .eq("id", caseId)
      .single()

    if (caseData) {
      const correspondenceData = caseData.correspondence_data as Record<string, unknown> || {}
      return NextResponse.json({
        data: {
          primary_building_name: caseData.property_address || "",
          primary_email: caseData.client_email || "",
          primary_phone: caseData.client_phone || "",
          ...correspondenceData
        }
      })
    }
  }

  return NextResponse.json({ data: null })
}

// POST: Save correspondence details
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, ...correspondenceData } = body

  const adminClient = createAdminClient()

  // Try to save to dedicated table first
  try {
    let existingQuery = adminClient.from("case_correspondence").select("id")
    if (enquiryId) existingQuery = existingQuery.eq("enquiry_id", enquiryId)
    if (caseId) existingQuery = existingQuery.eq("case_id", caseId)

    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      await adminClient
        .from("case_correspondence")
        .update({ ...correspondenceData, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await adminClient.from("case_correspondence").insert({
        enquiry_id: enquiryId || null,
        case_id: caseId || null,
        ...correspondenceData
      })
    }
    return NextResponse.json({ success: true })
  } catch {
    // Table doesn't exist, use fallback
  }

  // Fallback: save to enquiries/cases correspondence_data JSON column
  if (enquiryId) {
    await adminClient
      .from("enquiries")
      .update({ 
        correspondence_data: correspondenceData,
        email: correspondenceData.primary_email || undefined,
        phone: correspondenceData.primary_phone || undefined,
        updated_at: new Date().toISOString()
      })
      .eq("id", enquiryId)
  }

  if (caseId) {
    await adminClient
      .from("cases")
      .update({ 
        correspondence_data: correspondenceData,
        client_email: correspondenceData.primary_email || undefined,
        client_phone: correspondenceData.primary_phone || undefined,
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId)
  }

  return NextResponse.json({ success: true })
}
