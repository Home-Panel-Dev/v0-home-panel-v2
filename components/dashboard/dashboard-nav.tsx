"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  FileText,
  Upload,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  CheckCircle,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "My Case", href: "/dashboard/case", icon: FileText },
  { name: "Onboarding", href: "/dashboard/onboarding", icon: CheckCircle },
  { name: "Documents", href: "/dashboard/documents", icon: Upload },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role: string
}

export function DashboardNav({ user, profile }: { user: SupabaseUser; profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4  sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-700 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-slate-900">
          HomePanel
        </div>
        <Link href="/dashboard/settings">
          <span className="sr-only">Your profile</span>
          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
            {user.email?.[0].toUpperCase()}
          </div>
        </Link>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <img src="/logo.svg" alt="HomePanel" className="h-8 w-8" />
                  <span className="ml-2 font-semibold text-lg">HomePanel</span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                pathname === item.href
                                  ? "bg-slate-50 text-emerald-600"
                                  : "text-slate-700 hover:text-emerald-600 hover:bg-slate-50",
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                              )}
                            >
                              <item.icon className="h-6 w-6 shrink-0" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-x-3 text-slate-700 hover:text-red-600"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-6 w-6" />
                        Sign out
                      </Button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img src="/logo.svg" alt="HomePanel" className="h-8 w-8" />
            <span className="ml-2 font-semibold text-lg">HomePanel</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          pathname === item.href
                            ? "bg-slate-50 text-emerald-600"
                            : "text-slate-700 hover:text-emerald-600 hover:bg-slate-50",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-slate-900">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                    {profile?.first_name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
                  </div>
                  <span className="truncate">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : user.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-x-3 text-slate-700 hover:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-6 w-6" />
                  Sign out
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}
