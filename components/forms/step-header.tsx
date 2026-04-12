"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StepHeaderProps {
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

export function StepHeader({
  title,
  description,
  align = "left",
  className,
}: StepHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="text-2xl font-semibold text-foreground tracking-tight leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed max-w-lg mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
