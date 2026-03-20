import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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

  // Fetch profile data and check admin role
  let profile: ProfileData | null = null
  const profileResult = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, role")
    .eq("id", user.id)
    .single()
  
  if (profileResult.data) {
    profile = profileResult.data
  }

  // Check if user has admin role
  if (!profile || profile.role !== "admin") {
    redirect("/auth/login?error=unauthorized")
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AdminNav user={user} profile={profile} />
      <main className="lg:pl-16 lg:pt-16">
        <div className="px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
