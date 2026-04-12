import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | The Home Panel",
  description: "Privacy Policy for The Home Panel conveyancing services.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 lg:py-24">

        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Who We Are</h2>
            <p>
              The Home Panel is a conveyancing services platform based at One Canada Square, Canary Wharf, London. We are committed to protecting your personal data and handling it responsibly in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. What Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Identity data — name, date of birth, passport or driving licence details</li>
              <li>Contact data — email address, phone number</li>
              <li>Transaction data — property address, property value, transaction type, tenure</li>
              <li>Financial data — source of funds information collected as part of AML checks</li>
              <li>Technical data — IP address, browser type, pages visited on our website</li>
              <li>Communications — any correspondence you send to us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. How We Use Your Data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Generate and deliver your conveyancing quote</li>
              <li>Carry out identity verification and anti-money laundering checks as required by law</li>
              <li>Facilitate your property transaction and communicate progress updates</li>
              <li>Comply with our legal and regulatory obligations</li>
              <li>Improve our platform and services</li>
              <li>Send marketing communications where you have given consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Legal Basis for Processing</h2>
            <p>We process your personal data on the following legal bases:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-foreground">Contract</strong> — to deliver the conveyancing services you have requested</li>
              <li><strong className="text-foreground">Legal obligation</strong> — to comply with AML regulations and other legal requirements</li>
              <li><strong className="text-foreground">Legitimate interests</strong> — to improve our services and prevent fraud</li>
              <li><strong className="text-foreground">Consent</strong> — for marketing communications where you have opted in</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Third Parties We Share Data With</h2>
            <p>We may share your data with the following categories of third parties:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-foreground">Credas</strong> — our identity verification and AML provider</li>
              <li><strong className="text-foreground">Solicitors</strong> — the SRA-regulated firm appointed to handle your transaction</li>
              <li><strong className="text-foreground">Supabase</strong> — our secure database provider</li>
              <li><strong className="text-foreground">Resend</strong> — our email delivery provider</li>
              <li><strong className="text-foreground">HMRC</strong> — for SDLT submissions as required by law</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal data to third parties. We do not share your data with advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to provide our services and comply with our legal obligations. For conveyancing transactions, we are typically required to retain records for a minimum of 6 years after completion. Identity verification records may be retained for up to 5 years as required by AML regulations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>Under UK GDPR, you have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data where there is no legal obligation to retain it</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent for marketing at any time</li>
              <li>Lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Cookies</h2>
            <p>
              Our website uses essential cookies to ensure it functions correctly. We do not use advertising or tracking cookies. You can manage cookie settings through your browser at any time.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Security</h2>
            <p>
              We take data security seriously. Your data is stored securely using industry-standard encryption. All data transmissions are protected by SSL/TLS. Access to personal data is restricted to authorised personnel only.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The latest version will always be available on this page. We will notify you of any significant changes by email where we hold your contact details.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Contact Us</h2>
            <p>
              To exercise any of your rights or raise a privacy concern, please contact us at:<br />
              <strong className="text-foreground">The Home Panel</strong><br />
              One Canada Square, Canary Wharf, London
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
