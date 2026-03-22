import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  ArrowLeft,
  User,
  Home,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Banknote,
  Upload
} from "lucide-react"

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get case with all related data
  const { data: caseData, error } = await supabase
    .from("cases")
    .select(`
      *,
      profiles!cases_client_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      onboarding_progress (*),
      documents (*),
      messages (
        *,
        profiles (first_name, last_name)
      ),
      activity_log (*)
    `)
    .eq("id", id)
    .single()

  if (error || !caseData) {
    notFound()
  }

  const onboarding = caseData.onboarding_progress?.[0]
  
  const calculateProgress = () => {
    if (!onboarding) return 0
    let completed = 0
    if (onboarding.id_verification_status === "completed") completed++
    if (onboarding.source_of_funds_status === "completed") completed++
    if (onboarding.aml_check_status === "completed") completed++
    if (onboarding.documents_status === "completed") completed++
    return Math.round((completed / 4) * 100)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </span>
        )
      case "in_progress":
        return (
          <span className="flex items-center gap-1 text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4" />
            In Progress
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-sm font-medium text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4" />
            Pending Onboarding
          </span>
        )
    }
  }

  const getOnboardingStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/cases">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {caseData.profiles?.first_name} {caseData.profiles?.last_name}
          </h1>
          <p className="text-slate-600">
            {caseData.property_address || "Address pending"}
          </p>
        </div>
        {getStatusBadge(caseData.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Onboarding progress */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
              <CardDescription>
                Client verification and compliance status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall progress</span>
                  <span className="text-slate-600">{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* ID Verification */}
                <div className={`p-4 rounded-lg border ${
                  onboarding?.id_verification_status === "completed"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-slate-600" />
                      <span className="font-medium">ID Verification</span>
                    </div>
                    {getOnboardingStatusIcon(onboarding?.id_verification_status || "pending")}
                  </div>
                  <p className="text-sm text-slate-600">
                    {onboarding?.id_verification_provider || "Yoti"} - {onboarding?.id_verification_status || "Pending"}
                  </p>
                </div>

                {/* Source of Funds */}
                <div className={`p-4 rounded-lg border ${
                  onboarding?.source_of_funds_status === "completed"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-slate-600" />
                      <span className="font-medium">Source of Funds</span>
                    </div>
                    {getOnboardingStatusIcon(onboarding?.source_of_funds_status || "pending")}
                  </div>
                  <p className="text-sm text-slate-600">
                    {onboarding?.source_of_funds_provider || "Armalytix"} - {onboarding?.source_of_funds_status || "Pending"}
                  </p>
                </div>

                {/* AML Check */}
                <div className={`p-4 rounded-lg border ${
                  onboarding?.aml_check_status === "completed"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-slate-600" />
                      <span className="font-medium">AML Check</span>
                    </div>
                    {getOnboardingStatusIcon(onboarding?.aml_check_status || "pending")}
                  </div>
                  <p className="text-sm text-slate-600">
                    Anti-money laundering - {onboarding?.aml_check_status || "Pending"}
                  </p>
                </div>

                {/* Documents */}
                <div className={`p-4 rounded-lg border ${
                  onboarding?.documents_status === "completed"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-slate-600" />
                      <span className="font-medium">Documents</span>
                    </div>
                    {getOnboardingStatusIcon(onboarding?.documents_status || "pending")}
                  </div>
                  <p className="text-sm text-slate-600">
                    {caseData.documents?.length || 0} documents uploaded
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Uploaded documents for this case
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {caseData.documents && caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc: any) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-sm">{doc.file_name}</p>
                          <p className="text-xs text-slate-600">{doc.document_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          doc.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : doc.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {doc.status}
                        </span>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500">No documents uploaded yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent messages */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>
                  Communication with client
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardHeader>
            <CardContent>
              {caseData.messages && caseData.messages.length > 0 ? (
                <div className="space-y-3">
                  {caseData.messages.slice(-5).map((msg: any) => (
                    <div key={msg.id} className="p-3 rounded-lg bg-slate-50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {msg.profiles?.first_name} {msg.profiles?.last_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{msg.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500">No messages yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Name</p>
                <p className="font-medium">
                  {caseData.profiles?.first_name} {caseData.profiles?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium">{caseData.profiles?.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Phone</p>
                <p className="font-medium">{caseData.profiles?.phone || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Property info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Address</p>
                <p className="font-medium">
                  {caseData.property_address || "Pending"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Postcode</p>
                <p className="font-medium">{caseData.property_postcode || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Value</p>
                <p className="font-medium">
                  {caseData.property_value 
                    ? `£${Number(caseData.property_value).toLocaleString()}`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tenure</p>
                <p className="font-medium capitalize">{caseData.tenure || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Transaction Type</p>
                <p className="font-medium capitalize">
                  {caseData.transaction_type?.replace(/-/g, " ")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quote info */}
          <Card>
            <CardHeader>
              <CardTitle>Quote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-emerald-600">
                  {caseData.quote_total 
                    ? `£${Number(caseData.quote_total).toLocaleString()}`
                    : "-"}
                </p>
                <p className="text-sm text-slate-600 mt-1">Total quoted</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Update Status
              </Button>
              <Button variant="outline" className="w-full">
                Assign Solicitor
              </Button>
              <Button variant="outline" className="w-full">
                View Activity Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
