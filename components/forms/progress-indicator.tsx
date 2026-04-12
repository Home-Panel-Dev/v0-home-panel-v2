"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0
  const safeProgress = Number.isNaN(progress) ? 0 : Math.min(Math.max(progress, 0), 100)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {Math.round(safeProgress)}% complete
        </span>
      </div>
      <div className="h-0.5 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-foreground rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}
