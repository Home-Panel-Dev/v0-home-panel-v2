import { Metadata } from "next"
import { MultiStepForm } from "@/components/multi-step-form"

export const metadata: Metadata = {
  title: "Start Your Move | HomePanel",
  description: "Begin your home moving journey with HomePanel. Submit your enquiry in just a few minutes.",
}

export default function StartPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Start your move
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Tell us about your move. It only takes a few minutes to submit your enquiry, and our team will guide you through the next steps.
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 lg:p-12">
          <MultiStepForm />
        </div>
      </div>
    </div>
  )
}
