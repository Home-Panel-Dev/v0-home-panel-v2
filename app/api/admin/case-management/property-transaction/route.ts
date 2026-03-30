import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: Get property transaction details
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
    let query = adminClient.from("case_property_transaction").select("*")
    if (enquiryId) query = query.eq("enquiry_id", enquiryId)
    if (caseId) query = query.eq("case_id", caseId)

    const { data, error } = await query.maybeSingle()
    if (!error && data) {
      return NextResponse.json({ data })
    }
  } catch {
    // Table doesn't exist
  }

  // Fallback: get from enquiries/cases table using existing columns only
  if (enquiryId) {
    const { data: enquiry, error } = await adminClient
      .from("enquiries")
      .select("property_address, property_postcode, transaction_type, property_value")
      .eq("id", enquiryId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (enquiry) {
      return NextResponse.json({
        data: {
          transaction_type: enquiry.transaction_type || "sale",
          property_details: enquiry.property_address || "",
          amount: enquiry.property_value || 0,
          holding_type: "freehold",
          property_number: "",
          postcode: enquiry.property_postcode || "",
          street_no: "",
          street: "",
          district: "",
          town: "",
          county: ""
        }
      })
    }
  }

  if (caseId) {
    const { data: caseData, error } = await adminClient
      .from("cases")
      .select("property_address, transaction_type, value")
      .eq("id", caseId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (caseData) {
      return NextResponse.json({
        data: {
          transaction_type: caseData.transaction_type || "sale",
          property_details: caseData.property_address || "",
          amount: caseData.value || 0,
          holding_type: "freehold",
          property_number: "",
          postcode: "",
          street_no: "",
          street: "",
          district: "",
          town: "",
          county: ""
        }
      })
    }
  }

  return NextResponse.json({ data: null })
}

// POST: Save property transaction
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, ...transactionData } = body

  const adminClient = createAdminClient()

  // Try dedicated table first
  try {
    let existingQuery = adminClient.from("case_property_transaction").select("id")
    if (enquiryId) existingQuery = existingQuery.eq("enquiry_id", enquiryId)
    if (caseId) existingQuery = existingQuery.eq("case_id", caseId)

    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      await adminClient
        .from("case_property_transaction")
        .update({ ...transactionData, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await adminClient.from("case_property_transaction").insert({
        enquiry_id: enquiryId || null,
        case_id: caseId || null,
        ...transactionData
      })
    }
    return NextResponse.json({ success: true })
  } catch {
    // Table doesn't exist
  }

  // Fallback: save to enquiries/cases using existing columns only
  if (enquiryId) {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }
    if (transactionData.amount !== undefined) updateData.property_value = transactionData.amount
    if (transactionData.property_details) updateData.property_address = transactionData.property_details
    if (transactionData.postcode) updateData.property_postcode = transactionData.postcode
    if (transactionData.transaction_type) updateData.transaction_type = transactionData.transaction_type

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
    if (transactionData.amount !== undefined) updateData.value = transactionData.amount
    if (transactionData.property_details) updateData.property_address = transactionData.property_details
    if (transactionData.transaction_type) updateData.transaction_type = transactionData.transaction_type

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
