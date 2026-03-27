"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
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
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Enquiries", href: "/admin/enquiries", icon: FileText },
  { name: "Firms", href: "/admin/firms", icon: Building2 },
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
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const initials = profile?.first_name 
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ""}`.toUpperCase()
    : user.email?.[0].toUpperCase() || "U"

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center h-14 bg-card border-b border-border px-4 lg:hidden">
        <button
          type="button"
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <img src="/logo.svg" alt="HomePanel" className="w-7 h-7" />
          <span className="font-semibold text-sm">HomePanel</span>
        </div>
      </header>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border">
            <div className="flex items-center justify-between h-14 px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="HomePanel" className="w-7 h-7" />
                <span className="font-semibold text-sm">HomePanel</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3">
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-16 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        <div className="flex flex-col items-center py-4 h-full">
          {/* Logo */}
          <Link href="/admin" className="mb-8">
            <img src="/logo.svg" alt="HomePanel" className="w-9 h-9" />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative p-3 rounded-xl transition-colors group",
                  isActive(item.href)
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.name}</span>
                <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="mt-auto flex flex-col items-center gap-2">
            <Link
              href="/admin/settings"
              className={cn(
                "relative p-3 rounded-xl transition-colors group",
                pathname.startsWith("/admin/settings")
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
              <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                Settings
              </div>
            </Link>
            
            <button
              onClick={handleSignOut}
              className="relative p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign out</span>
              <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                Sign out
              </div>
            </button>

            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-medium mt-2">
              {initials}
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop top bar */}
      <header className="hidden lg:fixed lg:top-0 lg:left-16 lg:right-0 lg:z-30 lg:flex lg:h-16 lg:items-center lg:border-b lg:border-border lg:bg-card lg:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          {pathname !== "/admin" && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              <span className="font-medium">
                {pathname.includes("/enquiries/") ? "Enquiry Details" : 
                 pathname === "/admin/enquiries" ? "Enquiries" :
                 pathname.includes("/firms/") ? "Firm Details" :
                 pathname === "/admin/firms" ? "Firms" :
                 pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </>
          )}
        </nav>
      </header>
    </>
  )
}
