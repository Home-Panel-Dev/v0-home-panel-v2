"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  ShieldCheck, 
  Banknote, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ExternalLink
} from "lucide-react"

type OnboardingStep = "id-verification" | "source-of-funds" | "documents" | "complete"

interface OnboardingProgress {
  id: string
  case_id: string
  id_verification_status: string
  source_of_funds_status: string
  documents_status: string
  aml_check_status: string
}

interface Case {
  id: string
  property_address: string | null
  transaction_type: string
  onboarding_progress: OnboardingProgress[]
}

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("id-verification")
  const [activeCase, setActiveCase] = useState<Case | null>(null)
  const [onboarding, setOnboarding] = useState<OnboardingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const step = searchParams.get("step") as OnboardingStep
    if (step && ["id-verification", "source-of-funds", "documents", "complete"].includes(step)) {
      setCurrentStep(step)
    }
    loadData()
  }, [searchParams])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: cases } = await supabase
      .from("cases")
      .select(`*, onboarding_progress (*)`)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (cases && cases.length > 0) {
      setActiveCase(cases[0])
      setOnboarding(cases[0].onboarding_progress?.[0] || null)
    }
    setLoading(false)
  }

  const calculateProgress = () => {
    if (!onboarding) return 0
    let completed = 0
    if (onboarding.id_verification_status === "completed") completed++
    if (onboarding.source_of_funds_status === "completed") completed++
    if (onboarding.documents_status === "completed") completed++
    return Math.round((completed / 3) * 100)
  }

  const handleStartVerification = async (type: "yoti" | "armalytix") => {
    setProcessing(true)
    // Simulate verification process - in production this would redirect to the provider
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (type === "yoti") {
      router.push("/dashboard/onboarding/yoti")
    } else {
      router.push("/dashboard/onboarding/armalytix")
    }
  }

  const steps = [
    {
      id: "id-verification",
      title: "ID Verification",
      description: "Verify your identity using Yoti's secure platform",
      icon: ShieldCheck,
      status: onboarding?.id_verification_status || "pending",
    },
    {
      id: "source-of-funds",
      title: "Source of Funds",
      description: "Connect your bank account via Armalytix",
      icon: Banknote,
      status: onboarding?.source_of_funds_status || "pending",
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Submit required property documents",
      icon: FileText,
      status: onboarding?.documents_status || "pending",
    },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!activeCase) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium mb-2">No active case</h3>
          <p className="text-slate-600 mb-4">
            Please start a quote to begin the onboarding process.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href="/start">Get a Quote</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Client Onboarding</h1>
        <p className="text-slate-600">
          Complete these steps to proceed with your {activeCase.transaction_type.replace(/-/g, " ")}
        </p>
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Onboarding Progress</span>
              <span className="text-slate-600">{calculateProgress()}% complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id as OnboardingStep)}
                className={`flex flex-col items-center text-center flex-1 ${
                  index < steps.length - 1 ? "relative" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  step.status === "completed"
                    ? "bg-emerald-100 text-emerald-600"
                    : currentStep === step.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  currentStep === step.id ? "text-emerald-600" : "text-slate-600"
                }`}>
                  {step.title}
                </span>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-5 left-[55%] w-[90%] h-0.5 -z-10 ${
                    step.status === "completed" ? "bg-emerald-200" : "bg-slate-200"
                  }`} />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current step content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStepIndex]?.title}</CardTitle>
          <CardDescription>{steps[currentStepIndex]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "id-verification" && (
            <div className="space-y-6">
              {onboarding?.id_verification_status === "completed" ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">ID Verified</h3>
                  <p className="text-slate-600">
                    Your identity has been successfully verified.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-100">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Yoti Digital ID Verification</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Yoti is a UK Government certified digital identity provider. 
                          You'll need to scan your passport or driving licence and take a selfie.
                        </p>
                        <ul className="text-sm text-slate-600 space-y-1 mb-4">
                          <li>• Takes approximately 5 minutes</li>
                          <li>• Practice Guide 81 compliant</li>
                          <li>• Secure and encrypted</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStartVerification("yoti")}
                    disabled={processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting to Yoti...
                      </>
                    ) : (
                      <>
                        Start ID Verification
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {currentStep === "source-of-funds" && (
            <div className="space-y-6">
              {onboarding?.source_of_funds_status === "completed" ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Source of Funds Verified</h3>
                  <p className="text-slate-600">
                    Your bank accounts have been successfully linked and verified.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-green-100">
                        <Banknote className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Armalytix Source of Funds</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Armalytix securely connects to your bank to verify your source of funds 
                          for Anti-Money Laundering compliance.
                        </p>
                        <ul className="text-sm text-slate-600 space-y-1 mb-4">
                          <li>• Read-only access to your transactions</li>
                          <li>• FCA regulated Open Banking</li>
                          <li>• Instant verification</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleStartVerification("armalytix")}
                    disabled={processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting to Armalytix...
                      </>
                    ) : (
                      <>
                        Connect Your Bank
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {currentStep === "documents" && (
            <div className="space-y-6">
              {onboarding?.documents_status === "completed" ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Documents Uploaded</h3>
                  <p className="text-slate-600">
                    All required documents have been submitted.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-100">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Required Documents</h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Please upload the following documents to proceed with your transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    asChild
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <a href="/dashboard/documents">
                      Go to Documents
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const prevIndex = currentStepIndex - 1
            if (prevIndex >= 0) {
              setCurrentStep(steps[prevIndex].id as OnboardingStep)
            }
          }}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={() => {
            const nextIndex = currentStepIndex + 1
            if (nextIndex < steps.length) {
              setCurrentStep(steps[nextIndex].id as OnboardingStep)
            }
          }}
          disabled={currentStepIndex === steps.length - 1}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
