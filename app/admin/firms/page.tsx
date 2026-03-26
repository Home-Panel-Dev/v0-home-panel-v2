"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { 
  ArrowRight,
  Search,
  Building2,
  Loader2,
  RefreshCw,
  Plus,
  Check,
  X
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Firm {
  id: string
  name: string
  slug: string
  logo_url: string | null
  brand_color: string
  sra_number: string | null
  is_active: boolean
  enquiry_count: number
  created_at: string
  updated_at: string
}

export default function FirmsPage() {
  const [firms, setFirms] = useState<Firm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newFirm, setNewFirm] = useState({
    name: "",
    sra_number: "",
    email: "",
    phone: "",
    brand_color: "#1a1a1a"
  })

  const fetchFirms = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/admin/firms")
      if (!res.ok) throw new Error("Failed to fetch firms")
      const data = await res.json()
      setFirms(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFirms()
  }, [])

  const filteredFirms = useMemo(() => {
    let result = firms
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.sra_number?.toLowerCase().includes(query)
      )
    }
    
    if (filterActive !== null) {
      result = result.filter(f => f.is_active === filterActive)
    }
    
    return result
  }, [firms, searchQuery, filterActive])

  const handleCreateFirm = async () => {
    if (!newFirm.name.trim()) return
    
    setCreating(true)
    try {
      const res = await fetch("/api/admin/firms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFirm)
      })
      
      if (!res.ok) throw new Error("Failed to create firm")
      
      setIsCreateOpen(false)
      setNewFirm({ name: "", sra_number: "", email: "", phone: "", brand_color: "#1a1a1a" })
      fetchFirms()
    } catch (err) {
      console.error("Create firm error:", err)
    } finally {
      setCreating(false)
    }
  }

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
        <Button variant="outline" onClick={fetchFirms}>
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
          <h1 className="text-2xl font-semibold tracking-tight">Firms</h1>
          <p className="text-muted-foreground mt-1">
            {firms.length} registered {firms.length === 1 ? "firm" : "firms"}
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Firm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Firm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Firm Name *</Label>
                <Input
                  id="name"
                  value={newFirm.name}
                  onChange={(e) => setNewFirm({ ...newFirm, name: e.target.value })}
                  placeholder="e.g. Smith & Partners Solicitors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sra">SRA Number</Label>
                <Input
                  id="sra"
                  value={newFirm.sra_number}
                  onChange={(e) => setNewFirm({ ...newFirm, sra_number: e.target.value })}
                  placeholder="e.g. 123456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newFirm.email}
                    onChange={(e) => setNewFirm({ ...newFirm, email: e.target.value })}
                    placeholder="enquiries@firm.co.uk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newFirm.phone}
                    onChange={(e) => setNewFirm({ ...newFirm, phone: e.target.value })}
                    placeholder="020 1234 5678"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newFirm.brand_color}
                    onChange={(e) => setNewFirm({ ...newFirm, brand_color: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={newFirm.brand_color}
                    onChange={(e) => setNewFirm({ ...newFirm, brand_color: e.target.value })}
                    placeholder="#1a1a1a"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFirm} disabled={creating || !newFirm.name.trim()}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Firm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search firms..." 
            className="pl-9 h-10 bg-background border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={filterActive === null ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterActive(null)}
          >
            All
          </Button>
          <Button 
            variant={filterActive === true ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterActive(true)}
          >
            Active
          </Button>
          <Button 
            variant={filterActive === false ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterActive(false)}
          >
            Inactive
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchFirms}
          className="h-10 w-10"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Firms List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filteredFirms.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || filterActive !== null ? "No firms match your filters" : "No firms added yet"}
            </p>
            {(searchQuery || filterActive !== null) && (
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => { setSearchQuery(""); setFilterActive(null); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredFirms.map((firm) => (
              <Link 
                key={firm.id} 
                href={`/admin/firms/${firm.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: firm.brand_color }}
                  >
                    {firm.logo_url ? (
                      <img src={firm.logo_url} alt={firm.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-sm font-semibold text-white">
                        {firm.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{firm.name}</p>
                      {firm.is_active ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                          <Check className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          <X className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {firm.sra_number ? `SRA ${firm.sra_number}` : "No SRA number"}
                    </p>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm">
                  <div className="w-32 text-right">
                    <p className="text-muted-foreground text-xs">Enquiries</p>
                    <p className="font-medium">{firm.enquiry_count}</p>
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
