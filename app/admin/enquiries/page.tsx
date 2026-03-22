"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { 
  ArrowRight,
  Search,
  FileText,
  Loader2,
  RefreshCw
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getStatusLabel, getStatusStyle } from "@/lib/database"
import { formatCurrency, formatDate, getTransactionLabel, getInitials } from "@/lib/utils/format"

interface Enquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  property_address: string | null
  transaction_type: string | null
  quote_amount: number | null
  status: string
  created_at: string
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchEnquiries = async () => {
    try {
      setError(null)
      const res = await fetch("/api/admin/enquiries")
      if (!res.ok) throw new Error("Failed to fetch enquiries")
      const data = await res.json()
      setEnquiries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const filteredEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries
    const query = searchQuery.toLowerCase()
    return enquiries.filter(e => 
      e.first_name?.toLowerCase().includes(query) ||
      e.last_name?.toLowerCase().includes(query) ||
      e.email?.toLowerCase().includes(query) ||
      e.property_address?.toLowerCase().includes(query) ||
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(query)
    )
  }, [enquiries, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={fetchEnquiries}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground mt-1">
            {enquiries.length} total enquiries
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or property..." 
            className="pl-9 h-10 bg-background border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchEnquiries}
          className="h-10 w-10"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Enquiries List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No enquiries match your search" : "No enquiries yet"}
            </p>
            {searchQuery && (
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredEnquiries.map((enquiry) => (
              <Link 
                key={enquiry.id} 
                href={`/admin/enquiries/${enquiry.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-muted-foreground">
                      {getInitials(enquiry.first_name, enquiry.last_name)}
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
                    <p className="font-medium">{formatCurrency(enquiry.quote_amount)}</p>
                  </div>
                  <div className="w-24">
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">{formatDate(enquiry.created_at)}</p>
                  </div>
                  <div className="w-24">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(enquiry.status || "new")}`}>
                      {getStatusLabel(enquiry.status || "new")}
                    </span>
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
