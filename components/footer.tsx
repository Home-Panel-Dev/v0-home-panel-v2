import Link from "next/link"

const footerLinks = {
  product: [
    { href: "/how-it-works", label: "How it Works" },
    { href: "/start", label: "Get a Quote" },
  ],
  partners: [
    { href: "/estate-agents", label: "Estate Agents" },
    { href: "/brokers", label: "Mortgage Brokers" },
    { href: "/solicitors", label: "Solicitors" },
  ],
  company: [
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="The Home Panel" className="h-8 w-8" />
              <span className="font-semibold text-base tracking-tight">The Home Panel</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Fixed-fee conveyancing handled by SRA-regulated solicitors. One Canada Square, Canary Wharf, London.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Partners</h3>
            <ul className="space-y-3">
              {footerLinks.partners.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} The Home Panel. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Conveyancing services are provided by SRA-regulated solicitors.
          </p>
        </div>
      </div>
    </footer>
  )
}
