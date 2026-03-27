"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, ChevronRight, Check, Loader2, X } from "lucide-react"

interface Firm {
  id: string
  name: string
  brand_color?: string
}

interface AssignFirmButtonProps {
  enquiryId: string
  assignedFirm?: {
    id: string
    name: string
    brand_color?: string
  } | null
}

export function AssignFirmButton({ enquiryId, assignedFirm }: AssignFirmButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [firms, setFirms] = useState<Firm[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && firms.length === 0) {
      loadFirms()
    }
  }, [isOpen])

  const loadFirms = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/firms")
      if (res.ok) {
        const data = await res.json()
        setFirms(data.filter((f: Firm & { is_active?: boolean }) => f.is_active !== false))
      }
    } catch (err) {
      console.error("Failed to load firms:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (firmId: string) => {
    setAssigning(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}/assign-firm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmId }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to assign firm")
      }
      
      setIsOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign firm")
    } finally {
      setAssigning(false)
    }
  }

  if (isOpen) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Select Firm</span>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {firms.map((firm) => (
              <button
                key={firm.id}
                onClick={() => handleAssign(firm.id)}
                disabled={assigning}
                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted text-left text-sm transition-colors disabled:opacity-50"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: firm.brand_color || "#1a1a1a" }}
                />
                <span className="flex-1 truncate">{firm.name}</span>
                {assignedFirm?.id === firm.id && (
                  <Check className="h-4 w-4 text-accent" />
                )}
              </button>
            ))}
            {firms.length === 0 && (
              <p className="text-sm text-muted-foreground py-2 text-center">No firms available</p>
            )}
          </div>
        )}
        
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }

  return (
    <Button 
      variant="outline" 
      className="w-full justify-between group h-10 border-border" 
      size="sm"
      onClick={() => setIsOpen(true)}
    >
      <span className="flex items-center gap-2 text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        {assignedFirm ? (
          <span className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: assignedFirm.brand_color || "#1a1a1a" }}
            />
            {assignedFirm.name}
          </span>
        ) : (
          "Assign Firm"
        )}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
    </Button>
  )
}
