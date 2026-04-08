"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  ArrowRight,
  Building2,
  Briefcase,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { CasesTableSkeleton } from "@/components/admin/skeletons"
import { getStatusLabel, getStatusStyle } from "@/lib/database"
import { formatCurrency, formatDate } from "@/lib/utils/format"

interface Case {
  id: string
  case_reference: string
  status: string
  client_name: string
  client_email: string
  property_address: string | null
  property_postcode: string | null
  property_value: number | null
  transaction_type: string | null
  assigned_firm_name: string | null
  id_verification_status: string
  source_of_funds_status: string
  created_at: string
  updated_at: string
}

export default function AdminCasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      setError(null)
      const res = await fetch("/api/admin/cases")
      if (!res.ok) throw new Error("Failed to fetch cases")
      const data = await res.json()
      setCases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return cases
    const query = searchQuery.toLowerCase()
    return cases.filter(c => 
      c.client_name?.toLowerCase().includes(query) ||
      c.client_email?.toLowerCase().includes(query) ||
      c.case_reference?.toLowerCase().includes(query) ||
      c.property_address?.toLowerCase().includes(query)
    )
  }, [cases, searchQuery])

  const getComplianceProgress = (c: Case) => {
    let completed = 0
    if (c.id_verification_status === "completed" || c.id_verification_status === "approved") completed++
    if (c.source_of_funds_status === "completed" || c.source_of_funds_status === "approved") completed++
    return completed
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cases</h1>
          <p className="text-muted-foreground mt-1">Loading cases...</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search cases..." className="pl-10 h-10" disabled />
          </div>
        </div>
        <CasesTableSkeleton rows={8} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cases</h1>
          <p className="text-muted-foreground mt-1">Unable to load cases</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-card border border-border rounded-xl">
          <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchCases}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cases</h1>
        <p className="text-muted-foreground mt-1">
          Manage active property transactions
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search cases..." 
            className="pl-10 h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Cases list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No cases found matching your search" : "No cases yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Convert enquiries to cases from the enquiry detail page
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reference</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Property</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Compliance</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm font-medium">
                        {caseItem.case_reference}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-sm">{caseItem.client_name}</p>
                        <p className="text-xs text-muted-foreground">{caseItem.client_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm">{caseItem.property_address || "Address pending"}</p>
                          {caseItem.property_postcode && (
                            <p className="text-xs text-muted-foreground">{caseItem.property_postcode}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(caseItem.status)}`}>
                        {getStatusLabel(caseItem.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[0, 1].map((i) => (
                            <div 
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                i < getComplianceProgress(caseItem) 
                                  ? "bg-accent" 
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getComplianceProgress(caseItem)}/2
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium">
                        {formatCurrency(caseItem.property_value)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(caseItem.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
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
        )}
      </div>
    </div>
  )
}
