"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  ShieldCheck, 
  Camera, 
  CreditCard, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Smartphone
} from "lucide-react"

type VerificationStep = "intro" | "document" | "selfie" | "processing" | "complete"

export default function YotiVerificationPage() {
  const router = useRouter()
  const [step, setStep] = useState<VerificationStep>("intro")
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (step === "processing") {
      // Simulate verification processing
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setStep("complete"), 500)
            return 100
          }
          return prev + 10
        })
      }, 300)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleComplete = async () => {
    // Update onboarding progress in database
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: cases } = await supabase
        .from("cases")
        .select("id")
        .eq("client_id", user.id)
        .limit(1)

      if (cases && cases.length > 0) {
        await supabase
          .from("onboarding_progress")
          .update({
            id_verification_status: "completed",
            id_verification_provider: "yoti",
            id_verification_date: new Date().toISOString(),
          })
          .eq("case_id", cases[0].id)
      }
    }
    router.push("/dashboard/onboarding?step=source-of-funds")
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/onboarding")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Onboarding
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Yoti ID Verification</h1>
              <p className="text-sm text-slate-600">Secure identity verification</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="pt-6">
            {step === "intro" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Verify Your Identity</h2>
                  <p className="text-slate-600">
                    This is a simulation of the Yoti verification process. In production, 
                    you would be redirected to Yoti's secure platform.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 text-left">
                  <h3 className="font-medium mb-3">What you'll need:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      A valid ID document (passport or driving licence)
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Camera className="h-4 w-4 text-slate-400" />
                      A device with a camera for selfie verification
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                      Good lighting conditions
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={() => setStep("document")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Start Verification
                </Button>
              </div>
            )}

            {step === "document" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                  <CreditCard className="h-10 w-10 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Scan Your ID Document</h2>
                  <p className="text-slate-600">
                    Position your passport or driving licence in the frame.
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 bg-slate-50">
                  <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Camera preview would appear here</p>
                </div>

                <p className="text-xs text-slate-500">
                  Demo mode: Click the button below to simulate document capture
                </p>

                <Button 
                  onClick={() => setStep("selfie")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Document Captured
                </Button>
              </div>
            )}

            {step === "selfie" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                  <Camera className="h-10 w-10 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Take a Selfie</h2>
                  <p className="text-slate-600">
                    We need to match your face to your ID document.
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-full w-48 h-48 mx-auto flex items-center justify-center bg-slate-50">
                  <Camera className="h-16 w-16 text-slate-300" />
                </div>

                <p className="text-xs text-slate-500">
                  Demo mode: Click the button below to simulate selfie capture
                </p>

                <Button 
                  onClick={() => setStep("processing")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Capture Selfie
                </Button>
              </div>
            )}

            {step === "processing" && (
              <div className="text-center space-y-6 py-8">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
                <div>
                  <h2 className="text-lg font-semibold mb-2">Verifying Your Identity</h2>
                  <p className="text-slate-600">
                    Please wait while we verify your documents...
                  </p>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-slate-500">{progress}% complete</p>
              </div>
            )}

            {step === "complete" && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Identity Verified</h2>
                  <p className="text-slate-600">
                    Your identity has been successfully verified using Yoti.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-700">
                    Your verification is complete. You can now proceed with the next step.
                  </p>
                </div>

                <Button 
                  onClick={handleComplete}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue to Source of Funds
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust badges */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">Powered by</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-slate-600">Yoti</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">Practice Guide 81 Compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}
