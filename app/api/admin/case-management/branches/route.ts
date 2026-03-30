import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"

// GET: List branches and their users
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminClient = createAdminClient()

  // Try to get branches from dedicated tables
  try {
    const { data: branches, error: branchError } = await adminClient
      .from("branches")
      .select("*")
      .order("name")

    if (!branchError && branches) {
      // Get users for each branch
      const branchesWithUsers = await Promise.all(
        branches.map(async (branch) => {
          const { data: branchUsers } = await adminClient
            .from("branch_users")
            .select("user_id, user_name, role")
            .eq("branch_id", branch.id)

          return {
            ...branch,
            users: branchUsers || []
          }
        })
      )

      return NextResponse.json({ branches: branchesWithUsers })
    }
  } catch {
    // Tables don't exist
  }

  // Fallback: get from firms table (treat firms as branches)
  try {
    const { data: firms } = await adminClient
      .from("firms")
      .select("id, name, email, phone")
      .order("name")

    if (firms) {
      const branches = firms.map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
        phone: f.phone,
        users: []
      }))
      return NextResponse.json({ branches })
    }
  } catch {
    // firms table doesn't exist either
  }

  // Final fallback: return admin users as pseudo-branches
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("role", "admin")

  const branches = [{
    id: "default",
    name: "Main Office",
    users: (profiles || []).map(p => ({
      user_id: p.id,
      user_name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email,
      role: "admin"
    }))
  }]

  return NextResponse.json({ branches })
}

// POST: Update branch assignment for an enquiry/case
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { enquiryId, caseId, branchId, branchUserId } = body

  const adminClient = createAdminClient()

  // Get branch and user names for display
  let branchName = ""
  let userName = ""

  try {
    if (branchId && branchId !== "default") {
      const { data: branch } = await adminClient
        .from("branches")
        .select("name")
        .eq("id", branchId)
        .single()
      branchName = branch?.name || ""
    }
  } catch {
    // Try firms table
    try {
      const { data: firm } = await adminClient
        .from("firms")
        .select("name")
        .eq("id", branchId)
        .single()
      branchName = firm?.name || ""
    } catch {
      branchName = "Main Office"
    }
  }

  if (branchUserId) {
    const { data: profile } = await adminClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", branchUserId)
      .single()
    userName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : ""
  }

  // Update enquiry or case
  if (enquiryId) {
    await adminClient
      .from("enquiries")
      .update({
        branch_id: branchId,
        branch_user_id: branchUserId,
        branch_name: branchName,
        branch_user_name: userName,
        updated_at: new Date().toISOString()
      })
      .eq("id", enquiryId)
  }

  if (caseId) {
    await adminClient
      .from("cases")
      .update({
        branch_id: branchId,
        branch_user_id: branchUserId,
        branch_name: branchName,
        branch_user_name: userName,
        updated_at: new Date().toISOString()
      })
      .eq("id", caseId)
  }

  return NextResponse.json({ success: true, branchName, userName })
}
