"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Banknote, 
  Building2, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  Lock,
  Shield,
  Eye
} from "lucide-react"

type VerificationStep = "intro" | "select-bank" | "consent" | "connecting" | "analyzing" | "complete"

const mockBanks = [
  { id: "barclays", name: "Barclays", logo: "B" },
  { id: "hsbc", name: "HSBC", logo: "H" },
  { id: "lloyds", name: "Lloyds Bank", logo: "L" },
  { id: "natwest", name: "NatWest", logo: "N" },
  { id: "santander", name: "Santander", logo: "S" },
  { id: "nationwide", name: "Nationwide", logo: "N" },
]

export default function ArmalytixVerificationPage() {
  const router = useRouter()
  const [step, setStep] = useState<VerificationStep>("intro")
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (step === "connecting" || step === "analyzing") {
      const targetProgress = step === "connecting" ? 50 : 100
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= targetProgress) {
            clearInterval(interval)
            if (step === "connecting") {
              setTimeout(() => {
                setStep("analyzing")
              }, 500)
            } else {
              setTimeout(() => setStep("complete"), 500)
            }
            return targetProgress
          }
          return prev + 5
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleComplete = async () => {
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
            source_of_funds_status: "completed",
            source_of_funds_provider: "armalytix",
            source_of_funds_date: new Date().toISOString(),
            aml_check_status: "completed",
            aml_check_date: new Date().toISOString(),
          })
          .eq("case_id", cases[0].id)
      }
    }
    router.push("/dashboard/onboarding?step=documents")
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
            <div className="p-2 rounded-lg bg-green-100">
              <Banknote className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Armalytix Source of Funds</h1>
              <p className="text-sm text-slate-600">Bank verification & AML check</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="pt-6">
            {step === "intro" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <Banknote className="h-10 w-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Verify Source of Funds</h2>
                  <p className="text-slate-600">
                    Armalytix securely connects to your bank to verify your source of funds 
                    for Anti-Money Laundering compliance.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">Read-only access</h3>
                      <p className="text-xs text-slate-600">
                        We can only view your transactions, never move money
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">FCA Regulated</h3>
                      <p className="text-xs text-slate-600">
                        Armalytix is authorised by the Financial Conduct Authority
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-sm">Secure & Encrypted</h3>
                      <p className="text-xs text-slate-600">
                        Bank-level security protects your data
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep("select-bank")}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Connect Your Bank
                </Button>
              </div>
            )}

            {step === "select-bank" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold mb-2">Select Your Bank</h2>
                  <p className="text-slate-600 text-sm">
                    Choose your bank to begin the secure connection process.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {mockBanks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={`p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                        selectedBank === bank.id
                          ? "border-green-500 bg-green-50"
                          : "border-slate-200 hover:border-green-300"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-600">{bank.logo}</span>
                      </div>
                      <span className="text-sm font-medium">{bank.name}</span>
                    </button>
                  ))}
                </div>

                <Button 
                  onClick={() => setStep("consent")}
                  disabled={!selectedBank}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Continue
                </Button>
              </div>
            )}

            {step === "consent" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-slate-600" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Confirm Access</h2>
                  <p className="text-slate-600 text-sm">
                    You're about to share your bank data with Armalytix for verification purposes.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-sm">Armalytix will access:</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Account holder name
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Transaction history (12 months)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Account balance
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Demo mode: This simulates the bank authorization flow
                </p>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setStep("select-bank")}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep("connecting")}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Authorize
                  </Button>
                </div>
              </div>
            )}

            {(step === "connecting" || step === "analyzing") && (
              <div className="text-center space-y-6 py-8">
                <Loader2 className="h-16 w-16 text-green-600 animate-spin mx-auto" />
                <div>
                  <h2 className="text-lg font-semibold mb-2">
                    {step === "connecting" ? "Connecting to Your Bank" : "Analyzing Transactions"}
                  </h2>
                  <p className="text-slate-600">
                    {step === "connecting" 
                      ? "Establishing secure connection..."
                      : "Verifying source of funds..."}
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
                  <h2 className="text-lg font-semibold mb-2">Verification Complete</h2>
                  <p className="text-slate-600">
                    Your source of funds has been verified and AML checks are complete.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700">Source of Funds</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700">AML Check</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Passed
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleComplete}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue to Documents
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust badges */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-2">Powered by</p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm font-medium text-slate-600">Armalytix</span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">FCA Authorised</span>
          </div>
        </div>
      </div>
    </div>
  )
}
