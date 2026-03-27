"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Check, 
  ChevronDown,
  Send,
  Loader2,
  Mail,
  FileText
} from "lucide-react"

interface Firm {
  id: string
  name: string
  slug: string
  primary_color: string
  sra_number: string | null
  address: string | null
}

interface FirmAssignmentPanelProps {
  enquiryId: string
  currentFirmId: string | null
  currentFirm: Firm | null
  clientCareSentAt: string | null
  onFirmAssigned?: (firm: Firm) => void
}

export function FirmAssignmentPanel({
  enquiryId,
  currentFirmId,
  currentFirm,
  clientCareSentAt,
  onFirmAssigned,
}: FirmAssignmentPanelProps) {
  const [firms, setFirms] = useState<Firm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(currentFirm)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchFirms()
  }, [])

  const fetchFirms = async () => {
    try {
      const response = await fetch("/api/admin/firms")
      if (response.ok) {
        const data = await response.json()
        setFirms(data.filter((f: Firm) => f.id !== currentFirmId))
      }
    } catch (err) {
      console.error("Failed to fetch firms:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignFirm = async (firm: Firm) => {
    setIsAssigning(true)
    setError(null)
    setShowDropdown(false)

    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}/assign-firm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmId: firm.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to assign firm")
      }

      setSelectedFirm(firm)
      setSuccess(`Assigned to ${firm.name}`)
      onFirmAssigned?.(firm)
      
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign firm")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleSendClientCare = async () => {
    if (!selectedFirm) {
      setError("Please assign a firm first")
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/enquiries/${enquiryId}/send-client-care`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendClientCare: true, sendOnboarding: true }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.errors?.join(", ") || data.error || "Failed to send emails")
      }

      setSuccess("Client care and onboarding emails sent!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send emails")
    } finally {
      setIsSending(false)
    }
  }

  const displayFirm = selectedFirm || currentFirm

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Firm Assignment</h3>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-accent/10 text-accent text-sm rounded-lg p-3 mb-4 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Current/Selected Firm */}
      {displayFirm ? (
        <div className="mb-4">
          <div 
            className="flex items-center gap-3 p-3 rounded-xl border border-border"
            style={{ borderLeftColor: displayFirm.primary_color, borderLeftWidth: 4 }}
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: displayFirm.primary_color }}
            >
              {displayFirm.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{displayFirm.name}</p>
              {displayFirm.sra_number && (
                <p className="text-xs text-muted-foreground">SRA: {displayFirm.sra_number}</p>
              )}
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isAssigning}
              >
                Change
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-card rounded-xl border border-border shadow-lg z-10">
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    </div>
                  ) : firms.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No other firms available
                    </div>
                  ) : (
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {firms.map((firm) => (
                        <button
                          key={firm.id}
                          onClick={() => handleAssignFirm(firm)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                            style={{ backgroundColor: firm.primary_color }}
                          >
                            {firm.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{firm.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isAssigning}
            >
              <span className="text-muted-foreground">Select a firm...</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card rounded-xl border border-border shadow-lg z-10">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : firms.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No firms available
                  </div>
                ) : (
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {firms.map((firm) => (
                      <button
                        key={firm.id}
                        onClick={() => handleAssignFirm(firm)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs"
                          style={{ backgroundColor: firm.primary_color }}
                        >
                          {firm.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{firm.name}</p>
                          {firm.sra_number && (
                            <p className="text-xs text-muted-foreground">SRA: {firm.sra_number}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Client Care Button */}
      {displayFirm && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {clientCareSentAt 
                ? `Client care sent ${new Date(clientCareSentAt).toLocaleDateString("en-GB")}`
                : "Client care not yet sent"
              }
            </span>
          </div>
          
          <Button
            onClick={handleSendClientCare}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Client Care & Onboarding
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Sends firm-branded client care letter and onboarding invite
          </p>
        </div>
      )}
    </div>
  )
}
