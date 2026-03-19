import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get stats
  const { count: totalCases } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })

  const { count: pendingOnboarding } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_onboarding")

  const { count: inProgress } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress")

  const { count: completed } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  const { count: totalClients } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "client")

  // Get recent cases
  const { data: recentCases } = await supabase
    .from("cases")
    .select(`
      *,
      profiles!cases_client_id_fkey (
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get pending documents
  const { data: pendingDocs, count: pendingDocsCount } = await supabase
    .from("documents")
    .select("*, cases(property_address)", { count: "exact" })
    .eq("status", "pending_review")
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600">
          Manage cases, clients, and onboarding progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Cases</p>
                <p className="text-3xl font-bold">{totalCases || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Onboarding</p>
                <p className="text-3xl font-bold">{pendingOnboarding || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-3xl font-bold">{inProgress || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Clients</p>
                <p className="text-3xl font-bold">{totalClients || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent cases */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Cases</CardTitle>
              <CardDescription>Latest property transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/cases">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentCases && recentCases.length > 0 ? (
              <div className="space-y-4">
                {recentCases.map((caseItem) => (
                  <div key={caseItem.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {caseItem.profiles?.first_name} {caseItem.profiles?.last_name}
                      </p>
                      <p className="text-sm text-slate-600 truncate">
                        {caseItem.property_address || "Address pending"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        caseItem.status === "completed" 
                          ? "bg-emerald-100 text-emerald-700"
                          : caseItem.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {caseItem.status.replace(/_/g, " ")}
                      </span>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/cases/${caseItem.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                No cases yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Documents</CardTitle>
              <CardDescription>Documents awaiting review</CardDescription>
            </div>
            {pendingDocsCount && pendingDocsCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                {pendingDocsCount} pending
              </span>
            )}
          </CardHeader>
          <CardContent>
            {pendingDocs && pendingDocs.length > 0 ? (
              <div className="space-y-4">
                {pendingDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <p className="text-sm text-slate-600 truncate">
                        {doc.document_type} - {doc.cases?.property_address || "Unknown property"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <p>All documents reviewed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/cases">
                <FileText className="h-4 w-4 mr-2" />
                View All Cases
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/clients">
                <Users className="h-4 w-4 mr-2" />
                Manage Clients
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/messages">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Messages
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
