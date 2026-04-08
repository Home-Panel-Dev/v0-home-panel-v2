import { Metadata } from "next"
import { MultiStepForm } from "@/components/multi-step-form"
import { Shield, Clock, Award } from "lucide-react"

export const metadata: Metadata = {
  title: "Get a Quote | HomePanel",
  description: "Begin your home moving journey with HomePanel. Submit your enquiry in just a few minutes.",
}

const trustIndicators = [
  {
    icon: Clock,
    label: "2-3 minute quote",
  },
  {
    icon: Shield,
    label: "No obligation",
  },
  {
    icon: Award,
    label: "CQS accredited",
  },
]

export default function StartPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="max-w-xl mx-auto text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-3 text-balance">
            Get your conveyancing quote
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Answer a few questions about your move. It only takes a few minutes.
          </p>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {trustIndicators.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <MultiStepForm />

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-md mx-auto">
          Your information is protected under GDPR and will only be used to provide your quote and related services.
        </p>
      </div>
    </div>
  )
}
