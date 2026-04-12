import { Metadata } from "next"
import { MultiStepForm } from "@/components/multi-step-form"
import { Shield, Clock, Award, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "Get a Quote | HomePanel",
  description: "Begin your home moving journey with HomePanel. Submit your enquiry in just a few minutes.",
}

export default function StartPage() {
  return (
    <div className="relative min-h-screen">

      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80&fit=crop"
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "grayscale(50%) brightness(0.25)" }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 lg:px-8 py-16 lg:py-24">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-3 text-white">
            Get your instant quote
          </h1>
          <p className="text-white/60 leading-relaxed">
            A few questions about your move. Takes under 3 minutes.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {[
              { icon: Clock, label: "Under 3 minutes" },
              { icon: Shield, label: "No obligation" },
              { icon: Award, label: "SRA regulated" },
              { icon: Lock, label: "GDPR protected" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 text-xs text-white/50 bg-white/10 border border-white/10 rounded-full px-3 py-1.5"
              >
                <item.icon className="w-3 h-3" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <MultiStepForm />

        {/* Footer */}
        <p className="text-center text-xs text-white/30 mt-8 max-w-md mx-auto">
          Your information is protected under GDPR and will only be used to provide your quote and related conveyancing services.
        </p>
      </div>
    </div>
  )
}
