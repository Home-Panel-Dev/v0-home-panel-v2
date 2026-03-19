import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This route creates an admin user - should only be called once during setup
// Delete this file after creating the admin user for security

export async function POST(request: Request) {
  const { secret } = await request.json()
  
  // Simple protection - require a secret to create admin
  if (secret !== "create-homepanel-admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Missing Supabase credentials" },
      { status: 500 }
    )
  }

  // Use service role client to create admin user
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const email = "joshua@madebymclean.com"
  const password = "admin"

  try {
    // Create the user via admin API
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: "Joshua",
        last_name: "Admin",
      },
    })

    if (createError) {
      // If user already exists, try to update their profile instead
      if (createError.message.includes("already been registered")) {
        // Get user by email
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email === email)
        
        if (existingUser) {
          // Update their profile to admin
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: existingUser.id,
              email: email,
              first_name: "Joshua",
              last_name: "Admin",
              role: "admin",
            })

          if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 })
          }

          return NextResponse.json({
            success: true,
            message: "Existing user updated to admin role",
            userId: existingUser.id,
          })
        }
      }
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Create admin profile
    if (userData.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userData.user.id,
        email: email,
        first_name: "Joshua",
        last_name: "Admin",
        role: "admin",
      })

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId: userData.user?.id,
      email: email,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
