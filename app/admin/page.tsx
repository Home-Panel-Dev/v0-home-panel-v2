import { createClient } from "@/lib/supabase/server"
import { createAdminClient, getStatusLabel, getStatusStyle } from "@/lib/database"
import Link from "next/link"
import { FileText, Clock, CheckCircle, Users, ArrowRight, TrendingUp, Briefcase, Activity } from "lucide-react"
import { formatCurrency, formatRelativeTime, getTransactionLabel } from "@/lib/utils/format"

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
  onboarding_status: string | null
  created_at: string
}

type Case = {
  id: string
  case_reference: string
  client_name: string
  status: string
  created_at: string
}

type ActivityItem = {
  id: string
  action: string
  description: string
  actor_type: string
  created_at: string
  enquiry_id: string | null
  case_id: string | null
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  // Fetch enquiries
  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20)

  // Fetch cases
  const { data: cases } = await adminClient
    .from("cases")
    .select("id, case_reference, client_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10)

  // Fetch recent activity
  const { data: activities } = await adminClient
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const allEnquiries = (enquiries || []) as Enquiry[]
  const allCases = (cases || []) as Case[]
  const recentActivities = (activities || []) as ActivityItem[]
  
  const enquiryStats = {
    new: allEnquiries.filter(e => e.status === "new").length,
    onboarding: allEnquiries.filter(e => e.status === "onboarding_invited" || e.status === "onboarding" || e.onboarding_status === "in_progress").length,
    accepted: allEnquiries.filter(e => e.status === "accepted" || e.status === "converted").length,
    total: allEnquiries.length,
    totalValue: allEnquiries.reduce((sum, e) => sum + (e.quote_amount || 0), 0)
  }

  const caseStats = {
    active: allCases.filter(c => !["completed", "cancelled"].includes(c.status)).length,
    completed: allCases.filter(c => c.status === "completed").length,
    total: allCases.length,
  }

  function formatActivityAction(action: string): string {
    const labels: Record<string, string> = {
      enquiry_submitted: "New enquiry submitted",
      onboarding_invited: "Onboarding invite sent",
      onboarding_step_completed: "Onboarding step completed",
      onboarding_completed: "Onboarding completed",
      document_uploaded: "Document uploaded",
      document_reviewed: "Document reviewed",
      case_created: "Case created",
      case_status_changed: "Case status updated",
      firm_assigned: "Firm assigned",
    }
    return labels[action] || action.replace(/_/g, " ")
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of enquiries, cases, and activity</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
        {[
          { label: "New Enquiries", value: enquiryStats.new, icon: FileText, color: "text-blue-600 bg-blue-50" },
          { label: "Onboarding", value: enquiryStats.onboarding, icon: Clock, color: "text-purple-600 bg-purple-50" },
          { label: "Active Cases", value: caseStats.active, icon: Briefcase, color: "text-accent bg-accent/10" },
          { label: "Completed", value: caseStats.completed, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Total Enquiries", value: enquiryStats.total, icon: Users, color: "text-foreground/60 bg-muted" },
          { label: "Quote Value", value: `£${enquiryStats.totalValue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Recent Enquiries</h2>
            <Link 
              href="/admin/enquiries" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {allEnquiries.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">No enquiries yet</p>
                <p className="text-sm text-muted-foreground">Quote requests will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {allEnquiries.slice(0, 8).map((enquiry) => (
                  <Link 
                    key={enquiry.id}
                    href={`/admin/enquiries/${enquiry.id}`}
                    className="flex items-center gap-6 px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <p className="font-medium truncate">
                          {enquiry.first_name} {enquiry.last_name}
                        </p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(enquiry.status)}`}>
                          {getStatusLabel(enquiry.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{enquiry.email}</p>
                    </div>
                    
                    <div className="text-right hidden sm:block">
                      <p className="font-semibold">
                        {formatCurrency(enquiry.quote_amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getTransactionLabel(enquiry.transaction_type)}
                      </p>
                    </div>
                    
                    <div className="text-right w-20 hidden md:block">
                      <p className="text-sm text-muted-foreground">{formatRelativeTime(enquiry.created_at)}</p>
                    </div>
                    
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cases Section */}
          {allCases.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Active Cases</h2>
                <Link 
                  href="/admin/cases" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="divide-y divide-border">
                  {allCases.slice(0, 5).map((caseItem) => (
                    <Link 
                      key={caseItem.id}
                      href={`/admin/cases/${caseItem.id}`}
                      className="flex items-center gap-6 px-6 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-0.5">
                          <p className="font-mono text-sm font-medium">{caseItem.case_reference}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(caseItem.status)}`}>
                            {getStatusLabel(caseItem.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{caseItem.client_name}</p>
                      </div>
                      
                      <div className="text-right w-20 hidden md:block">
                        <p className="text-sm text-muted-foreground">{formatRelativeTime(caseItem.created_at)}</p>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </h2>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            {recentActivities.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">
                        {activity.description || formatActivityAction(activity.action)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(activity.created_at)}
                        {activity.enquiry_id && (
                          <Link href={`/admin/enquiries/${activity.enquiry_id}`} className="ml-1 hover:underline">
                            View enquiry
                          </Link>
                        )}
                        {activity.case_id && (
                          <Link href={`/admin/cases/${activity.case_id}`} className="ml-1 hover:underline">
                            View case
                          </Link>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
