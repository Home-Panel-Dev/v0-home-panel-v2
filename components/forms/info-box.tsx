"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Info, AlertCircle, CheckCircle } from "lucide-react"

interface InfoBoxProps {
  variant?: "default" | "success" | "warning"
  icon?: boolean
  className?: string
  children: React.ReactNode
}

export function InfoBox({
  variant = "default",
  icon = false,
  className,
  children,
}: InfoBoxProps) {
  const Icon = variant === "success" ? CheckCircle : variant === "warning" ? AlertCircle : Info

  return (
    <div
      className={cn(
        "p-4 rounded-xl text-sm leading-relaxed",
        variant === "default" && "bg-muted text-muted-foreground",
        variant === "success" && "bg-accent/10 text-accent-foreground border border-accent/20",
        variant === "warning" && "bg-destructive/10 text-destructive border border-destructive/20",
        className
      )}
    >
      {icon ? (
        <div className="flex gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}
