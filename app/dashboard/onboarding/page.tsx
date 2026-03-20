"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle2, 
  ShieldCheck, 
  Banknote, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Home,
  Upload,
  X,
  Check
} from "lucide-react"

type OnboardingStep = "welcome" | "personal-details" | "property-details" | "id-verification" | "source-of-funds" | "documents" | "complete"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userName, setUserName] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postcode: "",
    propertyAddress: "",
    propertyPostcode: "",
    additionalNotes: ""
  })
  const [uploadedDocs, setUploadedDocs] = useState<{[key: string]: {name: string, uploading: boolean}}>({})
  const [uploadError, setUploadError] = useState<string | null>(null)

  const supabase = createClient()

  const handleDocUpload = async (docType: string, file: File) => {
    setUploadError(null)
    setUploadedDocs(prev => ({ ...prev, [docType]: { name: file.name, uploading: true } }))

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", docType)

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setUploadedDocs(prev => ({ ...prev, [docType]: { name: file.name, uploading: false } }))
    } catch (err) {
      console.error("Upload error:", err)
      setUploadError(err instanceof Error ? err.message : "Upload failed")
      setUploadedDocs(prev => {
        const newDocs = { ...prev }
        delete newDocs[docType]
        return newDocs
      })
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const firstName = user.user_metadata?.first_name || ""
    const lastName = user.user_metadata?.last_name || ""
    setUserName(firstName || "there")
    
    setFormData(prev => ({
      ...prev,
      firstName,
      lastName
    }))

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const steps: { id: OnboardingStep; title: string; icon: React.ElementType }[] = [
    { id: "personal-details", title: "About You", icon: User },
    { id: "property-details", title: "Property", icon: Home },
    { id: "id-verification", title: "ID Check", icon: ShieldCheck },
    { id: "source-of-funds", title: "Funds", icon: Banknote },
    { id: "documents", title: "Documents", icon: FileText },
  ]

  const saveAndContinue = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (currentStep === "welcome") {
      setCurrentStep("personal-details")
    } else {
      const stepOrder = steps.map(s => s.id)
      const currentIndex = stepOrder.indexOf(currentStep as OnboardingStep)
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1])
      } else {
        setCurrentStep("complete")
      }
    }
    setSaving(false)
  }

  const goBack = () => {
    if (currentStep === "welcome") return
    
    if (currentStep === "personal-details") {
      setCurrentStep("welcome")
      return
    }
    
    const stepOrder = steps.map(s => s.id)
    const currentIndex = stepOrder.indexOf(currentStep as OnboardingStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const calculateProgress = () => {
    if (currentStep === "welcome") return 0
    if (currentStep === "complete") return 100
    const stepOrder = steps.map(s => s.id)
    const currentIndex = stepOrder.indexOf(currentStep as OnboardingStep)
    return Math.round(((currentIndex + 1) / steps.length) * 100)
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Welcome screen
  if (currentStep === "welcome") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Home className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Welcome to HomePanel</h1>
            <p className="text-emerald-100">Let&apos;s get your conveyancing case started</p>
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Hi {userName},</h2>
                <p className="text-slate-600">
                  We need to collect some information to progress your case. This should take about 10-15 minutes.
                </p>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                <h3 className="font-medium text-slate-900">What you&apos;ll need:</h3>
                <ul className="space-y-3">
                  {[
                    "Your personal details and current address",
                    "Property details (if known)",
                    "Photo ID (passport or driving licence)",
                    "Access to your online banking for verification"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={saveAndContinue}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-medium"
              >
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Complete screen
  if (currentStep === "complete") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-200">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">You&apos;re All Set</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              We&apos;ve received all your information. Your case handler will review everything and be in touch within 24 hours.
            </p>
            <div className="bg-slate-50 rounded-xl p-6 max-w-sm mx-auto mb-8">
              <h3 className="font-medium text-slate-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-slate-600 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-semibold">1.</span>
                  We verify your documents
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-semibold">2.</span>
                  Your case handler contacts you
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-semibold">3.</span>
                  We begin the legal work
                </li>
              </ul>
            </div>
            <Button 
              onClick={() => router.push("/dashboard")}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress header */}
      <Card className="border-slate-200">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-900">Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="text-sm text-slate-500">{calculateProgress()}% complete</span>
          </div>
          <Progress value={calculateProgress()} className="h-2 bg-slate-100" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors border-2 ${
                  index < currentStepIndex
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : currentStep === step.id
                    ? "bg-white border-emerald-600 text-emerald-600"
                    : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  currentStep === step.id ? "text-emerald-600" : index < currentStepIndex ? "text-slate-900" : "text-slate-500"
                }`}>
                  {step.title}
                </span>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-5 left-[55%] w-[90%] h-0.5 -z-10 ${
                    index < currentStepIndex ? "bg-emerald-600" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-xl font-semibold">{steps[currentStepIndex]?.title}</CardTitle>
          <CardDescription className="text-slate-600">
            {currentStep === "personal-details" && "Please confirm your personal details are correct"}
            {currentStep === "property-details" && "Tell us about the property involved in this transaction"}
            {currentStep === "id-verification" && "Verify your identity quickly and securely"}
            {currentStep === "source-of-funds" && "Connect your bank for Anti-Money Laundering compliance"}
            {currentStep === "documents" && "Upload any required documents for your case"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {currentStep === "personal-details" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel"
                    placeholder="07XXX XXX XXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-medium text-slate-900 mb-4">Your Current Address</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input 
                      id="addressLine1" 
                      name="addressLine1"
                      placeholder="House number and street"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2 <span className="text-slate-400">(optional)</span></Label>
                    <Input 
                      id="addressLine2" 
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input 
                        id="postcode" 
                        name="postcode"
                        placeholder="e.g. SW1A 1AA"
                        value={formData.postcode}
                        onChange={handleInputChange}
                        className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === "property-details" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="propertyAddress">Property Address</Label>
                <Input 
                  id="propertyAddress" 
                  name="propertyAddress"
                  placeholder="Enter the full property address"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyPostcode">Property Postcode</Label>
                <Input 
                  id="propertyPostcode" 
                  name="propertyPostcode"
                  placeholder="e.g. SW1A 1AA"
                  value={formData.propertyPostcode}
                  onChange={handleInputChange}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes <span className="text-slate-400">(optional)</span></Label>
                <Textarea 
                  id="additionalNotes" 
                  name="additionalNotes"
                  placeholder="Anything else we should know about the property or transaction?"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                />
              </div>
            </div>
          )}

          {currentStep === "id-verification" && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-2">Quick & Secure ID Check</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      We use Yoti, a UK Government certified provider, to verify your identity. 
                      You&apos;ll need your passport or driving licence.
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
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base">
                  Start ID Verification
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
              <p className="text-xs text-slate-500 text-center">
                You&apos;ll be redirected to Yoti&apos;s secure site. Once complete, return here and continue.
              </p>
              <Button 
                variant="outline" 
                onClick={saveAndContinue}
                className="w-full h-10 border-slate-200"
              >
                I&apos;ve completed verification - Continue
              </Button>
            </div>
          )}

          {currentStep === "source-of-funds" && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-2">Bank Verification</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Connect your bank securely through Open Banking to verify your source of funds. 
                      This is a legal requirement for property transactions.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Read-only access only
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        FCA regulated
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Instant verification
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
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base">
                  Connect Your Bank
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </a>
              <p className="text-xs text-slate-500 text-center">
                You&apos;ll be redirected to your bank&apos;s secure login. Once complete, return here and continue.
              </p>
              <Button 
                variant="outline" 
                onClick={saveAndContinue}
                className="w-full h-10 border-slate-200"
              >
                I&apos;ve connected my bank - Continue
              </Button>
            </div>
          )}

          {currentStep === "documents" && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600">
                Upload any documents required for your transaction. You can always add more later from your dashboard.
              </p>

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { key: "proof_of_address", name: "Proof of Address", desc: "Utility bill or bank statement (last 3 months)" },
                  { key: "mortgage_offer", name: "Mortgage Offer", desc: "If you're getting a mortgage" },
                  { key: "gift_letter", name: "Gift Letter", desc: "If receiving gift funds" }
                ].map((doc) => {
                  const uploaded = uploadedDocs[doc.key]
                  return (
                    <div key={doc.key} className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${uploaded ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 hover:border-emerald-200"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${uploaded ? "bg-emerald-100" : "bg-slate-100"}`}>
                          {uploaded ? (
                            <Check className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <FileText className="h-5 w-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-500">
                            {uploaded ? uploaded.name : doc.desc}
                          </p>
                        </div>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleDocUpload(doc.key, file)
                              e.target.value = ""
                            }
                          }}
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 pointer-events-none"
                          disabled={uploaded?.uploading}
                        >
                          {uploaded?.uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : uploaded ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-600" />
                              Uploaded
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                  )
                })}
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Documents can be uploaded later if you don&apos;t have them ready now.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={goBack}
              disabled={saving}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={saveAndContinue}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[140px]"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === "documents" ? (
                <>
                  Complete
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
