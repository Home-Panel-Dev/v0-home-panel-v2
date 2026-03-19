import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  FileText, 
  Users,
  PoundSterling,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  User,
  Home,
  ArrowUpRight,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get user profile for name
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user?.id)
    .single()

  // Get stats - Quote requests (pending cases)
  const { count: newQuotes } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "quote_sent")

  // Active clients in onboarding
  const { count: activeOnboarding } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_onboarding")

  // Revenue this month (completed cases)
  const { data: completedCases } = await supabase
    .from("cases")
    .select("quote_amount")
    .eq("status", "completed")
    .gte("updated_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const monthlyRevenue = completedCases?.reduce((sum, c) => sum + (c.quote_amount || 0), 0) || 0

  // Pending actions count
  const { count: pendingActions } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .in("status", ["needs_attention", "documents_pending"])

  // Get recent quote requests
  const { data: recentQuotes } = await supabase
    .from("cases")
    .select(`
      *,
      profiles!cases_client_id_fkey (
        first_name,
        last_name,
        email
      )
    `)
    .in("status", ["quote_sent", "pending_onboarding", "quote_requested"])
    .order("created_at", { ascending: false })
    .limit(5)

  // Get clients in onboarding
  const { data: onboardingClients } = await supabase
    .from("cases")
    .select(`
      *,
      profiles!cases_client_id_fkey (
        first_name,
        last_name
      ),
      onboarding_progress (
        id_verified,
        source_of_funds_verified,
        documents_uploaded
      )
    `)
    .eq("status", "pending_onboarding")
    .order("created_at", { ascending: false })
    .limit(5)

  const firstName = profile?.first_name || "Admin"

  // Helper to calculate onboarding progress
  const getOnboardingProgress = (progress: any) => {
    if (!progress) return 0
    let completed = 0
    if (progress.id_verified) completed++
    if (progress.source_of_funds_verified) completed++
    if (progress.documents_uploaded) completed++
    return Math.round((completed / 3) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {firstName}</h1>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your cases today</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <FileText className="h-4 w-4 mr-2" />
          Create Quote
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Quote Requests */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                +2 today
              </Badge>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-3">{newQuotes || 0}</p>
            <p className="text-slate-500 text-sm mt-0.5">New quote requests</p>
          </CardContent>
        </Card>

        {/* Active Onboarding */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                Active
              </Badge>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-3">{activeOnboarding || 0}</p>
            <p className="text-slate-500 text-sm mt-0.5">Clients onboarding</p>
          </CardContent>
        </Card>

        {/* Revenue This Month */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-50 rounded-lg">
                <PoundSterling className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center text-emerald-600 text-sm">
                <ArrowUpRight className="h-4 w-4" />
                12%
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-3">£{monthlyRevenue.toLocaleString()}</p>
            <p className="text-slate-500 text-sm mt-0.5">Revenue this month</p>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card className="bg-white border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              {(pendingActions || 0) > 0 && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                  Action needed
                </Badge>
              )}
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-3">{pendingActions || 0}</p>
            <p className="text-slate-500 text-sm mt-0.5">Pending actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quote Requests */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Quote Requests</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">New enquiries awaiting response</p>
            </div>
            <Link href="/admin/quotes" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentQuotes && recentQuotes.length > 0 ? (
              <div className="space-y-3">
                {recentQuotes.map((quote) => (
                  <Link 
                    key={quote.id} 
                    href={`/admin/cases/${quote.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {quote.profiles?.first_name} {quote.profiles?.last_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Home className="h-3.5 w-3.5" />
                        <span className="truncate">{quote.property_address?.split(",")[0] || "Address pending"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant="outline" 
                        className={
                          quote.transaction_type === "sale" 
                            ? "border-blue-200 bg-blue-50 text-blue-700" 
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        }
                      >
                        {quote.transaction_type === "sale" ? "Sale" : "Purchase"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(quote.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No pending quote requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Onboarding Progress */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Client Onboarding</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">Track verification progress</p>
            </div>
            <Link href="/admin/clients" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {onboardingClients && onboardingClients.length > 0 ? (
              <div className="space-y-3">
                {onboardingClients.map((client) => {
                  const progress = client.onboarding_progress?.[0]
                  const progressPercent = getOnboardingProgress(progress)
                  
                  return (
                    <Link 
                      key={client.id} 
                      href={`/admin/cases/${client.id}`}
                      className="block p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-medium">
                            {client.profiles?.first_name?.[0]}{client.profiles?.last_name?.[0]}
                          </div>
                          <span className="font-medium text-slate-900">
                            {client.profiles?.first_name} {client.profiles?.last_name}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500">{progressPercent}%</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      
                      {/* Progress steps */}
                      <div className="flex items-center gap-4 text-xs">
                        <div className={`flex items-center gap-1 ${progress?.id_verified ? "text-emerald-600" : "text-slate-400"}`}>
                          {progress?.id_verified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          ID Verified
                        </div>
                        <div className={`flex items-center gap-1 ${progress?.source_of_funds_verified ? "text-emerald-600" : "text-slate-400"}`}>
                          {progress?.source_of_funds_verified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          Source of Funds
                        </div>
                        <div className={`flex items-center gap-1 ${progress?.documents_uploaded ? "text-emerald-600" : "text-slate-400"}`}>
                          {progress?.documents_uploaded ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          Documents
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No clients currently onboarding</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
