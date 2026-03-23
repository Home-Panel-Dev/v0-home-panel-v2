import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient, logActivity } from "@/lib/database"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminClient = createAdminClient()
    
    // Verify admin role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { documentId, decision, notes } = await request.json()
    
    if (!documentId || !decision) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the document
    const { data: doc, error: docError } = await adminClient
      .from("documents")
      .select("id, file_name, document_type, enquiry_id, case_id")
      .eq("id", documentId)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Update the document
    const { error: updateError } = await adminClient
      .from("documents")
      .update({
        review_status: decision,
        review_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", documentId)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
    }

    // Log activity
    await logActivity({
      enquiryId: doc.enquiry_id,
      caseId: doc.case_id,
      actorType: "admin",
      actorId: user.id,
      action: "document_reviewed",
      description: `Document ${doc.file_name} ${decision}`,
      metadata: { document_type: doc.document_type, decision }
    })

    // If replacement requested, send notification email
    if (decision === "replacement_requested" && doc.enquiry_id && process.env.RESEND_API_KEY) {
      // Get enquiry for client email
      const { data: enquiry } = await adminClient
        .from("enquiries")
        .select("email, first_name")
        .eq("id", doc.enquiry_id)
        .single()

      if (enquiry?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
          || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
          || "https://v0-home-panel-v2.vercel.app"

        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "HomePanel <noreply@resend.dev>",
            to: enquiry.email,
            subject: "Document Replacement Required - HomePanel",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="width: 48px; height: 48px; background: #1a1a1a; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </div>
                </div>
                
                <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px 0; text-align: center;">
                  Document Replacement Required
                </h1>
                
                <p style="color: #666; margin: 0 0 24px 0; text-align: center;">
                  Hi ${enquiry.first_name}, we need you to upload a replacement document.
                </p>
                
                <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Document</p>
                  <p style="margin: 0; font-weight: 600;">${doc.file_name}</p>
                  ${notes ? `<p style="margin: 16px 0 0 0; font-size: 14px; color: #666;">Notes: ${notes}</p>` : ""}
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                  If you have any questions, please contact your conveyancer.
                </p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error("Email error:", emailError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Document review error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
