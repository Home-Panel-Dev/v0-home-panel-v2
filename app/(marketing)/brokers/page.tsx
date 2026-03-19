"use client"

import { Hero } from "@/components/hero"
import { Section, SectionHeader } from "@/components/section"
import { FeatureCard } from "@/components/feature-card"
import { CTASection } from "@/components/cta-section"
import { CheckCircle2 } from "lucide-react"

const benefits = [
  {
    title: "Streamlined client journey",
    description: "Integrate conveyancing seamlessly into your mortgage process for a unified client experience.",
    iconName: "Handshake" as const,
  },
  {
    title: "Pre-prepared documentation",
    description: "Clients arrive at conveyancing with everything in order, reducing back-and-forth.",
    iconName: "FileCheck" as const,
  },
  {
    title: "Faster completions",
    description: "Well-prepared clients mean smoother transactions and quicker completions.",
    iconName: "Zap" as const,
  },
  {
    title: "Valuable insights",
    description: "Track client progress and completion rates with detailed reporting.",
    iconName: "BarChart3" as const,
  },
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
      <Hero
        title="Complement your mortgage service"
        subtitle="Enhance your client journey with integrated conveyancing that delivers a seamless experience from mortgage to completion."
        ctaText="Become a partner"
        ctaHref="/contact"
        secondaryCtaText="Learn more"
        secondaryCtaHref="#benefits"
      />

      <Section id="benefits" className="bg-card border-y border-border">
        <SectionHeader
          title="Why mortgage brokers choose HomePanel"
          subtitle="We help you deliver a complete home buying experience that clients will remember."
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
          title="Partner benefits"
          subtitle="Everything you need to offer your clients the complete home buying experience."
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
        title="Ready to enhance your service?"
        subtitle="Get in touch to discover how HomePanel can complement your mortgage offering."
        ctaText="Contact us"
        ctaHref="/contact"
      />
    </>
  )
}
