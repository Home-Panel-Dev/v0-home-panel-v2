import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { FileText, Clock, CheckCircle, Users, ArrowRight, TrendingUp, Mail, Phone, MapPin } from "lucide-react"

type Enquiry = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  property_address: string | null
  property_postcode: string | null
  transaction_type: string | null
  property_value: number | null
  quote_amount: number | null
  status: string
  created_at: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: enquiries, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  const allEnquiries = (enquiries || []) as Enquiry[]
  
  const stats = {
    new: allEnquiries.filter(e => e.status === "new").length,
    underReview: allEnquiries.filter(e => e.status === "under_review").length,
    accepted: allEnquiries.filter(e => e.status === "accepted" || e.status === "onboarding").length,
    total: allEnquiries.length,
    totalValue: allEnquiries.reduce((sum, e) => sum + (e.quote_amount || 0), 0)
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border border-blue-200",
    under_review: "bg-amber-50 text-amber-700 border border-amber-200",
    accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    onboarding: "bg-purple-50 text-purple-700 border border-purple-200",
    active: "bg-green-50 text-green-700 border border-green-200",
    completed: "bg-slate-100 text-slate-700 border border-slate-200",
    rejected: "bg-red-50 text-red-700 border border-red-200"
  }

  const statusLabels: Record<string, string> = {
    new: "New",
    under_review: "Under Review",
    accepted: "Accepted",
    onboarding: "Onboarding",
    active: "Active",
    completed: "Completed",
    rejected: "Rejected"
  }

  const transactionLabels: Record<string, string> = {
    purchase: "Purchase",
    buying: "Purchase",
    sale: "Sale",
    selling: "Sale",
    both: "Sale & Purchase",
    "buying-selling": "Sale & Purchase"
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage quote requests and client cases</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.new}</p>
          <p className="text-sm text-slate-500">New Requests</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.underReview}</p>
          <p className="text-sm text-slate-500">Under Review</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.accepted}</p>
          <p className="text-sm text-slate-500">Accepted</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
          <p className="text-sm text-slate-500">Total Enquiries</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900">£{stats.totalValue.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Quote Value</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Quote Requests</h2>
          <Link 
            href="/admin/enquiries" 
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {error ? (
          <div className="p-8 text-center text-slate-500">
            <p>Unable to load enquiries</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        ) : allEnquiries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-900 font-medium">No quote requests yet</p>
            <p className="text-sm text-slate-500 mt-1">When clients submit quotes, they will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {allEnquiries.map((enquiry) => (
              <Link 
                key={enquiry.id}
                href={`/admin/enquiries/${enquiry.id}`}
                className="flex items-center gap-6 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-slate-900">
                      {enquiry.first_name} {enquiry.last_name}
                    </p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[enquiry.status] || "bg-slate-100 text-slate-700"}`}>
                      {statusLabels[enquiry.status] || enquiry.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {enquiry.email}
                    </span>
                    {enquiry.property_postcode && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {enquiry.property_postcode}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    £{enquiry.quote_amount?.toLocaleString() || "—"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {transactionLabels[enquiry.transaction_type || ""] || enquiry.transaction_type || "—"}
                  </p>
                </div>
                
                <div className="text-right w-20">
                  <p className="text-sm text-slate-500">{formatDate(enquiry.created_at)}</p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
