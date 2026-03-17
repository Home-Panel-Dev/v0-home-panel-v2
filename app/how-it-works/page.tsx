import { Metadata } from "next"
import { Hero } from "@/components/hero"
import { Section, SectionHeader } from "@/components/section"
import { CTASection } from "@/components/cta-section"
import { ProcessStep } from "@/components/process-step"
import { 
  FileText, 
  Search, 
  ClipboardCheck, 
  UserCheck,
  CheckCircle2
} from "lucide-react"

export const metadata: Metadata = {
  title: "How It Works | HomePanel",
  description: "Learn how HomePanel simplifies your home moving process with our guided conveyancing onboarding.",
}

const steps = [
  {
    step: 1,
    title: "Submit your enquiry",
    description: "Start by sharing the basics about your move. Whether you're buying, selling, or both, our simple form captures what we need to get started.",
    details: [
      "Select your transaction type",
      "Provide your contact details",
      "Share property information",
      "Takes less than 5 minutes",
    ],
    icon: FileText,
  },
  {
    step: 2,
    title: "HomePanel reviews your details",
    description: "Our team carefully reviews your submission to ensure we have everything needed for a smooth onboarding process.",
    details: [
      "Information verification",
      "Initial qualification check",
      "Preparation for next steps",
      "Personal attention to your case",
    ],
    icon: Search,
  },
  {
    step: 3,
    title: "Guided onboarding",
    description: "We guide you through a structured onboarding process, collecting the documentation and information your solicitor will need.",
    details: [
      "Step-by-step guidance",
      "Clear documentation requests",
      "Regular progress updates",
      "Support when you need it",
    ],
    icon: ClipboardCheck,
  },
  {
    step: 4,
    title: "Solicitor allocation",
    description: "Once your onboarding is complete, we connect you with the right solicitor for your transaction, fully prepared to begin.",
    details: [
      "Matched to your needs",
      "Pre-prepared documentation",
      "Smooth handover",
      "Ready to progress",
    ],
    icon: UserCheck,
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <Hero
        title="A guided path to your new home"
        subtitle="HomePanel transforms the complexity of conveyancing into a simple, step-by-step journey. Here's how we make moving home feel effortless."
        ctaText="Start your move"
        ctaHref="/start"
      />

      <Section>
        <SectionHeader
          title="Four steps to simplicity"
          subtitle="From your first enquiry to solicitor allocation, we handle the details so you can focus on your move."
        />
        <div className="space-y-8">
          {steps.map((step, index) => (
            <ProcessStep
              key={step.title}
              step={step.step}
              title={step.title}
              description={step.description}
              details={step.details}
              icon={step.icon}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </Section>

      <Section className="bg-card border-y border-border">
        <SectionHeader
          title="Why clients choose HomePanel"
          subtitle="We've designed every part of the process to remove stress and add clarity."
        />
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            "No confusing jargon or complex forms",
            "Personal support throughout your journey",
            "Complete transparency on progress",
            "Documentation prepared upfront",
            "Qualified solicitors ready to help",
            "A calmer path to completion",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </Section>

      <CTASection
        title="Ready to experience the difference?"
        subtitle="Join thousands of home movers who've chosen the simpler path."
        ctaText="Start your move"
        ctaHref="/start"
      />
    </>
  )
}
