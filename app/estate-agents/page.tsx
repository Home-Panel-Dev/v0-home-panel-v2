"use client"

import { Hero } from "@/components/hero"
import { Section, SectionHeader } from "@/components/section"
import { FeatureCard } from "@/components/feature-card"
import { CTASection } from "@/components/cta-section"
import { CheckCircle2 } from "lucide-react"

const benefits = [
  {
    title: "Enhanced client experience",
    description: "Offer your clients a premium, guided conveyancing journey that sets you apart from competitors.",
    iconName: "Users" as const,
  },
  {
    title: "Faster completions",
    description: "Pre-qualified, well-prepared clients mean fewer delays and smoother transactions.",
    iconName: "Clock" as const,
  },
  {
    title: "Increased referrals",
    description: "Exceptional service leads to more recommendations and repeat business.",
    iconName: "TrendingUp" as const,
  },
  {
    title: "Trusted partnership",
    description: "We work alongside you to ensure every client receives consistent, quality care.",
    iconName: "Shield" as const,
  },
]

const features = [
  "Seamless integration with your existing processes",
  "Regular updates on client progress",
  "Dedicated partnership support team",
  "Co-branded client communications",
  "Performance reporting and insights",
  "No setup fees or hidden costs",
]

export default function EstateAgentsPage() {
  return (
    <>
      <Hero
        title="Elevate your client service"
        subtitle="Partner with HomePanel to offer a seamless conveyancing experience that reflects your commitment to exceptional service and client care."
        ctaText="Become a partner"
        ctaHref="/contact"
        secondaryCtaText="Learn more"
        secondaryCtaHref="#benefits"
      />

      <Section id="benefits" className="bg-card border-y border-border">
        <SectionHeader
          title="Why estate agents choose HomePanel"
          subtitle="We help you deliver a premium moving experience that keeps clients coming back."
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
          title="What you get as a partner"
          subtitle="Everything you need to offer your clients the best conveyancing experience."
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
        title="Ready to partner with HomePanel?"
        subtitle="Get in touch to learn how we can work together to serve your clients better."
        ctaText="Contact us"
        ctaHref="/contact"
      />
    </>
  )
}
