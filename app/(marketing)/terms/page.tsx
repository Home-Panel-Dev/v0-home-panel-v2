import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions | The Home Panel",
  description: "Terms and Conditions for The Home Panel conveyancing services.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 lg:py-24">

        <div className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: April 2026</p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. About Us</h2>
            <p>
              The Home Panel is a conveyancing services platform operated from One Canada Square, Canary Wharf, London. We connect clients with SRA-regulated solicitors to facilitate residential property transactions including purchases, sales, remortgages, and transfers of equity.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Acceptance of Terms</h2>
            <p>
              By using our website or submitting an enquiry through our platform, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Our Services</h2>
            <p>
              The Home Panel provides an online platform for obtaining conveyancing quotes and managing the onboarding process for residential property transactions. We work with authorised and regulated solicitors to deliver conveyancing services on your behalf.
            </p>
            <p className="mt-3">
              All quotes provided through our platform are estimates based on the information you provide. Final fees will be confirmed in your client care letter issued by your appointed solicitor.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Quotes and Fees</h2>
            <p>
              Quotes generated through our platform are based on the information you supply at the time of enquiry. They are estimates only and subject to change if your circumstances differ from those stated. We operate on a fixed-fee basis for standard transactions; any additional services required will be communicated to you before being instructed.
            </p>
            <p className="mt-3">
              Disbursements such as search fees, Land Registry fees, and CHAPS fees are passed through at cost with no markup. Stamp Duty Land Tax (SDLT) is a government tax and is not included in our quotes — your solicitor will advise you on the exact amount payable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Your Obligations</h2>
            <p>You agree to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide accurate and complete information when submitting your enquiry</li>
              <li>Complete identity verification and source of funds checks as required by law</li>
              <li>Respond promptly to requests from your solicitor to avoid delays</li>
              <li>Notify us immediately of any changes to your circumstances that may affect your transaction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Anti-Money Laundering</h2>
            <p>
              As part of our legal obligations, we are required to carry out anti-money laundering (AML) checks on all clients. This includes identity verification and source of funds checks. We use Credas, a regulated third-party provider, to carry out these checks securely. Failure to complete these checks will prevent us from proceeding with your transaction.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Intellectual Property</h2>
            <p>
              All content on this website including text, graphics, logos, and software is the property of The Home Panel and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, The Home Panel shall not be liable for any indirect, incidental, or consequential loss arising from your use of our platform or services. Our total liability in any matter shall not exceed the fees paid to us in connection with your transaction.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">9. Governing Law</h2>
            <p>
              These Terms & Conditions are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">10. Changes to These Terms</h2>
            <p>
              We may update these Terms & Conditions from time to time. The latest version will always be available on this page. Continued use of our services after any changes constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">11. Contact</h2>
            <p>
              For any questions about these Terms & Conditions, please contact us at:<br />
              <strong className="text-foreground">The Home Panel</strong><br />
              One Canada Square, Canary Wharf, London
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
