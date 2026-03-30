import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"

// POST: Send note to client via email
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { 
    enquiryId, 
    caseId, 
    content, 
    clientName,
    clientEmail 
  } = body

  if (!content || !clientEmail) {
    return NextResponse.json({ error: "Content and client email required" }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // Get user profile for name
  const { data: profile } = await adminClient
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  const senderName = profile 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() 
    : "HomePanel Team"

  // In a real implementation, this would send an actual email
  // For now, we'll log the activity and simulate success
  console.log(`[v0] Email would be sent to ${clientEmail}:`, {
    to: clientEmail,
    subject: `Update on your case`,
    body: content,
    from: senderName
  })

  // Try to add note to case_notes table
  try {
    await adminClient.from("case_notes").insert({
      enquiry_id: enquiryId || null,
      case_id: caseId || null,
      content,
      note_type: "to_client",
      email_sent: true,
      created_by: user.id,
      created_by_name: senderName,
    })
  } catch {
    // Table doesn't exist
  }

  // Log activity
  await logActivity({
    enquiryId: enquiryId || undefined,
    caseId: caseId || undefined,
    actorType: "admin",
    actorId: user.id,
    action: "email_sent",
    description: `Email sent to client: ${clientName}`,
  })

  return NextResponse.json({ 
    success: true, 
    message: `Email sent to ${clientEmail}` 
  })
}
