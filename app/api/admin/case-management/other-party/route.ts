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
  let query = adminClient.from("case_other_party").select("*")

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

  // Check if record exists
  let existingQuery = adminClient.from("case_other_party").select("id")
  if (enquiryId) existingQuery = existingQuery.eq("enquiry_id", enquiryId)
  if (caseId) existingQuery = existingQuery.eq("case_id", caseId)

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing) {
    await adminClient
      .from("case_other_party")
      .update({
        ...partyData,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
  } else {
    await adminClient.from("case_other_party").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      ...partyData
    })
  }

  return NextResponse.json({ success: true })
}
