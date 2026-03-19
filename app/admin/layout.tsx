// Admin Layout - HomePanel Dashboard
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

  // Get user profile - errors are fine if table doesn't exist yet
  let profile = null
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single()
    profile = data
  } catch {
    // profile table may not exist yet
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav user={user!} profile={profile} />
      <main className="lg:pl-16 lg:pt-16">
        <div className="px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
