import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// POST: Create or update a template
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: firmId } = await params
    const body = await request.json()
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

    // Upsert template
    const { data: template, error } = await adminClient
      .from("firm_templates")
      .upsert({
        firm_id: firmId,
        template_type: body.template_type,
        name: body.name,
        subject: body.subject || null,
        html_content: body.html_content || null,
        text_content: body.text_content || null,
        variables: body.variables || [],
        is_active: body.is_active !== false,
      }, {
        onConflict: "firm_id,template_type"
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to save template:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Template POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
