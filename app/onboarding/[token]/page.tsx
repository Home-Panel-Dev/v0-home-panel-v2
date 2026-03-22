"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  ShieldCheck, 
  Building2, 
  FileText, 
  ArrowRight,
  Loader2,
  Home,
  User,
  ExternalLink
} from "lucide-react"

interface EnquiryData {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  property_address: string
  transaction_type: string
  case_reference: string
  onboarding_status: string
  onboarding_data: {
    personal_details?: {
      date_of_birth?: string
      current_address?: string
      ni_number?: string
    }
    id_verification?: {
      completed: boolean
      completed_at?: string
    }
    source_of_funds?: {
      completed: boolean
      completed_at?: string
    }
    documents?: {
      uploaded: string[]
    }
  } | null
}

type OnboardingStep = "welcome" | "personal" | "id-verification" | "source-of-funds" | "documents" | "complete"

const steps: { id: OnboardingStep; label: string; icon: React.ElementType }[] = [
  { id: "personal", label: "Personal Details", icon: User },
  { id: "id-verification", label: "ID Verification", icon: ShieldCheck },
  { id: "source-of-funds", label: "Source of Funds", icon: Building2 },
  { id: "documents", label: "Documents", icon: FileText },
]

export default function OnboardingPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enquiry, setEnquiry] = useState<EnquiryData | null>(null)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  
  const [formData, setFormData] = useState({
    date_of_birth: "",
    current_address: "",
    ni_number: "",
  })
  
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchEnquiry()
  }, [token])

  const fetchEnquiry = async () => {
    try {
      const res = await fetch(`/api/onboarding/${token}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Invalid or expired link")
      }
      const data = await res.json()
      setEnquiry(data.enquiry)
      
      // Restore form data if exists
      if (data.enquiry.onboarding_data?.personal_details) {
        setFormData({
          date_of_birth: data.enquiry.onboarding_data.personal_details.date_of_birth || "",
          current_address: data.enquiry.onboarding_data.personal_details.current_address || "",
          ni_number: data.enquiry.onboarding_data.personal_details.ni_number || "",
        })
      }
      if (data.enquiry.onboarding_data?.documents?.uploaded) {
        setUploadedDocs(data.enquiry.onboarding_data.documents.uploaded)
      }
      
      // Set current step based on progress
      if (data.enquiry.onboarding_status === "completed") {
        setCurrentStep("complete")
      } else if (data.enquiry.onboarding_data?.documents?.uploaded?.length > 0) {
        setCurrentStep("complete")
      } else if (data.enquiry.onboarding_data?.source_of_funds?.completed) {
        setCurrentStep("documents")
      } else if (data.enquiry.onboarding_data?.id_verification?.completed) {
        setCurrentStep("source-of-funds")
      } else if (data.enquiry.onboarding_data?.personal_details) {
        setCurrentStep("id-verification")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (step: string, data: Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/onboarding/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, data }),
      })
      if (!res.ok) throw new Error("Failed to save progress")
      await fetchEnquiry()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handlePersonalSubmit = async () => {
    await saveProgress("personal_details", formData)
    setCurrentStep("id-verification")
  }

  const handleIdVerificationComplete = async () => {
    await saveProgress("id_verification", { completed: true, completed_at: new Date().toISOString() })
    setCurrentStep("source-of-funds")
  }

  const handleSourceOfFundsComplete = async () => {
    await saveProgress("source_of_funds", { completed: true, completed_at: new Date().toISOString() })
    setCurrentStep("documents")
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("token", token)
      
      const res = await fetch("/api/onboarding/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!res.ok) throw new Error("Upload failed")
      
      const data = await res.json()
      setUploadedDocs(prev => [...prev, data.filename])
      await saveProgress("documents", { uploaded: [...uploadedDocs, data.filename] })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleComplete = async () => {
    await saveProgress("complete", {})
    setCurrentStep("complete")
  }

  const getStepStatus = (stepId: OnboardingStep): "complete" | "current" | "upcoming" => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    
    if (currentStep === "welcome") return "upcoming"
    if (currentStep === "complete") return "complete"
    if (stepIndex < currentIndex) return "complete"
    if (stepIndex === currentIndex) return "current"
    return "upcoming"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !enquiry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Home className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Link Invalid or Expired</CardTitle>
            <CardDescription>
              {error || "This onboarding link is no longer valid. Please contact your conveyancer for a new link."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-slate-900">HomePanel</span>
          </div>
          <div className="text-sm text-slate-500">
            Ref: {enquiry.case_reference || enquiry.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id)
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        status === "complete" ? "bg-emerald-600 text-white" :
                        status === "current" ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-600" :
                        "bg-slate-100 text-slate-400"
                      }`}>
                        {status === "complete" ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium ${
                        status === "current" ? "text-emerald-600" : "text-slate-500"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-2 ${
                        getStepStatus(steps[index + 1].id) !== "upcoming" ? "bg-emerald-600" : "bg-slate-200"
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Welcome Step */}
        {currentStep === "welcome" && (
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Welcome, {enquiry.first_name}</CardTitle>
              <CardDescription className="text-base">
                Let&apos;s complete your onboarding for your property transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Property</span>
                  <span className="font-medium text-slate-900">{enquiry.property_address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction</span>
                  <span className="font-medium text-slate-900 capitalize">{enquiry.transaction_type}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-slate-900">What you&apos;ll need:</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-slate-300" />
                    Valid passport or driving licence
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-slate-300" />
                    Access to your online banking
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-slate-300" />
                    Proof of address (utility bill or bank statement)
                  </li>
                </ul>
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                onClick={() => setCurrentStep("personal")}
              >
                Start Onboarding
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Personal Details Step */}
        {currentStep === "personal" && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Please confirm your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500 text-xs">First Name</Label>
                  <p className="font-medium">{enquiry.first_name}</p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Last Name</Label>
                  <p className="font-medium">{enquiry.last_name}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-slate-500 text-xs">Email</Label>
                <p className="font-medium">{enquiry.email}</p>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Current Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full current address"
                    value={formData.current_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_address: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="ni">National Insurance Number (optional)</Label>
                  <Input
                    id="ni"
                    placeholder="e.g. AB123456C"
                    value={formData.ni_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, ni_number: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                onClick={handlePersonalSubmit}
                disabled={saving || !formData.date_of_birth || !formData.current_address}
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ID Verification Step */}
        {currentStep === "id-verification" && (
          <Card>
            <CardHeader>
              <CardTitle>ID Verification</CardTitle>
              <CardDescription>Verify your identity using Yoti - a UK Government certified provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-2">Quick & Secure ID Check</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      You&apos;ll be redirected to Yoti to verify your identity. Have your passport or driving licence ready.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Takes about 5 minutes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Meets UK legal requirements
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Your data is encrypted
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <a 
                href="https://www.yoti.com/business/identity-verification/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                  Start ID Verification
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
              
              <Button 
                variant="outline"
                className="w-full h-12"
                onClick={handleIdVerificationComplete}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "I've completed verification - Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Source of Funds Step */}
        {currentStep === "source-of-funds" && (
          <Card>
            <CardHeader>
              <CardTitle>Source of Funds</CardTitle>
              <CardDescription>Verify the source of your funds using Open Banking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-2">Secure Bank Verification</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      We use Open Banking to securely verify your source of funds. This is read-only access - we cannot make any transactions.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        FCA regulated service
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Bank-level security
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Read-only access
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <a 
                href="https://truelayer.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                  Connect Your Bank
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
              
              <Button 
                variant="outline"
                className="w-full h-12"
                onClick={handleSourceOfFundsComplete}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "I've connected my bank - Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Documents Step */}
        {currentStep === "documents" && (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Upload any additional documents required for your transaction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {[
                  { name: "Proof of Address", desc: "Utility bill or bank statement (last 3 months)" },
                  { name: "Mortgage Offer", desc: "If you're getting a mortgage" },
                  { name: "Gift Letter", desc: "If receiving gift funds" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.desc}</p>
                      </div>
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleDocumentUpload}
                        disabled={uploading}
                      />
                      <Button variant="outline" size="sm" className="pointer-events-none">
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    </label>
                  </div>
                ))}
              </div>

              {uploadedDocs.length > 0 && (
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="font-medium text-emerald-900 mb-2">Uploaded Documents</h4>
                  <ul className="space-y-1">
                    {uploadedDocs.map((doc, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Documents can be uploaded later if you don&apos;t have them ready now.
                </p>
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Onboarding"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {currentStep === "complete" && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Onboarding Complete</CardTitle>
              <CardDescription className="text-base">
                Thank you, {enquiry.first_name}! Your onboarding is now complete.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Reference</span>
                  <span className="font-medium text-slate-900">{enquiry.case_reference || enquiry.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Property</span>
                  <span className="font-medium text-slate-900">{enquiry.property_address}</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-slate-600">
                Your conveyancer will be in touch shortly with next steps. You can close this page.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
