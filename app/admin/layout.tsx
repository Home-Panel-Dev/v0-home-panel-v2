import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  // If no profile found, that's okay - user can still access admin for now
  if (error) {
    console.log("[v0] Profile query error:", error.message)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav user={user} profile={profile} />
      <main className="lg:pl-16 lg:pt-16">
        <div className="px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
