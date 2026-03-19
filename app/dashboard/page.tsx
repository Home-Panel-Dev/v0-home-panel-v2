import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Banknote,
  Upload
} from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's cases
  const { data: cases } = await supabase
    .from("cases")
    .select(`
      *,
      onboarding_progress (*)
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  const activeCase = cases?.[0]
  const onboarding = activeCase?.onboarding_progress?.[0]

  // Calculate onboarding progress
  const calculateProgress = () => {
    if (!onboarding) return 0
    let completed = 0
    const total = 4
    if (onboarding.id_verification_status === "completed") completed++
    if (onboarding.aml_check_status === "completed") completed++
    if (onboarding.source_of_funds_status === "completed") completed++
    if (onboarding.documents_status === "completed") completed++
    return Math.round((completed / total) * 100)
  }

  const progress = calculateProgress()

  // Get recent messages count
  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .in("case_id", cases?.map(c => c.id) || [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-600">
          Track your conveyancing progress and complete your onboarding.
        </p>
      </div>

      {activeCase ? (
        <>
          {/* Case overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Your Property Transaction</CardTitle>
                  <CardDescription>
                    {activeCase.property_address || "Address pending"}
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  activeCase.status === "completed" 
                    ? "bg-emerald-100 text-emerald-700"
                    : activeCase.status === "in_progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {activeCase.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Transaction Type</p>
                  <p className="font-medium capitalize">{activeCase.transaction_type?.replace(/-/g, " ")}</p>
                </div>
                <div>
                  <p className="text-slate-500">Property Value</p>
                  <p className="font-medium">
                    {activeCase.property_value 
                      ? `£${Number(activeCase.property_value).toLocaleString()}`
                      : "TBC"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Tenure</p>
                  <p className="font-medium capitalize">{activeCase.tenure || "TBC"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Quote</p>
                  <p className="font-medium">
                    {activeCase.quote_total 
                      ? `£${Number(activeCase.quote_total).toLocaleString()}`
                      : "TBC"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onboarding progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Onboarding Progress</CardTitle>
              <CardDescription>
                Complete these steps to proceed with your transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Overall progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* ID Verification */}
                <Link href="/dashboard/onboarding?step=id-verification">
                  <div className={`p-4 rounded-lg border-2 transition-colors ${
                    onboarding?.id_verification_status === "completed"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        onboarding?.id_verification_status === "completed"
                          ? "bg-emerald-100"
                          : "bg-slate-100"
                      }`}>
                        <ShieldCheck className={`h-5 w-5 ${
                          onboarding?.id_verification_status === "completed"
                            ? "text-emerald-600"
                            : "text-slate-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">ID Verification</h3>
                          {onboarding?.id_verification_status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Verify your identity with Yoti
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Source of Funds */}
                <Link href="/dashboard/onboarding?step=source-of-funds">
                  <div className={`p-4 rounded-lg border-2 transition-colors ${
                    onboarding?.source_of_funds_status === "completed"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        onboarding?.source_of_funds_status === "completed"
                          ? "bg-emerald-100"
                          : "bg-slate-100"
                      }`}>
                        <Banknote className={`h-5 w-5 ${
                          onboarding?.source_of_funds_status === "completed"
                            ? "text-emerald-600"
                            : "text-slate-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Source of Funds</h3>
                          {onboarding?.source_of_funds_status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Connect your bank via Armalytix
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* AML Check */}
                <div className={`p-4 rounded-lg border-2 ${
                  onboarding?.aml_check_status === "completed"
                    ? "border-emerald-200 bg-emerald-50"
                    : onboarding?.aml_check_status === "in_progress"
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      onboarding?.aml_check_status === "completed"
                        ? "bg-emerald-100"
                        : onboarding?.aml_check_status === "in_progress"
                        ? "bg-blue-100"
                        : "bg-slate-100"
                    }`}>
                      <Clock className={`h-5 w-5 ${
                        onboarding?.aml_check_status === "completed"
                          ? "text-emerald-600"
                          : onboarding?.aml_check_status === "in_progress"
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">AML Check</h3>
                        {onboarding?.aml_check_status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : onboarding?.aml_check_status === "in_progress" ? (
                          <span className="text-xs text-blue-600 font-medium">Processing</span>
                        ) : (
                          <span className="text-xs text-slate-500">Automatic</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Anti-money laundering verification
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <Link href="/dashboard/documents">
                  <div className={`p-4 rounded-lg border-2 transition-colors ${
                    onboarding?.documents_status === "completed"
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        onboarding?.documents_status === "completed"
                          ? "bg-emerald-100"
                          : "bg-slate-100"
                      }`}>
                        <Upload className={`h-5 w-5 ${
                          onboarding?.documents_status === "completed"
                            ? "text-emerald-600"
                            : "text-slate-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Documents</h3>
                          {onboarding?.documents_status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          Upload required documents
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {progress < 100 && (
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/dashboard/onboarding">
                    Continue Onboarding
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-sm text-slate-600">
                      {unreadMessages ? `${unreadMessages} unread` : "No new messages"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Documents</p>
                    <p className="text-sm text-slate-600">View and upload files</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Timeline</p>
                    <p className="text-sm text-slate-600">Track your progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* No active case */
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No active cases</h3>
            <p className="text-slate-600 mb-6">
              Start your conveyancing journey by getting a quote.
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/start">Get a Quote</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
