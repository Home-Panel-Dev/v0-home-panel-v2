"use client"

import { Hero } from "@/components/hero"
import { Section, SectionHeader } from "@/components/section"
import { FeatureCard } from "@/components/feature-card"
import { CTASection } from "@/components/cta-section"
import { CheckCircle2 } from "lucide-react"

const benefits = [
  {
    title: "Pre-qualified clients",
    description: "Every client has been reviewed and qualified before allocation, saving you time on initial checks.",
    iconName: "UserCheck" as const,
  },
  {
    title: "Complete documentation",
    description: "Clients arrive with all necessary information gathered, reducing delays and follow-ups.",
    iconName: "FileStack" as const,
  },
  {
    title: "Reduced turnaround",
    description: "Well-prepared files mean faster matter opening and quicker progression.",
    iconName: "Timer" as const,
  },
  {
    title: "Quality referrals",
    description: "Receive a steady stream of qualified instructions from our partner network.",
    iconName: "Briefcase" as const,
  },
]

const features = [
  "Pre-verified client information",
  "Standardised onboarding documentation",
  "Clear client expectations",
  "Integrated communication channels",
  "Performance analytics",
  "Dedicated support team",
]

export default function SolicitorsPage() {
  return (
    <>
      <Hero
        title="Clients ready to progress"
        subtitle="HomePanel delivers pre-qualified, well-prepared clients with complete documentation, allowing you to focus on what you do best."
        ctaText="Become a partner"
        ctaHref="/contact"
        secondaryCtaText="Learn more"
        secondaryCtaHref="#benefits"
      />

      <Section id="benefits" className="bg-card border-y border-border">
        <SectionHeader
          title="Why solicitors choose HomePanel"
          subtitle="We handle the onboarding so you can focus on delivering excellent conveyancing."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <FeatureCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              iconName={benefit.iconName}
              index={index}
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          title="What you receive"
          subtitle="Everything you need to start work on each matter with confidence."
        />
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 p-4 rounded-xl bg-secondary">
                <CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <CTASection
        title="Ready to receive quality instructions?"
        subtitle="Join our network of trusted solicitors and start receiving pre-qualified clients."
        ctaText="Contact us"
        ctaHref="/contact"
      />
    </>
  )
}
