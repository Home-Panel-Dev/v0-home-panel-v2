import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: Get correspondence details
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
  let query = adminClient.from("case_correspondence").select("*")

  if (enquiryId) {
    query = query.eq("enquiry_id", enquiryId)
  }
  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    // Table might not exist yet
    return NextResponse.json({ data: null })
  }

  return NextResponse.json({ data })
}

// POST: Save or update correspondence details
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, ...correspondenceData } = body

  const adminClient = createAdminClient()

  // Check if record exists
  let existingQuery = adminClient.from("case_correspondence").select("id")
  if (enquiryId) existingQuery = existingQuery.eq("enquiry_id", enquiryId)
  if (caseId) existingQuery = existingQuery.eq("case_id", caseId)

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing) {
    // Update
    await adminClient
      .from("case_correspondence")
      .update({
        ...correspondenceData,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
  } else {
    // Insert
    await adminClient.from("case_correspondence").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      ...correspondenceData
    })
  }

  return NextResponse.json({ success: true })
}
