import { PageHero } from "@/components/page-hero"
import { CTASection } from "@/components/cta-section"
import { CheckCircle2 } from "lucide-react"

const benefits = [
  { title: "Streamlined client journey", description: "Integrate conveyancing seamlessly into your mortgage process for a unified client experience.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&fit=crop" },
  { title: "Pre-prepared documentation", description: "Clients arrive at conveyancing with everything in order, reducing back-and-forth.", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&fit=crop" },
  { title: "Faster completions", description: "Well-prepared clients mean smoother transactions and quicker completions.", image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&q=80&fit=crop" },
]

const features = [
  "Direct integration with your workflow",
  "Real-time client status updates",
  "Dedicated account management",
  "White-label client experience",
  "Comprehensive analytics dashboard",
  "Flexible partnership arrangements",
]

export default function BrokersPage() {
  return (
    <>
      <PageHero
        title="Complement your mortgage service"
        subtitle="Enhance your client journey with integrated conveyancing that delivers a seamless experience from mortgage offer to completion."
        ctaText="Become a partner"
        ctaHref="/contact"
        secondaryCtaText="Learn more"
        secondaryCtaHref="#benefits"
        image="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1600&q=80&fit=crop"
      />

      <section id="benefits" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Benefits</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Why mortgage brokers choose us</h2>
            <p className="text-muted-foreground text-lg">We help you deliver a complete home buying experience your clients will remember.</p>
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
            <div className="rounded-3xl overflow-hidden aspect-square">
              <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&fit=crop" alt="Broker partnership" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Partner benefits</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-6">Everything for the complete home buying experience</h2>
              <div className="grid grid-cols-1 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border">
                    <CheckCircle2 className="h-4 w-4 text-foreground flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to enhance your service?"
        subtitle="Get in touch to discover how The Home Panel can complement your mortgage offering."
        ctaText="Contact us"
        ctaHref="/contact"
      />
    </>
  )
}
