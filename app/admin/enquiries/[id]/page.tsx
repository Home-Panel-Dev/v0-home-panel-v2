import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/database"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  FileText,
  ShieldCheck
} from "lucide-react"
import { InviteClientButton } from "@/components/admin/invite-client-button"
import { ConvertToCaseButton } from "@/components/admin/convert-to-case-button"
import { EnquiryComplianceSection } from "@/components/admin/enquiry-compliance-section"
import { getStatusLabel, getStatusStyle } from "@/lib/database"
import { formatCurrency, formatDateTime, formatDate, getTransactionLabel } from "@/lib/utils/format"

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

  // Fetch compliance checks and documents
  const adminClient = createAdminClient()
  
  const [complianceResult, documentsResult] = await Promise.all([
    adminClient
      .from("compliance_checks")
      .select("*")
      .eq("enquiry_id", id),
    adminClient
      .from("documents")
      .select("*")
      .eq("enquiry_id", id)
  ])

  const complianceChecks = complianceResult.data || []
  const documents = documentsResult.data || []

  const onboardingData = enquiry.onboarding_data as OnboardingData | null

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
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(enquiry.status || "new")}`}>
                {getStatusLabel(enquiry.status || "new")}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {enquiry.case_reference || `Enquiry #${enquiry.id.slice(0, 8)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-border">
            <Send className="h-4 w-4" />
            Message
          </Button>
          <ConvertToCaseButton 
            enquiryId={enquiry.id} 
            disabled={enquiry.status === "converted"}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Hero Card */}
          <div className="bg-foreground text-background rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-background/60 text-sm font-medium mb-1">Quote Amount</p>
                <p className="text-3xl font-semibold tracking-tight">{formatCurrency(enquiry.quote_amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-background/60 text-sm mb-1">{getTransactionLabel(enquiry.transaction_type)}</p>
                <p className="text-background/60 text-sm flex items-center justify-end gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(enquiry.created_at).split(",")[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Onboarding Progress - Show if onboarding has started */}
          {(enquiry.status === "onboarding_invited" || enquiry.status === "onboarding" || enquiry.onboarding_status) && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="border-b border-border py-4 px-6">
                <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  Onboarding Progress
                </h3>
              </div>
              <div className="p-6">
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
                          status === "complete" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                        }`}>
                          {status === "complete" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${status === "complete" ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                        </div>
                        {status === "complete" && (
                          <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-medium">
                            Done
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Onboarding Data Details */}
                {onboardingData?.personal_details && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Submitted Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {onboardingData.personal_details.date_of_birth && (
                        <div>
                          <p className="text-muted-foreground">Date of Birth</p>
                          <p className="font-medium">{onboardingData.personal_details.date_of_birth}</p>
                        </div>
                      )}
                      {onboardingData.personal_details.current_address && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Current Address</p>
                          <p className="font-medium">{onboardingData.personal_details.current_address}</p>
                        </div>
                      )}
                      {onboardingData.personal_details.ni_number && (
                        <div>
                          <p className="text-muted-foreground">NI Number</p>
                          <p className="font-medium font-mono">{onboardingData.personal_details.ni_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {onboardingData?.documents?.uploaded && onboardingData.documents.uploaded.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {onboardingData.documents.uploaded.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{typeof doc === 'string' ? doc : doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Review Section */}
          {(enquiry.onboarding_status === "completed" || complianceChecks.length > 0) && (
            <EnquiryComplianceSection
              enquiryId={enquiry.id}
              complianceChecks={complianceChecks}
              documents={documents}
              internalStatus={enquiry.internal_status || "awaiting_client"}
            />
          )}

          {/* Contact Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Contact Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <p className="mt-1 font-medium text-sm">{enquiry.first_name} {enquiry.last_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                  <a href={`mailto:${enquiry.email}`} className="mt-1 text-foreground hover:text-accent font-medium text-sm flex items-center gap-1 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {enquiry.email}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                  {enquiry.phone ? (
                    <a href={`tel:${enquiry.phone}`} className="mt-1 text-foreground hover:text-accent font-medium text-sm flex items-center gap-1 transition-colors">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {enquiry.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-muted-foreground text-sm">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Transaction</label>
                  <p className="mt-1 font-medium text-sm">{getTransactionLabel(enquiry.transaction_type)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Property Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</label>
                  <p className="mt-1 font-medium text-sm flex items-start gap-2">
                    <Home className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    {enquiry.property_address || "Not yet provided"}
                    {enquiry.property_postcode && `, ${enquiry.property_postcode}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</label>
                  <p className="mt-1 font-medium text-sm">{formatCurrency(enquiry.property_value)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                Fee Breakdown
              </h3>
            </div>
            <div>
              <div className="divide-y divide-border">
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
                        <span className="text-sm text-muted-foreground">Legal Fee</span>
                        <span className="text-sm font-medium">{formatCurrency(legalFee)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center bg-muted/50">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">VAT (20%)</span>
                        <span className="text-sm font-medium">{formatCurrency(vat)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Search Fees</span>
                        <span className="text-sm font-medium">{formatCurrency(searchFees)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Land Registry</span>
                        <span className="text-sm font-medium">{formatCurrency(landRegistryFee)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Bank Transfer</span>
                        <span className="text-sm font-medium">{formatCurrency(bankTransferFee)}</span>
                      </div>
                      <div className="px-6 py-4 flex justify-between items-center bg-foreground text-background">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="font-semibold">{formatCurrency(enquiry.quote_amount)}</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Timeline */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <a href={`mailto:${enquiry.email}?subject=Your HomePanel Quote Request`}>
                <Button variant="outline" className="w-full justify-between group h-10 border-border" size="sm">
                  <span className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Send Email
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
              {enquiry.phone && (
                <a href={`tel:${enquiry.phone}`}>
                  <Button variant="outline" className="w-full justify-between group h-10 mt-2 border-border" size="sm">
                    <span className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Call {enquiry.phone}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
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
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Activity
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Quote submitted</p>
                    <p className="text-xs text-muted-foreground">{formatDate(enquiry.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Confirmation sent</p>
                    <p className="text-xs text-muted-foreground">Automated</p>
                  </div>
                </div>
                {(enquiry.status === "onboarding_invited" || enquiry.status === "onboarding") && (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Onboarding invited</p>
                      <p className="text-xs text-muted-foreground">Email sent</p>
                    </div>
                  </div>
                )}
                {onboardingData?.personal_details && (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Details submitted</p>
                      <p className="text-xs text-muted-foreground">By client</p>
                    </div>
                  </div>
                )}
                {onboardingData?.id_verification?.completed && (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">ID verified</p>
                      <p className="text-xs text-muted-foreground">Via Yoti</p>
                    </div>
                  </div>
                )}
                {onboardingData?.source_of_funds?.completed && (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Funds verified</p>
                      <p className="text-xs text-muted-foreground">Via Open Banking</p>
                    </div>
                  </div>
                )}
                {onboardingData?.completed_at && (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Onboarding complete</p>
                      <p className="text-xs text-muted-foreground">{formatDate(onboardingData.completed_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
