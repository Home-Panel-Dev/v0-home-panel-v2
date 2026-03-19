import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  Search, 
  Filter, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"

export default async function AdminCasesPage() {
  const supabase = await createClient()

  // Get all cases with client info
  const { data: cases } = await supabase
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
      onboarding_progress (*)
    `)
    .order("created_at", { ascending: false })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-amber-600" />
    }
  }

  const getOnboardingProgress = (onboarding: any) => {
    if (!onboarding || onboarding.length === 0) return 0
    const progress = onboarding[0]
    let completed = 0
    if (progress.id_verification_status === "completed") completed++
    if (progress.source_of_funds_status === "completed") completed++
    if (progress.aml_check_status === "completed") completed++
    if (progress.documents_status === "completed") completed++
    return Math.round((completed / 4) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cases</h1>
          <p className="text-slate-600">
            Manage all property transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by client name or address..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cases table */}
      <Card>
        <CardHeader>
          <CardTitle>All Cases</CardTitle>
          <CardDescription>
            {cases?.length || 0} total cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cases && cases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-slate-600">Client</th>
                    <th className="pb-3 font-medium text-slate-600">Property</th>
                    <th className="pb-3 font-medium text-slate-600">Type</th>
                    <th className="pb-3 font-medium text-slate-600">Status</th>
                    <th className="pb-3 font-medium text-slate-600">Onboarding</th>
                    <th className="pb-3 font-medium text-slate-600">Value</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">
                            {caseItem.profiles?.first_name} {caseItem.profiles?.last_name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {caseItem.profiles?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-sm">
                          {caseItem.property_address || "Address pending"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {caseItem.property_postcode || ""}
                        </p>
                      </td>
                      <td className="py-4">
                        <span className="capitalize text-sm">
                          {caseItem.transaction_type?.replace(/-/g, " ")}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          caseItem.status === "completed" 
                            ? "bg-emerald-100 text-emerald-700"
                            : caseItem.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {getStatusIcon(caseItem.status)}
                          {caseItem.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${getOnboardingProgress(caseItem.onboarding_progress)}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">
                            {getOnboardingProgress(caseItem.onboarding_progress)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-medium">
                          {caseItem.property_value 
                            ? `£${Number(caseItem.property_value).toLocaleString()}`
                            : "-"}
                        </span>
                      </td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/cases/${caseItem.id}`}>
                            View
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No cases found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
