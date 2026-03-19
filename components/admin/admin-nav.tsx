"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role: string
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Cases", href: "/admin/cases", icon: FileText },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminNav({ user, profile }: { user: SupabaseUser; profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-slate-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-200 lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 flex items-center gap-2 text-sm font-semibold leading-6 text-white">
          <Shield className="h-5 w-5 text-emerald-400" />
          HomePanel Admin
        </div>
        <Link href="/admin/settings">
          <span className="sr-only">Your profile</span>
          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
            {profile?.first_name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
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
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center gap-2">
                  <Shield className="h-8 w-8 text-emerald-400" />
                  <span className="font-semibold text-lg text-white">HomePanel Admin</span>
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
                                isActive(item.href)
                                  ? "bg-slate-800 text-white"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800",
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
                      <Link
                        href="/dashboard"
                        className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        Switch to Client View
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-x-3 text-slate-400 hover:text-red-400 hover:bg-slate-800"
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-400" />
            <span className="font-semibold text-lg text-white">HomePanel Admin</span>
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
                          isActive(item.href)
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:text-white hover:bg-slate-800",
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
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-white">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                    {profile?.first_name?.[0]?.toUpperCase() || user.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">
                      {profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : user.email}
                    </span>
                    <span className="block text-xs text-emerald-400">Administrator</span>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-slate-400 hover:text-white hover:bg-slate-800 mb-2"
                >
                  Switch to Client View
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-x-3 text-slate-400 hover:text-red-400 hover:bg-transparent"
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
