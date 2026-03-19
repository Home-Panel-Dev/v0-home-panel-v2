"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Home,
  Plus,
  Search,
  Building2,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
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
  { name: "New", href: "/admin/new", icon: Plus },
  { name: "Search", href: "/admin/search", icon: Search },
  { name: "Cases", href: "/admin/cases", icon: Building2 },
  { name: "Calendar", href: "/admin/calendar", icon: Calendar },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
]

const bottomNavigation = [
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminNav({ user, profile }: { user: SupabaseUser; profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

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

  const initials = profile?.first_name 
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ""}`.toUpperCase()
    : user.email?.[0].toUpperCase() || "U"

  return (
    <>
      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-white border-b border-slate-200 px-4 py-3 lg:hidden">
        <button
          type="button"
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-slate-50 border-slate-200 h-9"
            />
          </div>
        </div>
        <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-sm font-medium">
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-[280px] flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" className="p-2" onClick={() => setMobileMenuOpen(false)}>
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex grow flex-col bg-white">
                <div className="flex h-16 items-center px-4 border-b border-slate-200">
                  <img src="/logo.svg" alt="HomePanel" className="h-8 w-8" />
                  <span className="ml-2 font-semibold">HomePanel</span>
                </div>
                <nav className="flex-1 px-3 py-4">
                  <ul className="space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-slate-900 text-white"
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="border-t border-slate-200 p-3">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar - icon only */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-16 lg:flex-col">
        <div className="flex grow flex-col items-center bg-white border-r border-slate-200/60 py-4">
          {/* Logo */}
          <Link href="/admin" className="mb-6">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <img src="/logo.svg" alt="HomePanel" className="h-6 w-6 invert" />
            </div>
          </Link>

          {/* Main navigation */}
          <nav className="flex-1 flex flex-col items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 group relative",
                  isActive(item.href)
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.name}</span>
                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>

          {/* Bottom navigation */}
          <div className="flex flex-col items-center gap-1 mt-auto">
            {/* More menu */}
            <button className="p-3 rounded-xl text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all duration-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="4" cy="10" r="1.5" />
                <circle cx="10" cy="10" r="1.5" />
                <circle cx="16" cy="10" r="1.5" />
              </svg>
            </button>

            {bottomNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "p-3 rounded-xl transition-all duration-200 group relative",
                  isActive(item.href)
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.name}</span>
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                </div>
              </Link>
            ))}

            {/* User avatar */}
            <Link href="/admin/settings" className="mt-3 group relative">
              <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white shadow-md">
                {initials}
              </div>
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {profile?.first_name || "Account"}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop top bar */}
      <div className="hidden lg:fixed lg:top-0 lg:left-16 lg:right-0 lg:z-40 lg:flex lg:h-16 lg:items-center lg:gap-6 lg:bg-white lg:border-b lg:border-slate-200/60 lg:px-8">
        <h1 className="text-base font-semibold tracking-tight text-slate-900">Dashboard</h1>
        
        {/* Search */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search..." 
              className="pl-10 pr-14 bg-slate-100 border-0 h-10 rounded-full text-sm focus-visible:ring-2 focus-visible:ring-slate-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200 font-medium">
              ⌘K
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Theme toggle */}
          <button 
            className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* New Instruction button */}
          <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-5 ml-2 font-medium shadow-sm text-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Instruction
          </Button>
        </div>
      </div>
    </>
  )
}
