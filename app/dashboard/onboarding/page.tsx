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
  FileSignature,
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Home,
  Upload
} from "lucide-react"

type OnboardingStep = "personal-details" | "property-details" | "id-verification" | "source-of-funds" | "documents" | "complete"

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
  date_of_birth: string | null
  onboarding_completed: boolean
  onboarding_step: string | null
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("personal-details")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Get user metadata
    setProfile({
      id: user.id,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      email: user.email || "",
      phone: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
      date_of_birth: null,
      onboarding_completed: false,
      onboarding_step: "personal-details"
    })

    setFormData(prev => ({
      ...prev,
      firstName: user.user_metadata?.first_name || "",
      lastName: user.user_metadata?.last_name || ""
    }))

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const saveAndContinue = async () => {
    setSaving(true)
    // In a real app, save to database here
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const stepOrder: OnboardingStep[] = ["personal-details", "property-details", "id-verification", "source-of-funds", "documents", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
    setSaving(false)
  }

  const goBack = () => {
    const stepOrder: OnboardingStep[] = ["personal-details", "property-details", "id-verification", "source-of-funds", "documents", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const calculateProgress = () => {
    const stepOrder: OnboardingStep[] = ["personal-details", "property-details", "id-verification", "source-of-funds", "documents", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    return Math.round((currentIndex / (stepOrder.length - 1)) * 100)
  }

  const steps = [
    { id: "personal-details", title: "Personal Details", icon: User },
    { id: "property-details", title: "Property", icon: Home },
    { id: "id-verification", title: "ID Verification", icon: ShieldCheck },
    { id: "source-of-funds", title: "Source of Funds", icon: Banknote },
    { id: "documents", title: "Documents", icon: FileText },
  ]

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (currentStep === "complete") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-200">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Onboarding Complete</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Thank you for completing the onboarding process. Your case handler will be in touch shortly with next steps.
            </p>
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome, {profile?.first_name || "there"}</h1>
        <p className="text-slate-600 mt-1">
          Complete these steps to get started with your conveyancing case
        </p>
      </div>

      {/* Progress */}
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-900">Onboarding Progress</span>
              <span className="text-slate-600">{calculateProgress()}% complete</span>
            </div>
            <Progress value={calculateProgress()} className="h-2 bg-slate-100" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id as OnboardingStep)}
                className="flex flex-col items-center text-center flex-1 relative"
              >
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
                  currentStep === step.id ? "text-emerald-600" : "text-slate-500"
                }`}>
                  {step.title}
                </span>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`absolute top-5 left-[55%] w-[90%] h-0.5 -z-10 ${
                    index < currentStepIndex ? "bg-emerald-600" : "bg-slate-200"
                  }`} />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg">{steps[currentStepIndex]?.title}</CardTitle>
          <CardDescription>
            {currentStep === "personal-details" && "Please confirm your personal details"}
            {currentStep === "property-details" && "Tell us about the property"}
            {currentStep === "id-verification" && "Verify your identity securely"}
            {currentStep === "source-of-funds" && "Verify your source of funds for AML compliance"}
            {currentStep === "documents" && "Upload required documents"}
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
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
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
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
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
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input 
                  id="addressLine1" 
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input 
                  id="addressLine2" 
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
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
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input 
                    id="postcode" 
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleInputChange}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
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
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
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
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                <Textarea 
                  id="additionalNotes" 
                  name="additionalNotes"
                  placeholder="Any additional information about the property or transaction"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
                />
              </div>
            </div>
          )}

          {currentStep === "id-verification" && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Yoti Digital ID Verification</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Yoti is a UK Government certified digital identity provider. 
                      You will need to scan your passport or driving licence and take a selfie.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Takes approximately 5 minutes
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Practice Guide 81 compliant
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Secure and encrypted
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                Start ID Verification
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-slate-500 text-center">
                You will be redirected to Yoti to complete verification
              </p>
            </div>
          )}

          {currentStep === "source-of-funds" && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Armalytix Source of Funds</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Armalytix securely connects to your bank to verify your source of funds 
                      for Anti-Money Laundering compliance.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Read-only access to your transactions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        FCA regulated Open Banking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Instant verification
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                Connect Your Bank
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-slate-500 text-center">
                You will be redirected to Armalytix to connect your bank
              </p>
            </div>
          )}

          {currentStep === "documents" && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-1">Required Documents</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Please upload the following documents to proceed with your transaction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  "Proof of Address (utility bill or bank statement)",
                  "Gift Letter (if applicable)",
                  "Mortgage Offer (if applicable)"
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <FileSignature className="h-5 w-5 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{doc}</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className="border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={saveAndContinue}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : currentStepIndex === steps.length - 1 ? (
            <>
              Complete Onboarding
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
