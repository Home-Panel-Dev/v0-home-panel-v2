"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
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
  ChevronRight,
  CheckCircle2,
  FileText,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Loader2
} from "lucide-react"
import { getStatusLabel, getStatusStyle, CASE_STATUSES } from "@/lib/database"
import { formatCurrency, formatDateTime, getTransactionLabel } from "@/lib/utils/format"
import { CaseDetailTabs } from "@/components/admin/case-detail-tabs"

interface CaseData {
  id: string
  enquiry_id: string
  case_reference: string
  status: string
  client_name: string
  client_email: string
  client_phone: string | null
  property_address: string | null
  property_postcode: string | null
  property_value: number | null
  transaction_type: string | null
  tenure: string | null
  assigned_firm_name: string | null
  assigned_admin_id: string | null
  id_verification_status: string
  source_of_funds_status: string
  aml_review_status: string
  created_at: string
  updated_at: string
  completed_at: string | null
  enquiry?: {
    id: string
    quote_amount: number
    onboarding_data: Record<string, unknown>
    onboarding_token: string | null
  }
  documents?: Array<{
    id: string
    file_name: string
    file_url: string
    document_type: string
    review_status: string
    created_at: string
  }>
  activities?: Array<{
    id: string
    action: string
    description: string
    actor_type: string
    created_at: string
    metadata: Record<string, unknown>
  }>
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchCase()
  }, [params.id])

  const fetchCase = async () => {
    try {
      const res = await fetch(`/api/admin/cases/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setCaseData(data)
      } else {
        router.push("/admin/cases")
      }
    } catch (error) {
      console.error("Failed to fetch case:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!caseData) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/cases/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        const updated = await res.json()
        setCaseData(prev => prev ? { ...prev, ...updated } : null)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const complianceSteps = [
    { 
      id: "id_verification", 
      label: "ID Verification", 
      status: caseData?.id_verification_status || "not_started",
      icon: ShieldCheck 
    },
    { 
      id: "source_of_funds", 
      label: "Source of Funds", 
      status: caseData?.source_of_funds_status || "not_started",
      icon: Banknote 
    },
    { 
      id: "aml_review", 
      label: "AML Review", 
      status: caseData?.aml_review_status || "not_started",
      icon: AlertCircle 
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Case not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/cases">Back to Cases</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/admin/cases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight font-mono">
                {caseData.case_reference}
              </h1>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(caseData.status)}`}>
                {getStatusLabel(caseData.status)}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              {caseData.client_name} - {getTransactionLabel(caseData.transaction_type)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 border-border" asChild>
            <a href={`mailto:${caseData.client_email}`}>
              <Mail className="h-4 w-4" />
              Message
            </a>
          </Button>
        </div>
      </div>

      <CaseDetailTabs
        caseId={caseData.id}
        clientName={caseData.client_name}
        clientEmail={caseData.client_email}
        transactionType={caseData.transaction_type || "sale"}
        propertyAddress={caseData.property_address || undefined}
        currentStatus={caseData.status}
      >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Summary */}
          <div className="bg-foreground text-background rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-background/60 text-sm font-medium mb-1">Property Value</p>
                <p className="text-3xl font-semibold tracking-tight">{formatCurrency(caseData.property_value)}</p>
              </div>
              <div className="text-right">
                <p className="text-background/60 text-sm mb-1">{getTransactionLabel(caseData.transaction_type)}</p>
                <p className="text-background/60 text-sm flex items-center justify-end gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(caseData.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Progress */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Compliance Status
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {complianceSteps.map((step) => {
                  const StepIcon = step.icon
                  const isComplete = step.status === "completed" || step.status === "approved"
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isComplete ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                      }`}>
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(step.status)}`}>
                        {getStatusLabel(step.status)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Client Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <p className="mt-1 font-medium text-sm">{caseData.client_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                  <a href={`mailto:${caseData.client_email}`} className="mt-1 text-foreground hover:text-accent font-medium text-sm flex items-center gap-1 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {caseData.client_email}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                  {caseData.client_phone ? (
                    <a href={`tel:${caseData.client_phone}`} className="mt-1 text-foreground hover:text-accent font-medium text-sm flex items-center gap-1 transition-colors">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {caseData.client_phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-muted-foreground text-sm">Not provided</p>
                  )}
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
                    {caseData.property_address || "Not yet provided"}
                    {caseData.property_postcode && `, ${caseData.property_postcode}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tenure</label>
                  <p className="mt-1 font-medium text-sm capitalize">{caseData.tenure || "Unknown"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quote Amount</label>
                  <p className="mt-1 font-medium text-sm">{formatCurrency(caseData.enquiry?.quote_amount)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Documents
              </h3>
            </div>
            <div className="p-6">
              {caseData.documents && caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{doc.document_type.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(doc.review_status)}`}>
                          {getStatusLabel(doc.review_status)}
                        </span>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No documents uploaded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight">Update Status</h3>
            </div>
            <div className="p-4">
              <select
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                value={caseData.status}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updating}
              >
                {CASE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="border-b border-border py-4 px-6">
              <h3 className="text-sm font-semibold tracking-tight">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <a href={`mailto:${caseData.client_email}`}>
                <Button variant="outline" className="w-full justify-between group h-10 border-border" size="sm">
                  <span className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Send Email
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
              {caseData.client_phone && (
                <a href={`tel:${caseData.client_phone}`}>
                  <Button variant="outline" className="w-full justify-between group h-10 mt-2 border-border" size="sm">
                    <span className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      Call Client
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </a>
              )}
              {caseData.enquiry_id && (
                <Link href={`/admin/enquiries/${caseData.enquiry_id}`}>
                  <Button variant="outline" className="w-full justify-between group h-10 mt-2 border-border" size="sm">
                    <span className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      View Enquiry
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              )}
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
                {caseData.activities && caseData.activities.length > 0 ? (
                  caseData.activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium">{activity.description || activity.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium">Case created</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(caseData.created_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </CaseDetailTabs>
    </div>
  )
}
