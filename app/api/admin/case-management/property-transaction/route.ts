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
  let query = adminClient.from("case_property_transaction").select("*")

  if (enquiryId) {
    query = query.eq("enquiry_id", enquiryId)
  }
  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    return NextResponse.json({ data: null })
  }

  return NextResponse.json({ data })
}

// POST: Save or update property transaction
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, ...transactionData } = body

  const adminClient = createAdminClient()

  // Check if record exists
  let existingQuery = adminClient.from("case_property_transaction").select("id")
  if (enquiryId) existingQuery = existingQuery.eq("enquiry_id", enquiryId)
  if (caseId) existingQuery = existingQuery.eq("case_id", caseId)

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing) {
    await adminClient
      .from("case_property_transaction")
      .update({
        ...transactionData,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
  } else {
    await adminClient.from("case_property_transaction").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      ...transactionData
    })
  }

  return NextResponse.json({ success: true })
}
