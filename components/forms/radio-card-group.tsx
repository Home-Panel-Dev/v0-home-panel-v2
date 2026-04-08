"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface RadioOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
}

interface RadioCardGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  layout?: "horizontal" | "vertical" | "grid"
  variant?: "card" | "pill"
  className?: string
}

export function RadioCardGroup({
  options,
  value,
  onChange,
  layout = "vertical",
  variant = "card",
  className,
}: RadioCardGroupProps) {
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "flex flex-wrap gap-2",
          layout === "vertical" && "flex-col",
          layout === "horizontal" && "flex-row",
          className
        )}
      >
        {options.map((option) => (
          <PillOption
            key={option.value}
            option={option}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "grid gap-3",
        layout === "vertical" && "grid-cols-1",
        layout === "horizontal" && "grid-cols-2",
        layout === "grid" && "grid-cols-2 sm:grid-cols-3",
        className
      )}
    >
      {options.map((option) => (
        <CardOption
          key={option.value}
          option={option}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  )
}

function PillOption({
  option,
  selected,
  onClick,
}: {
  option: RadioOption
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-200",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:border-foreground/40"
      )}
    >
      <span
        className={cn(
          "w-4 h-4 rounded-full border-2 mr-2.5 flex items-center justify-center flex-shrink-0",
          selected ? "border-background" : "border-muted-foreground/50"
        )}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-background" />}
      </span>
      {option.label}
    </button>
  )
}

function CardOption({
  option,
  selected,
  onClick,
}: {
  option: RadioOption
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200",
        selected
          ? "border-foreground bg-foreground/5 ring-1 ring-foreground"
          : "border-border hover:border-foreground/40"
      )}
    >
      <div className="flex items-start gap-3 w-full">
        <div
          className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
            selected ? "border-foreground bg-foreground" : "border-muted-foreground/50"
          )}
        >
          {selected && <Check className="w-3 h-3 text-background" />}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground block">
            {option.label}
          </span>
          {option.description && (
            <span className="text-sm text-muted-foreground mt-1 block">
              {option.description}
            </span>
          )}
        </div>
        {option.icon && (
          <div className="text-muted-foreground flex-shrink-0">{option.icon}</div>
        )}
      </div>
    </button>
  )
}
