"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxFieldProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  required?: boolean
  variant?: "default" | "card"
  className?: string
}

export function CheckboxField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  required,
  variant = "default",
  className,
}: CheckboxFieldProps) {
  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-4 rounded-xl border cursor-pointer transition-all duration-200",
          checked
            ? "border-foreground bg-foreground/5"
            : "border-border hover:border-foreground/40",
          className
        )}
        onClick={() => onCheckedChange(!checked)}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(value) => onCheckedChange(value as boolean)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <label
              htmlFor={id}
              className="text-sm font-medium cursor-pointer block text-foreground"
            >
              {label}
              {required && <span className="text-destructive ml-0.5">*</span>}
            </label>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value as boolean)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={id}
          className="text-sm font-medium cursor-pointer block text-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
