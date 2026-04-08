import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"
import { AppError, ErrorCodes, handleError, successResponse } from "@/lib/errors"

// Allowed admin roles for enquiries access
const ALLOWED_ROLES = ["super_admin", "admin", "operations", "compliance"]

export async function GET() {
  try {
    // Verify admin auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new AppError(ErrorCodes.UNAUTHORIZED)
    }

    const adminClient = createAdminClient()
    
    // Verify user has appropriate role
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single()
    
    if (!profile || !profile.is_active) {
      throw new AppError(ErrorCodes.FORBIDDEN, "Account is inactive")
    }
    
    if (!ALLOWED_ROLES.includes(profile.role)) {
      throw new AppError(ErrorCodes.FORBIDDEN)
    }

    // Fetch all enquiries
    const { data: enquiries, error } = await adminClient
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[admin/enquiries] Database error:", error)
      throw new AppError(ErrorCodes.DATABASE_ERROR, error.message)
    }

    return NextResponse.json(enquiries || [])
  } catch (error) {
    const { response, statusCode, logData } = handleError(error)
    console.error("[admin/enquiries] Error:", logData)
    return NextResponse.json(response, { status: statusCode })
  }
}
