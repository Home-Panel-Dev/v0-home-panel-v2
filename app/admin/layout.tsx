import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { AdminNav } from "@/components/admin/admin-nav"

type ProfileData = {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role: string | null
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const authResult = await supabase.auth.getUser()
  const user = authResult.data.user
  
  if (!user) {
    redirect("/auth/login")
  }

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let profile: ProfileData | null = null
  const { data: profileData, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, email, first_name, last_name, role")
    .eq("id", user.id)
    .single()
  
  if (profileError && profileError.code === "PGRST116") {
    const { data: newProfile } = await adminSupabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        role: "admin"
      })
      .select()
      .single()
    
    profile = newProfile
  } else if (profileData) {
    profile = profileData
  }

  if (!profile || profile.role !== "admin") {
    redirect("/auth/login?error=unauthorized")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav user={user} profile={profile} />
      <main className="lg:pl-16 pt-16">
        <div className="px-6 py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
