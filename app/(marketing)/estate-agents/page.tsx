import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { CTASection } from "@/components/cta-section"
import { CheckCircle2, ArrowRight } from "lucide-react"

const benefits = [
  { title: "Enhanced client experience", description: "Offer your clients a premium guided conveyancing journey that sets you apart.", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80&fit=crop" },
  { title: "Faster completions", description: "Pre-qualified, well-prepared clients mean fewer delays and smoother transactions.", image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80&fit=crop" },
  { title: "Increased referrals", description: "Exceptional service leads to more recommendations and repeat business.", image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&q=80&fit=crop" },
]

const features = [
  "Seamless integration with your existing process",
  "Regular updates on client progress",
  "Dedicated partnership support",
  "Co-branded client communications",
  "Performance reporting and insights",
  "No setup fees or hidden costs",
]

export default function EstateAgentsPage() {
  return (
    <>
      <PageHero
        title="Elevate your client service"
        subtitle="Partner with The Home Panel to offer a seamless conveyancing experience that reflects your commitment to exceptional service."
        ctaText="Become a partner"
        ctaHref="/contact"
        secondaryCtaText="Learn more"
        secondaryCtaHref="#benefits"
        image="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1600&q=80&fit=crop"
      />

      <section id="benefits" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Benefits</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Why estate agents choose us</h2>
            <p className="text-muted-foreground text-lg">We help you deliver a premium moving experience that keeps clients coming back.</p>
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
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">What you get</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-6">Everything you need as a partner</h2>
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
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&fit=crop" alt="Estate agent partnership" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to partner with us?"
        subtitle="Get in touch to learn how we can work together to serve your clients better."
        ctaText="Contact us"
        ctaHref="/contact"
      />
    </>
  )
}
