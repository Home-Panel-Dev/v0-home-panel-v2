import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { FileText, Clock, CheckCircle, Users, ArrowRight, TrendingUp } from "lucide-react"

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

  const statusConfig: Record<string, { label: string; className: string }> = {
    new: { label: "New", className: "bg-blue-50 text-blue-700" },
    under_review: { label: "Reviewing", className: "bg-amber-50 text-amber-700" },
    accepted: { label: "Accepted", className: "bg-accent/10 text-accent" },
    onboarding: { label: "Onboarding", className: "bg-purple-50 text-purple-700" },
    active: { label: "Active", className: "bg-green-50 text-green-700" },
    completed: { label: "Complete", className: "bg-muted text-muted-foreground" },
    rejected: { label: "Declined", className: "bg-red-50 text-red-700" }
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your quote requests and cases</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {[
          { label: "New Requests", value: stats.new, icon: FileText, color: "text-blue-600 bg-blue-50" },
          { label: "Under Review", value: stats.underReview, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "text-accent bg-accent/10" },
          { label: "Total Enquiries", value: stats.total, icon: Users, color: "text-foreground/60 bg-muted" },
          { label: "Quote Value", value: `£${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600 bg-green-50", span: true },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`bg-card border border-border rounded-xl p-5 ${stat.span ? 'col-span-2 lg:col-span-1' : ''}`}
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Enquiries */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">Recent Requests</h2>
          <Link 
            href="/admin/enquiries" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {error ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Unable to load enquiries</p>
            </div>
          ) : allEnquiries.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No requests yet</p>
              <p className="text-sm text-muted-foreground">Quote requests will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {allEnquiries.map((enquiry) => (
                <Link 
                  key={enquiry.id}
                  href={`/admin/enquiries/${enquiry.id}`}
                  className="flex items-center gap-6 px-6 py-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <p className="font-medium truncate">
                        {enquiry.first_name} {enquiry.last_name}
                      </p>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusConfig[enquiry.status]?.className || "bg-muted text-muted-foreground"}`}>
                        {statusConfig[enquiry.status]?.label || enquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{enquiry.email}</p>
                  </div>
                  
                  {/* Quote & Type */}
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold">
                      {enquiry.quote_amount ? `£${enquiry.quote_amount.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transactionLabels[enquiry.transaction_type || ""] || "—"}
                    </p>
                  </div>
                  
                  {/* Date */}
                  <div className="text-right w-20 hidden md:block">
                    <p className="text-sm text-muted-foreground">{formatDate(enquiry.created_at)}</p>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
