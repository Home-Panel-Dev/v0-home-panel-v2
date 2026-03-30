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

  // Fallback: get from enquiries/cases table
  if (enquiryId) {
    const { data: enquiry } = await adminClient
      .from("enquiries")
      .select("property_address, transaction_type, property_value, property_transaction_data")
      .eq("id", enquiryId)
      .single()

    if (enquiry) {
      const txData = enquiry.property_transaction_data as Record<string, unknown> || {}
      return NextResponse.json({
        data: {
          transaction_type: enquiry.transaction_type || "sale",
          property_details: enquiry.property_address || "",
          amount: enquiry.property_value || 0,
          holding_type: txData.holding_type || "freehold",
          property_number: txData.property_number || "",
          postcode: txData.postcode || "",
          street_no: txData.street_no || "",
          street: txData.street || "",
          district: txData.district || "",
          town: txData.town || "",
          county: txData.county || "",
          ...txData
        }
      })
    }
  }

  if (caseId) {
    const { data: caseData } = await adminClient
      .from("cases")
      .select("property_address, transaction_type, value, property_transaction_data")
      .eq("id", caseId)
      .single()

    if (caseData) {
      const txData = caseData.property_transaction_data as Record<string, unknown> || {}
      return NextResponse.json({
        data: {
          transaction_type: caseData.transaction_type || "sale",
          property_details: caseData.property_address || "",
          amount: caseData.value || 0,
          ...txData
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

  // Fallback: save to enquiries/cases
  if (enquiryId) {
    await adminClient
      .from("enquiries")
      .update({ 
        property_transaction_data: transactionData,
        property_value: transactionData.amount || undefined,
        updated_at: new Date().toISOString()
      })
      .eq("id", enquiryId)
  }

  if (caseId) {
    await adminClient
      .from("cases")
      .update({ 
        property_transaction_data: transactionData,
        value: transactionData.amount || undefined,
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId)
  }

  return NextResponse.json({ success: true })
}
