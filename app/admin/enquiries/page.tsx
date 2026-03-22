import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { 
  ArrowRight,
  Search,
  Filter
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function EnquiriesPage() {
  const supabase = await createClient()

  const { data: enquiries } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-blue-50 text-blue-700",
      under_review: "bg-amber-50 text-amber-700",
      accepted: "bg-green-50 text-green-700",
      onboarding_invited: "bg-purple-50 text-purple-700",
      onboarding: "bg-purple-50 text-purple-700",
      active: "bg-green-50 text-green-700",
      completed: "bg-muted text-muted-foreground",
      rejected: "bg-red-50 text-red-700"
    }
    const labels: Record<string, string> = {
      new: "New",
      under_review: "Reviewing",
      accepted: "Accepted",
      onboarding_invited: "Invited",
      onboarding: "Onboarding",
      active: "Active",
      completed: "Complete",
      rejected: "Declined"
    }
    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.new}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      buying: "Buying",
      selling: "Selling",
      "buying-and-selling": "Buying & Selling",
      remortgage: "Remortgage",
      "transfer-of-equity": "Transfer of Equity"
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground mt-1">
            {enquiries?.length || 0} total enquiries
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search enquiries..." 
            className="pl-9 h-10 bg-background border-border"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-10 border-border">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Enquiries List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {!enquiries || enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No enquiries yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {enquiries.map((enquiry) => (
              <Link 
                key={enquiry.id} 
                href={`/admin/enquiries/${enquiry.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-muted-foreground">
                      {enquiry.first_name?.[0]}{enquiry.last_name?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {enquiry.first_name} {enquiry.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {enquiry.email}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm">
                  <div className="w-32">
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-medium">{getTransactionLabel(enquiry.transaction_type)}</p>
                  </div>
                  <div className="w-24">
                    <p className="text-muted-foreground text-xs">Quote</p>
                    <p className="font-medium">{formatCurrency(enquiry.quote_amount || 0)}</p>
                  </div>
                  <div className="w-24">
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">{formatDate(enquiry.created_at)}</p>
                  </div>
                  <div className="w-24">
                    {getStatusBadge(enquiry.status || "new")}
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
