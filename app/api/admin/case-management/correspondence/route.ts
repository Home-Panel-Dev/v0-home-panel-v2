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

  // Fallback: get from enquiries/cases table using existing columns only
  if (enquiryId) {
    const { data: enquiry, error } = await adminClient
      .from("enquiries")
      .select("property_address, property_postcode, first_name, last_name, email, phone, mobile")
      .eq("id", enquiryId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (enquiry) {
      return NextResponse.json({
        data: {
          // Primary client - using existing enquiry fields
          primary_organisation: "",
          primary_flat_plot: "",
          primary_building_name: enquiry.property_address || "",
          primary_street_no: "",
          primary_street: "",
          primary_locality: "",
          primary_post_town: "",
          primary_postcode: enquiry.property_postcode || "",
          primary_county: "",
          primary_email: enquiry.email || "",
          primary_phone: enquiry.phone || "",
          primary_mobile: enquiry.mobile || "",
          primary_sms_enabled: false,
          // Joint client - empty by default
          joint_organisation: "",
          joint_flat_plot: "",
          joint_building_name: "",
          joint_street_no: "",
          joint_street: "",
          joint_locality: "",
          joint_post_town: "",
          joint_postcode: "",
          joint_county: "",
          joint_email: "",
          joint_phone: "",
          joint_mobile: "",
          joint_same_as_primary: false,
        }
      })
    }
  }

  if (caseId) {
    const { data: caseData, error } = await adminClient
      .from("cases")
      .select("property_address, client_name, client_email, client_phone")
      .eq("id", caseId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (caseData) {
      return NextResponse.json({
        data: {
          primary_building_name: caseData.property_address || "",
          primary_email: caseData.client_email || "",
          primary_phone: caseData.client_phone || "",
          primary_organisation: "",
          primary_flat_plot: "",
          primary_street_no: "",
          primary_street: "",
          primary_locality: "",
          primary_post_town: "",
          primary_postcode: "",
          primary_county: "",
          primary_mobile: "",
          primary_sms_enabled: false,
          joint_organisation: "",
          joint_flat_plot: "",
          joint_building_name: "",
          joint_street_no: "",
          joint_street: "",
          joint_locality: "",
          joint_post_town: "",
          joint_postcode: "",
          joint_county: "",
          joint_email: "",
          joint_phone: "",
          joint_mobile: "",
          joint_same_as_primary: false,
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

  // Fallback: save to enquiries/cases using existing columns only
  if (enquiryId) {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }
    if (correspondenceData.primary_email) updateData.email = correspondenceData.primary_email
    if (correspondenceData.primary_phone) updateData.phone = correspondenceData.primary_phone
    if (correspondenceData.primary_mobile) updateData.mobile = correspondenceData.primary_mobile
    if (correspondenceData.primary_building_name) updateData.property_address = correspondenceData.primary_building_name
    if (correspondenceData.primary_postcode) updateData.property_postcode = correspondenceData.primary_postcode

    const { error } = await adminClient
      .from("enquiries")
      .update(updateData)
      .eq("id", enquiryId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (caseId) {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }
    if (correspondenceData.primary_email) updateData.client_email = correspondenceData.primary_email
    if (correspondenceData.primary_phone) updateData.client_phone = correspondenceData.primary_phone
    if (correspondenceData.primary_building_name) updateData.property_address = correspondenceData.primary_building_name

    const { error } = await adminClient
      .from("cases")
      .update(updateData)
      .eq("id", caseId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
