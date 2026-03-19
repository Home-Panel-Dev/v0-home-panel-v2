import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { 
  Building2, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  Plus,
  Clock,
  ChevronRight,
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

  // Get stats
  const { count: liveCases } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .in("status", ["in_progress", "pending_onboarding"])

  const { count: pendingInstructions } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_onboarding")

  const { count: completedThisMonth } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")
    .gte("updated_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const { count: needsAttention } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "needs_attention")

  // Get cases needing attention for alerts
  const { data: alertCases } = await supabase
    .from("cases")
    .select(`
      *,
      profiles!cases_client_id_fkey (
        first_name,
        last_name
      )
    `)
    .in("status", ["needs_attention", "pending_onboarding"])
    .order("created_at", { ascending: false })
    .limit(5)

  const firstName = profile?.first_name || "Admin"

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {firstName}</h1>
        <p className="text-slate-500 mt-1">Here's an overview of your conveyancing activity</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Cases - Blue */}
        <Card className="bg-blue-600 text-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Live Cases</p>
                <p className="text-4xl font-bold mt-1">{liveCases || 0}</p>
                <p className="text-blue-200 text-sm mt-1">Active matters</p>
              </div>
              <div className="p-2 bg-blue-500/30 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Instructions - White */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Instructions</p>
                <p className="text-4xl font-bold text-slate-900 mt-1">{pendingInstructions || 0}</p>
                <p className="text-slate-500 text-sm mt-1">8 new this week</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completions This Month - Green */}
        <Card className="bg-emerald-600 text-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Completions This Month</p>
                <p className="text-4xl font-bold mt-1">{completedThisMonth || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-emerald-200 text-sm">12% Completed matters</span>
                </div>
              </div>
              <div className="p-2 bg-emerald-500/30 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Needing Attention - Orange */}
        <Card className="bg-amber-500 text-white border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Cases Needing Attention</p>
                <p className="text-4xl font-bold mt-1">{needsAttention || 0}</p>
                <p className="text-amber-200 text-sm mt-1">Requires action</p>
              </div>
              <div className="p-2 bg-amber-400/30 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-lg font-semibold">Alerts</CardTitle>
            </div>
            <p className="text-sm text-slate-500">Cases requiring attention</p>
          </CardHeader>
          <CardContent className="pt-0">
            {alertCases && alertCases.length > 0 ? (
              <div className="space-y-3">
                {alertCases.map((caseItem) => (
                  <Link 
                    key={caseItem.id} 
                    href={`/admin/cases/${caseItem.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-amber-400" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {caseItem.profiles?.first_name} {caseItem.profiles?.last_name}
                        </p>
                        <p className="text-sm text-slate-500">
                          Case #{caseItem.id.slice(0, 6).toUpperCase()} - {caseItem.property_address?.split(",")[0] || "Address pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(caseItem.created_at).toLocaleDateString("en-GB")}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No cases require attention</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-700" />
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </div>
            <p className="text-sm text-slate-500">Common tasks and shortcuts</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Link 
                href="/admin/new"
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">New Instruction</p>
                  <p className="text-sm text-slate-500">Create a new quote or instruction</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link 
                href="/admin/cases"
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">View All Cases</p>
                  <p className="text-sm text-slate-500">Browse and manage your cases</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link 
                href="/admin/reports"
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">View Reports</p>
                  <p className="text-sm text-slate-500">Analytics and performance data</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
