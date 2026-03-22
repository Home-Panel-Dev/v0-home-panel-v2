"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Briefcase, Loader2 } from "lucide-react"

interface ConvertToCaseButtonProps {
  enquiryId: string
  disabled?: boolean
}

export function ConvertToCaseButton({ enquiryId, disabled }: ConvertToCaseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConvert = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enquiryId })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to convert to case")
        return
      }

      // Redirect to the new case
      router.push(`/admin/cases/${data.id}`)
    } catch (err) {
      setError("Failed to convert to case")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button 
        onClick={handleConvert}
        disabled={loading || disabled}
        className="bg-foreground hover:bg-foreground/90 text-background gap-2 font-medium" 
        size="sm"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Briefcase className="h-4 w-4" />
        )}
        Convert to Case
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
