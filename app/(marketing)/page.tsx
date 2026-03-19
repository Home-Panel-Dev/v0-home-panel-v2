"use client"

import { Hero } from "@/components/hero"
import { Section, SectionHeader } from "@/components/section"
import { FeatureCard } from "@/components/feature-card"
import { PartnerCard } from "@/components/partner-card"
import { CTASection } from "@/components/cta-section"

const steps = [
  {
    title: "Submit your enquiry",
    description: "Tell us about your move. It takes less than five minutes to share the essential details.",
    iconName: "FileText" as const,
  },
  {
    title: "HomePanel reviews",
    description: "Our team reviews your information and prepares everything for a smooth onboarding.",
    iconName: "UserCheck" as const,
  },
  {
    title: "Guided onboarding",
    description: "We guide you through each step, collecting what your solicitor needs upfront.",
    iconName: "FileCheck" as const,
  },
  {
    title: "Solicitor allocation",
    description: "Once ready, we connect you with the right solicitor for your transaction.",
    iconName: "Handshake" as const,
  },
]

const benefits = [
  {
    title: "Less stress",
    description: "A calm, guided process that removes the overwhelm from moving home.",
    iconName: "HeartHandshake" as const,
  },
  {
    title: "Faster onboarding",
    description: "Get prepared quickly with our streamlined information gathering.",
    iconName: "Zap" as const,
  },
  {
    title: "Fewer delays",
    description: "Complete documentation upfront means fewer bottlenecks later.",
    iconName: "Clock" as const,
  },
  {
    title: "Better communication",
    description: "Stay informed throughout with clear updates on your progress.",
    iconName: "Users" as const,
  },
]

const partners = [
  {
    title: "Estate Agents",
    description: "Offer your clients a seamless conveyancing experience that reflects your commitment to service.",
    href: "/estate-agents",
    iconName: "Building2" as const,
  },
  {
    title: "Mortgage Brokers",
    description: "Enhance your client journey with integrated conveyancing that complements your mortgage service.",
    href: "/brokers",
    iconName: "Landmark" as const,
  },
  {
    title: "Solicitors",
    description: "Receive pre-qualified, well-prepared clients ready to progress through conveyancing.",
    href: "/solicitors",
    iconName: "Scale" as const,
  },
]

export default function HomePage() {
  return (
    <>
      <Hero
        title="Moving home, made simple"
        subtitle="HomePanel guides you through the conveyancing process with care. Submit your details, and we'll prepare everything for a smooth solicitor allocation."
        ctaText="Start your move"
        ctaHref="/start"
        secondaryCtaText="How it works"
        secondaryCtaHref="/how-it-works"
      />

      <Section className="bg-card border-y border-border">
        <SectionHeader
          title="A better way to start your move"
          subtitle="We believe moving home should feel effortless. HomePanel removes the friction from conveyancing onboarding, so you can focus on what matters."
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
          title="How HomePanel works"
          subtitle="Four simple steps from enquiry to solicitor allocation. We handle the complexity so you don't have to."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <FeatureCard
                title={step.title}
                description={step.description}
                iconName={step.iconName}
                index={index}
                className="pt-10"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-card border-y border-border">
        <SectionHeader
          title="Partner with HomePanel"
          subtitle="We work with professionals across the property industry to deliver a seamless client experience."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {partners.map((partner, index) => (
            <PartnerCard
              key={partner.title}
              title={partner.title}
              description={partner.description}
              href={partner.href}
              iconName={partner.iconName}
              index={index}
            />
          ))}
        </div>
      </Section>

      <CTASection
        title="Ready to simplify your move?"
        subtitle="Start your conveyancing journey today. It only takes a few minutes."
        ctaText="Start your move"
        ctaHref="/start"
      />
    </>
  )
}
