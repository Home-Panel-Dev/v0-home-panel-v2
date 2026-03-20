import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Home, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <Card className="border-slate-200">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-xl tracking-tight">HomePanel</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight">Check your email</CardTitle>
            <CardDescription>We sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Click the link in your email to confirm your account, then return here to sign in.
            </p>
            <Link href="/auth/login" className="block">
              <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-medium">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
