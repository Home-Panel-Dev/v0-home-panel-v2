import { Metadata } from "next"
import { MultiStepForm } from "@/components/multi-step-form"

export const metadata: Metadata = {
  title: "Get a Quote | HomePanel",
  description: "Begin your home moving journey with HomePanel. Submit your enquiry in just a few minutes.",
}

export default function StartPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 lg:py-20">
        {/* Header */}
        <div className="max-w-xl mx-auto text-center mb-12">
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-3">
            Get your conveyancing quote
          </h1>
          <p className="text-muted-foreground">
            Answer a few questions about your move. It only takes a few minutes.
          </p>
        </div>

        {/* Form */}
        <MultiStepForm />
      </div>
    </div>
  )
}
