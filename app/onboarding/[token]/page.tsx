"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle2, 
  Upload, 
  ShieldCheck, 
  Building2, 
  FileText, 
  ArrowRight,
  Loader2,
  User,
  ExternalLink,
  Check
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

const steps = [
  { id: "personal" as const, label: "Details", icon: User },
  { id: "id-verification" as const, label: "ID Check", icon: ShieldCheck },
  { id: "source-of-funds" as const, label: "Funds", icon: Building2 },
  { id: "documents" as const, label: "Documents", icon: FileText },
]

export default function OnboardingPage() {
  const params = useParams()
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !enquiry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold mb-2">Link Invalid</h1>
          <p className="text-muted-foreground text-sm">
            {error || "This onboarding link is no longer valid. Please contact your conveyancer for a new link."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <svg className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-sm">HomePanel</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {enquiry.case_reference || enquiry.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress indicator */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <nav className="mb-10">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id)
                return (
                  <li key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        status === "complete" ? "bg-foreground text-background" :
                        status === "current" ? "bg-foreground text-background" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {status === "complete" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium ${
                        status === "current" ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-full h-px mx-3 ${
                        getStepStatus(steps[index + 1].id) !== "upcoming" ? "bg-foreground" : "bg-border"
                      }`} />
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        {/* Welcome */}
        {currentStep === "welcome" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                Welcome, {enquiry.first_name}
              </h1>
              <p className="text-muted-foreground">
                Complete your onboarding to proceed with your property transaction
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Property</span>
                <span className="text-sm font-medium">{enquiry.property_address}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Transaction</span>
                <span className="text-sm font-medium capitalize">{enquiry.transaction_type}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium">What you'll need:</p>
              <ul className="space-y-2.5">
                {[
                  "Valid passport or driving licence",
                  "Access to your online banking",
                  "Proof of address document"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
              onClick={() => setCurrentStep("personal")}
            >
              Start Onboarding
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Personal Details */}
        {currentStep === "personal" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-xl font-semibold tracking-tight mb-1">Personal Details</h1>
              <p className="text-muted-foreground text-sm">Confirm your information</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <div className="h-11 px-4 flex items-center bg-muted rounded-lg text-sm">
                    {enquiry.first_name}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <div className="h-11 px-4 flex items-center bg-muted rounded-lg text-sm">
                    {enquiry.last_name}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">Current Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your current address"
                  value={formData.current_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_address: e.target.value }))}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ni" className="text-sm font-medium">National Insurance Number</Label>
                <Input
                  id="ni"
                  placeholder="e.g. QQ 12 34 56 C"
                  value={formData.ni_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, ni_number: e.target.value.toUpperCase() }))}
                  className="h-11 font-mono"
                />
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
              onClick={handlePersonalSubmit}
              disabled={saving || !formData.date_of_birth || !formData.current_address}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
            </Button>
          </div>
        )}

        {/* ID Verification */}
        {currentStep === "id-verification" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-xl font-semibold tracking-tight mb-1">Identity Verification</h1>
              <p className="text-muted-foreground text-sm">Verify your identity securely with Yoti</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium mb-1">Secure ID Check</p>
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to Yoti to verify your identity using your passport or driving licence. This typically takes 2-3 minutes.
                </p>
              </div>
              <a 
                href="https://www.yoti.com/identity-verification/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
              >
                Open Yoti Verification
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <Button 
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
              onClick={handleIdVerificationComplete}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "I've completed verification"}
            </Button>
          </div>
        )}

        {/* Source of Funds */}
        {currentStep === "source-of-funds" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-xl font-semibold tracking-tight mb-1">Source of Funds</h1>
              <p className="text-muted-foreground text-sm">Connect your bank to verify your funds</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium mb-1">Open Banking Verification</p>
                <p className="text-sm text-muted-foreground">
                  Securely connect to your bank using Open Banking. We'll verify your account and funds for anti-money laundering compliance.
                </p>
              </div>
              <a 
                href="https://truelayer.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
              >
                Connect Bank Account
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <Button 
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
              onClick={handleSourceOfFundsComplete}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "I've connected my bank"}
            </Button>
          </div>
        )}

        {/* Documents */}
        {currentStep === "documents" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-xl font-semibold tracking-tight mb-1">Upload Documents</h1>
              <p className="text-muted-foreground text-sm">Upload required documents for your transaction</p>
            </div>

            <div className="space-y-3">
              {["Proof of Address", "Mortgage Offer", "Gift Letter"].map((doc, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc}</p>
                      <p className="text-xs text-muted-foreground">
                        {i === 0 ? "Utility bill or bank statement" : i === 1 ? "If applicable" : "If receiving gift funds"}
                      </p>
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded</p>
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {doc}
                  </div>
                ))}
              </div>
            )}

            <Button 
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
              onClick={handleComplete}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Onboarding"}
            </Button>
          </div>
        )}

        {/* Complete */}
        {currentStep === "complete" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">Onboarding Complete</h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Thank you for completing your onboarding. Your conveyancer will be in touch shortly with next steps.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
