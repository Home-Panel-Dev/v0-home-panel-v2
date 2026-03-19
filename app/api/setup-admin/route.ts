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
    // First, create the profiles table if it doesn't exist using raw SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'client',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_select_own') THEN
          CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
          CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
          CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
        END IF;
      END $$;
    `
    
    // Execute raw SQL using postgres connection
    const postgresUrl = process.env.POSTGRES_URL
    if (postgresUrl) {
      const { Pool } = await import('pg')
      const pool = new Pool({ connectionString: postgresUrl })
      try {
        await pool.query(createTableSQL)
      } catch (sqlError) {
        console.log("[v0] Table may already exist:", sqlError)
      } finally {
        await pool.end()
      }
    }

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
