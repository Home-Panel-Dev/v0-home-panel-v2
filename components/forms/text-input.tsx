"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  prefix?: string
  suffix?: string
  error?: boolean
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, icon, prefix, suffix, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            // Base styles
            "w-full h-12 px-4 rounded-xl border bg-background text-foreground text-base",
            // Placeholder and transitions
            "placeholder:text-muted-foreground transition-all duration-200",
            // Border colors
            "border-input",
            // Focus states
            "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground",
            // Error state
            error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
            // Disabled state
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted",
            // Icon padding
            icon && "pl-11",
            // Prefix padding
            prefix && "pl-8",
            // Suffix padding
            suffix && "pr-12",
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    )
  }
)

TextInput.displayName = "TextInput"
