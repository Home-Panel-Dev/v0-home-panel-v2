import { PageHero } from "@/components/page-hero"
import { CTASection } from "@/components/cta-section"
import { CheckCircle2 } from "lucide-react"

const benefits = [
  { title: "Pre-qualified clients", description: "Every client has been reviewed and qualified before allocation, saving you time on initial checks.", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80&fit=crop" },
  { title: "Complete documentation", description: "Clients arrive with all necessary information gathered, reducing delays and follow-ups.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&fit=crop" },
  { title: "Quality referrals", description: "Receive a steady stream of qualified instructions from our partner network.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&fit=crop" },
]

const features = [
  "Pre-verified client identity and AML checks",
  "Standardised onboarding documentation",
  "Clear client expectations set upfront",
  "Integrated communication channels",
  "Performance analytics and reporting",
  "Dedicated support team",
]

export default function SolicitorsPage() {
  return (
    <>
      <PageHero
        title="Clients ready to progress"
        subtitle="The Home Panel delivers pre-qualified, well-prepared clients with complete documentation, so you can focus on what you do best."
        ctaText="Become a partner"
        ctaHref="/contact"
        secondaryCtaText="Learn more"
        secondaryCtaHref="#benefits"
        image="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80&fit=crop"
      />

      <section id="benefits" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Benefits</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Why solicitors choose us</h2>
            <p className="text-muted-foreground text-lg">We handle the onboarding so you can focus on delivering excellent conveyancing.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="group">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-6">
                  <img src={benefit.image} alt={benefit.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">What you receive</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-6">Everything you need to start work with confidence</h2>
              <div className="grid grid-cols-1 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                    <CheckCircle2 className="h-4 w-4 text-foreground flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden aspect-square">
              <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fit=crop" alt="Solicitor partnership" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to receive quality instructions?"
        subtitle="Join our network of trusted solicitors and start receiving pre-qualified clients."
        ctaText="Contact us"
        ctaHref="/contact"
      />
    </>
  )
}
