import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/admin"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // Check if user needs to reset password by looking at the session
      // Supabase sets a specific aal level for recovery flows
      const { data: userData } = await supabase.auth.getUser()
      
      // If user just did password recovery, redirect to reset page
      // We detect this by checking if user.recovery_sent_at exists and is recent
      if (userData?.user?.recovery_sent_at) {
        const recoverySentAt = new Date(userData.user.recovery_sent_at)
        const now = new Date()
        const diffMinutes = (now.getTime() - recoverySentAt.getTime()) / (1000 * 60)
        
        // If recovery was sent within last 30 minutes, assume this is a password reset
        if (diffMinutes < 30) {
          return NextResponse.redirect(new URL("/auth/reset-password", requestUrl.origin))
        }
      }
      
      // Otherwise redirect to admin or specified next URL
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(new URL("/auth/login?error=auth_error", requestUrl.origin))
}
