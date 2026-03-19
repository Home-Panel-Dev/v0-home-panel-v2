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
  Home,
  Mail,
  Eye,
  UserPlus,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let firstName = "Admin"
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single()
    firstName = profile?.first_name || "Admin"
  }

  const { data: enquiries, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const newEnquiries = enquiries?.filter(e => e.status === "new").length || 0
  const reviewingEnquiries = enquiries?.filter(e => e.status === "reviewing").length || 0
  const totalQuoteValue = enquiries?.reduce((sum, e) => sum + (e.quote_amount || 0), 0) || 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your quote requests and client onboarding</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">{newEnquiries}</p>
                <p className="text-sm text-slate-500">New Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">{reviewingEnquiries}</p>
                <p className="text-sm text-slate-500">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">{enquiries?.length || 0}</p>
                <p className="text-sm text-slate-500">Total Enquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-purple-50 flex items-center justify-center">
                <PoundSterling className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-900">£{totalQuoteValue.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Quote Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Requests Table */}
      <Card className="bg-white border-slate-200/60 shadow-sm">
        <CardHeader className="border-b border-slate-100 py-4 px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">Quote Requests</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">Recent enquiries from your intake form</p>
            </div>
            <Button variant="outline" size="sm" className="text-sm font-medium">
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">Unable to load enquiries.</p>
              <p className="text-sm text-slate-400 mt-1">Submit a quote request to create the first entry.</p>
            </div>
          ) : enquiries && enquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Client</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Property</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Quote</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{enquiry.first_name} {enquiry.last_name}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[180px]">{enquiry.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Home className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-slate-900 max-w-[180px] truncate">
                              {enquiry.property_address || "Address TBC"}
                            </p>
                            <p className="text-xs text-slate-500">{enquiry.property_postcode || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline"
                          className={`text-xs font-medium ${
                            enquiry.transaction_type === "sale" || enquiry.transaction_type === "selling"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : enquiry.transaction_type === "purchase" || enquiry.transaction_type === "buying"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-purple-200 bg-purple-50 text-purple-700"
                          }`}
                        >
                          {enquiry.transaction_type === "sale" || enquiry.transaction_type === "selling" ? "Sale" : 
                           enquiry.transaction_type === "purchase" || enquiry.transaction_type === "buying" ? "Purchase" : "Sale & Purchase"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">£{enquiry.quote_amount?.toLocaleString() || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant="outline"
                          className={`text-xs font-medium ${
                            enquiry.status === "new" 
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : enquiry.status === "reviewing"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : enquiry.status === "accepted"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {enquiry.status === "new" ? "New" :
                           enquiry.status === "reviewing" ? "Reviewing" :
                           enquiry.status === "accepted" ? "Accepted" :
                           enquiry.status === "converted" ? "Converted" : enquiry.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{formatDate(enquiry.created_at)}</p>
                        <p className="text-xs text-slate-500">{formatTime(enquiry.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/enquiries/${enquiry.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                              <Eye className="h-4 w-4 text-slate-500" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-emerald-50">
                            <UserPlus className="h-4 w-4 text-emerald-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">No quote requests yet</h3>
              <p className="text-sm text-slate-500 mb-4">When customers submit the intake form, their requests will appear here.</p>
              <Link href="/start">
                <Button variant="outline" size="sm" className="font-medium">
                  View Intake Form
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
