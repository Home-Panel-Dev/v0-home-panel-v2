import { Metadata } from "next"
import { ContactForm } from "@/components/contact-form"
import { Mail, MapPin, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | HomePanel",
  description: "Get in touch with the HomePanel team. We're here to help with any questions about our conveyancing onboarding platform.",
}

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@homepanel.co.uk",
    href: "mailto:hello@homepanel.co.uk",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "0800 123 4567",
    href: "tel:08001234567",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "London, United Kingdom",
    href: null,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">
            Get in touch
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Whether you have a question about our service, want to become a partner, or just want to say hello, we'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
            <div className="bg-card border border-border rounded-3xl p-8">
              <ContactForm />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6">Other ways to reach us</h2>
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="font-medium hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-secondary border border-border">
              <h3 className="font-semibold mb-2">Partnership enquiries</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If you're an estate agent, mortgage broker, or solicitor interested in partnering with HomePanel, please use the contact form and select "Partnership enquiry" as the subject.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
