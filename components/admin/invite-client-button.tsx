"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, Loader2, Check } from "lucide-react"

interface InviteClientButtonProps {
  enquiryId: string
  clientName: string
  currentStatus: string
}

export function InviteClientButton({ enquiryId, clientName, currentStatus }: InviteClientButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInvite = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiryId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite")
      }

      setIsSuccess(true)
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite")
    } finally {
      setIsLoading(false)
    }
  }

  // Already onboarding or beyond
  if (["onboarding", "active", "completed"].includes(currentStatus)) {
    return (
      <Button 
        disabled 
        className="w-full justify-center gap-2 h-10 font-medium bg-slate-100 text-slate-500"
        size="sm"
      >
        <Check className="h-4 w-4" />
        Invite Sent
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleInvite}
        disabled={isLoading || isSuccess}
        className="w-full bg-emerald-600 hover:bg-emerald-700 justify-center gap-2 h-10 font-medium" 
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending Invite...
          </>
        ) : isSuccess ? (
          <>
            <Check className="h-4 w-4" />
            Invite Sent!
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Invite to Onboarding
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}
