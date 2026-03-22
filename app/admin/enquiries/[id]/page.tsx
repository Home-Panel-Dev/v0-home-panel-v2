import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Home, 
  Calendar, 
  Clock, 
  Building2, 
  User, 
  Banknote, 
  Send, 
  ChevronRight,
  CheckCircle2,
  Circle,
  ShieldCheck,
  FileText
} from "lucide-react"
import { InviteClientButton } from "@/components/admin/invite-client-button"

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>
}

interface OnboardingData {
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
  completed_at?: string
}

export default async function EnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !enquiry) {
    notFound()
  }

  const onboardingData = enquiry.onboarding_data as OnboardingData | null

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—"
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-blue-50 text-blue-700 border-blue-200",
      under_review: "bg-amber-50 text-amber-700 border-amber-200",
      accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      onboarding_invited: "bg-purple-50 text-purple-700 border-purple-200",
      onboarding: "bg-purple-50 text-purple-700 border-purple-200",
      active: "bg-green-50 text-green-700 border-green-200",
      completed: "bg-slate-50 text-slate-700 border-slate-200",
      rejected: "bg-red-50 text-red-700 border-red-200"
    }
    const labels: Record<string, string> = {
      new: "New",
      under_review: "Under Review",
      accepted: "Accepted",
      onboarding_invited: "Onboarding Invited",
      onboarding: "Onboarding",
      active: "Active",
      completed: "Completed",
      rejected: "Rejected"
    }
    return (
      <Badge variant="outline" className={`${styles[status] || styles.new} font-medium`}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      buying: "Buying",
      selling: "Selling",
      "buying-and-selling": "Buying & Selling",
      remortgage: "Remortgage",
      "transfer-of-equity": "Transfer of Equity"
    }
    return labels[type] || type
  }

  const getOnboardingStepStatus = (step: string): "complete" | "pending" | "not_started" => {
    if (!onboardingData) return "not_started"
    switch (step) {
      case "personal":
        return onboardingData.personal_details ? "complete" : "not_started"
      case "id":
        return onboardingData.id_verification?.completed ? "complete" : "not_started"
      case "funds":
        return onboardingData.source_of_funds?.completed ? "complete" : "not_started"
      case "documents":
        return onboardingData.documents?.uploaded?.length ? "complete" : "not_started"
      default:
        return "not_started"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {enquiry.first_name} {enquiry.last_name}
              </h1>
              {getStatusBadge(enquiry.status)}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {enquiry.case_reference || `Enquiry #${enquiry.id.slice(0, 8)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Message
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-medium" size="sm">
            <User className="h-4 w-4" />
            Convert to Case
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Hero Card */}
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Quote Amount</p>
                  <p className="text-3xl font-bold">{formatCurrency(enquiry.quote_amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm mb-1">{getTransactionLabel(enquiry.transaction_type)}</p>
                  <p className="text-emerald-100 text-sm flex items-center justify-end gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(enquiry.created_at).split(",")[0]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding Progress - Show if onboarding has started */}
          {(enquiry.status === "onboarding_invited" || enquiry.status === "onboarding" || enquiry.onboarding_status) && (
            <Card className="bg-white border-slate-200/60">
              <CardHeader className="border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-slate-400" />
                  Onboarding Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    { id: "personal", label: "Personal Details", icon: User },
                    { id: "id", label: "ID Verification", icon: ShieldCheck },
                    { id: "funds", label: "Source of Funds", icon: Building2 },
                    { id: "documents", label: "Documents", icon: FileText },
                  ].map((step) => {
                    const status = getOnboardingStepStatus(step.id)
                    return (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          status === "complete" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          {status === "complete" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${status === "complete" ? "text-slate-900" : "text-slate-500"}`}>
                            {step.label}
                          </p>
                        </div>
                        {status === "complete" && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                            Complete
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Onboarding Data Details */}
                {onboardingData?.personal_details && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Submitted Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {onboardingData.personal_details.date_of_birth && (
                        <div>
                          <p className="text-slate-500">Date of Birth</p>
                          <p className="font-medium text-slate-900">{onboardingData.personal_details.date_of_birth}</p>
                        </div>
                      )}
                      {onboardingData.personal_details.current_address && (
                        <div className="col-span-2">
                          <p className="text-slate-500">Current Address</p>
                          <p className="font-medium text-slate-900">{onboardingData.personal_details.current_address}</p>
                        </div>
                      )}
                      {onboardingData.personal_details.ni_number && (
                        <div>
                          <p className="text-slate-500">NI Number</p>
                          <p className="font-medium text-slate-900">{onboardingData.personal_details.ni_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {onboardingData?.documents?.uploaded && onboardingData.documents.uploaded.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {onboardingData.documents.uploaded.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-900">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Details */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{enquiry.first_name} {enquiry.last_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
                  <a href={`mailto:${enquiry.email}`} className="mt-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {enquiry.email}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</label>
                  {enquiry.phone ? (
                    <a href={`tel:${enquiry.phone}`} className="mt-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {enquiry.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-slate-400 text-sm">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction Type</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{getTransactionLabel(enquiry.transaction_type)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Property Address</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm flex items-start gap-2">
                    <Home className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    {enquiry.property_address || "Not yet provided"}
                    {enquiry.property_postcode && `, ${enquiry.property_postcode}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Property Value</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{formatCurrency(enquiry.property_value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Banknote className="h-4 w-4 text-slate-400" />
                Fee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {(() => {
                  const propertyValue = Number(enquiry.property_value) || 0
                  let legalFee = 595
                  if (propertyValue > 250000) legalFee = 695
                  if (propertyValue > 500000) legalFee = 895
                  if (propertyValue > 1000000) legalFee = 1295
                  
                  const subtotal = legalFee
                  const vat = Math.round(subtotal * 0.2)
                  const landRegistryFee = propertyValue > 500000 ? 295 : propertyValue > 250000 ? 150 : 100
                  const searchFees = 300
                  const bankTransferFee = 35
                  
                  return (
                    <>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Legal Fee</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(legalFee)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center bg-slate-50/50">
                        <span className="text-sm text-slate-600">Subtotal</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">VAT (20%)</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(vat)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Search Fees</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(searchFees)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Land Registry Fee</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(landRegistryFee)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Bank Transfer Fee</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(bankTransferFee)}</span>
                      </div>
                      <div className="px-6 py-4 flex justify-between items-center bg-emerald-50">
                        <span className="text-sm font-semibold text-emerald-900">Total</span>
                        <span className="font-bold text-emerald-900">{formatCurrency(enquiry.quote_amount)}</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Timeline */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <a href={`mailto:${enquiry.email}?subject=Your HomePanel Quote Request`}>
                <Button variant="outline" className="w-full justify-between group h-10" size="sm">
                  <span className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Send Email
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
              {enquiry.phone && (
                <a href={`tel:${enquiry.phone}`}>
                  <Button variant="outline" className="w-full justify-between group h-10 mt-2" size="sm">
                    <span className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      Call {enquiry.phone}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </a>
              )}
              <div className="pt-2">
                <InviteClientButton 
                  enquiryId={enquiry.id}
                  clientName={`${enquiry.first_name} ${enquiry.last_name}`}
                  currentStatus={enquiry.status}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Quote submitted</p>
                    <p className="text-xs text-slate-500">{formatDate(enquiry.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Confirmation email sent</p>
                    <p className="text-xs text-slate-500">Automated</p>
                  </div>
                </div>
                {(enquiry.status === "onboarding_invited" || enquiry.status === "onboarding") && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Onboarding invite sent</p>
                      <p className="text-xs text-slate-500">Email sent to client</p>
                    </div>
                  </div>
                )}
                {onboardingData?.personal_details && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Personal details submitted</p>
                      <p className="text-xs text-slate-500">By client</p>
                    </div>
                  </div>
                )}
                {onboardingData?.id_verification?.completed && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">ID verification completed</p>
                      <p className="text-xs text-slate-500">Via Yoti</p>
                    </div>
                  </div>
                )}
                {onboardingData?.source_of_funds?.completed && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Source of funds verified</p>
                      <p className="text-xs text-slate-500">Via Open Banking</p>
                    </div>
                  </div>
                )}
                {onboardingData?.completed_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Onboarding complete</p>
                      <p className="text-xs text-slate-500">{formatDate(onboardingData.completed_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
