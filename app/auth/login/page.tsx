'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('You do not have admin access.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/admin')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-12">
        <img src="/logo.svg" alt="HomePanel" className="w-9 h-9" />
        <span className="text-lg font-semibold tracking-tight">HomePanel</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-background border-border"
            autoComplete="email"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 bg-background border-border"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-medium" 
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need an account?{' '}
        <Link href="/auth/sign-up" className="text-foreground hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <Suspense fallback={<div className="w-full max-w-sm h-96 animate-pulse bg-muted rounded-lg" />}>
          <LoginForm />
        </Suspense>
      </div>
      
      {/* Right side - Visual (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-3">Streamline your conveyancing</h2>
          <p className="text-muted-foreground leading-relaxed">
            Manage quote requests, track client onboarding, and deliver exceptional service from one unified dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}
