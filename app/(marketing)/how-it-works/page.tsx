import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { CTASection } from "@/components/cta-section"
import { CheckCircle2, ArrowRight } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Get an instant quote",
    description: "Tell us about your move — transaction type, property value, tenure. Our form takes under 3 minutes and gives you a fixed-fee quote immediately.",
    details: ["Select buying, selling, or both", "Enter property value and postcode", "Get a fixed-fee quote instantly", "No obligation to proceed"],
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=700&q=80&fit=crop",
  },
  {
    number: "02",
    title: "We review your enquiry",
    description: "Our team reviews your submission and prepares your case file. Within one business day we'll be in touch to confirm everything and send your onboarding link.",
    details: ["Information verified by our team", "Case reference assigned", "Onboarding link sent to you", "Response within 1 business day"],
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80&fit=crop",
  },
  {
    number: "03",
    title: "Complete your onboarding",
    description: "Complete your secure onboarding online — identity verification, source of funds, and document upload. All handled digitally through our platform.",
    details: ["Photo ID verification via Credas", "Source of funds declaration", "Document upload portal", "Takes around 10 minutes"],
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80&fit=crop",
  },
  {
    number: "04",
    title: "Your solicitor takes over",
    description: "Once onboarding is complete, your dedicated solicitor is allocated and begins work immediately. You'll receive updates throughout the process.",
    details: ["Named solicitor assigned to your case", "Regular progress updates", "Direct communication with your solicitor", "Through to completion"],
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=700&q=80&fit=crop",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        title="A guided path to your new home"
        subtitle="HomePanel transforms the complexity of conveyancing into a simple, step-by-step journey. Here's exactly how it works."
        ctaText="Start your move"
        ctaHref="/start"
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80&fit=crop"
      />

      {/* Steps */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
              >
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="text-6xl font-semibold text-muted-foreground/20 mb-4">{step.number}</div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4">{step.title}</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-foreground flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`rounded-2xl overflow-hidden aspect-[4/3] ${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-24 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Why clients choose us</p>
            <h2 className="text-3xl font-semibold tracking-tight">Designed to remove stress</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              "No confusing jargon or complex forms",
              "Personal support throughout your journey",
              "Complete transparency on progress",
              "Documentation prepared upfront",
              "SRA regulated solicitors",
              "Fixed fees — no surprises",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                <CheckCircle2 className="h-4 w-4 text-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to experience the difference?"
        subtitle="Get your instant fixed-fee quote in under 3 minutes."
        ctaText="Start your move"
        ctaHref="/start"
      />
    </>
  )
}
