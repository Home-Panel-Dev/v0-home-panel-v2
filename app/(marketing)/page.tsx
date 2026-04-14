import { Suspense } from "react"
import Link from "next/link"
import { Hero } from "@/components/hero"
import { CTASection } from "@/components/cta-section"
import { AuthRedirectHandler } from "@/components/auth-redirect-handler"
import { ArrowRight, Shield, Zap, Clock, HeartHandshake } from "lucide-react"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    title: "Get an instant quote",
    description: "Answer a few simple questions about your move and get a fixed-fee quote in under 3 minutes.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&fit=crop",
  },
  {
    number: "02",
    title: "Complete onboarding",
    description: "Verify your identity and submit your documents securely online — no branch visits needed.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&fit=crop",
  },
  {
    number: "03",
    title: "We handle the rest",
    description: "Your dedicated solicitor takes over and keeps you updated every step of the way.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80&fit=crop",
  },
]

const benefits = [
  { title: "Fixed fees", description: "Know exactly what you'll pay upfront. No surprises at completion.", icon: Shield },
  { title: "Fast onboarding", description: "Complete everything online in one sitting. No paperwork, no delays.", icon: Zap },
  { title: "Fewer delays", description: "Full documentation collected upfront means your case moves faster.", icon: Clock },
  { title: "Personal service", description: "A named solicitor handles your case from instruction to completion.", icon: HeartHandshake },
]

const partners = [
  {
    title: "Estate Agents",
    description: "Offer your clients seamless conveyancing that reflects your commitment to service.",
    href: "/estate-agents",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80&fit=crop",
  },
  {
    title: "Mortgage Brokers",
    description: "Enhance your client journey with integrated conveyancing alongside your mortgage service.",
    href: "/brokers",
    image: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&q=80&fit=crop",
  },
  {
    title: "Solicitors",
    description: "Receive pre-qualified, well-prepared clients ready to progress their transaction.",
    href: "/solicitors",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80&fit=crop",
  },
]

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>

      <Hero />

      {/* How it works */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              From quote to completion
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Three simple steps. No jargon. No stress.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="group">
                <div className="rounded-2xl overflow-hidden mb-6 aspect-[4/3] bg-muted">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-semibold text-muted-foreground/30 leading-none mt-1">{step.number}</span>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 lg:py-32 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&fit=crop"
                  alt="Luxury home interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-foreground text-background rounded-2xl p-6">
                <p className="text-4xl font-semibold">98%</p>
                <p className="text-sm text-background/70 mt-1">Client satisfaction</p>
              </div>
              <div className="absolute -top-6 -left-6 bg-background border border-border rounded-2xl p-6 shadow-sm">
                <p className="text-4xl font-semibold">5,000+</p>
                <p className="text-sm text-muted-foreground mt-1">Cases completed</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Why The Home Panel</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
                A better way to start your move
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                We believe moving home should feel effortless. The Home Panel removes the friction from conveyancing so you can focus on what matters.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-4 w-4 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Button asChild className="rounded-full px-8 h-11 bg-foreground hover:bg-foreground/90 text-background">
                  <Link href="/start">
                    Get your quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Partners</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Built for property professionals
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We work with estate agents, mortgage brokers, and solicitors to deliver a seamless client experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <Link
                key={partner.title}
                href={partner.href}
                className="group block rounded-2xl overflow-hidden border border-border hover:border-foreground/20 transition-colors"
              >
                <div className="aspect-[3/2] overflow-hidden">
                  <img
                    src={partner.image}
                    alt={partner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{partner.title}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 lg:py-32 bg-card border-y border-border">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">What clients say</p>
          <blockquote className="text-2xl sm:text-3xl font-medium leading-relaxed tracking-tight mb-8">
            "The Home Panel made the whole process so much less stressful. I knew exactly what was happening at every stage and the fees were exactly what they quoted."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80&fit=crop"
                alt="Client"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Emma Richardson</p>
              <p className="text-sm text-muted-foreground">First-time buyer, London</p>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to simplify your move?"
        subtitle="Get an instant fixed-fee quote in under 3 minutes. No obligation."
        ctaText="Start your move"
        ctaHref="/start"
      />
    </>
  )
}
