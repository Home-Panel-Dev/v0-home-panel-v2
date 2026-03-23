"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function AuthRedirectHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      router.replace(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null
}
