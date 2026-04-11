import type { EnquiryFormData } from "@/lib/form-schema"

const transactionTypeLabels: Record<string, string> = {
  buying: "purchase",
  selling: "sale",
  "buying-selling": "purchase & sale",
  remortgage: "remortgage",
  "transfer-equity": "transfer of equity",
}

const tenureLabels: Record<string, string> = {
  freehold: "Freehold",
  leasehold: "Leasehold",
  unsure: "Unsure",
}

// Fee calculation — HomePanel Headline Fees
function calcLegalFeeEmail(propertyValue: number, transactionType: string): number {
  const isSale = transactionType === "selling"
  if (isSale) {
    if (propertyValue <= 250000) return 900
    if (propertyValue <= 500000) return 950
    if (propertyValue <= 750000) return 1200
    if (propertyValue <= 1000000) return 1900
    return 0 // TBC
  }
  if (propertyValue <= 250000) return 995
  if (propertyValue <= 500000) return 1200
  if (propertyValue <= 750000) return 1400
  if (propertyValue <= 1000000) return 1700
  return 0 // TBC
}

function calculateFees(data: EnquiryFormData) {
  const propertyValue = parseFloat(data.propertyValue?.replace(/,/g, "") || "0")
  const transactionType = data.transactionType || "buying"
  const isLeasehold = data.tenure === "leasehold"
  const isNewBuild = data.isNewBuild === "yes"
  const isCompanyPurchase = data.isCompanyPurchase === "yes"
  const isPurchase = transactionType === "buying" || transactionType === "buying-selling"
  const isSale = transactionType === "selling"
  const isTBC = propertyValue > 1000000

  const legalFee = calcLegalFeeEmail(propertyValue, transactionType)
  const leaseholdSupplement = isLeasehold && isPurchase ? 450 : isLeasehold && isSale ? 250 : 0
  const newBuildFee = isNewBuild ? 350 : 0
  const companyFee = isCompanyPurchase ? 150 : 0
  const chapsFee = 45
  const searchFees = isPurchase ? 350 : 0

  const subtotal = legalFee + leaseholdSupplement + newBuildFee + companyFee
  const vat = Math.round(subtotal * 0.2)
  const disbursements = searchFees + chapsFee
  const total = subtotal + vat + disbursements

  return {
    legalFee, leaseholdSupplement, newBuildFee, companyFee, chapsFee,
    searchFees, subtotal, vat, disbursements, total, isTBC,
    mortgageFee: 0, giftFundsFee: 0, bankTransferFee: 0,
    sdlt: 0, totalExSDLT: total, isFTB: false, isAdditional: false,
    transactionLabel: transactionTypeLabels[data.transactionType] || data.transactionType
  }
}

// Agent data
const agents = [
  { name: "Sarah Mitchell", role: "Senior Conveyancer", photo: "https://v0-home-panel-v2.vercel.app/images/agents/sarah-mitchell.jpg" },
  { name: "James Thompson", role: "Property Solicitor", photo: "https://v0-home-panel-v2.vercel.app/images/agents/james-thompson.jpg" },
]

export function getCustomerConfirmationEmail(data: EnquiryFormData) {
  const fees = calculateFees(data)
  const fullName = `${data.firstName} ${data.lastName}`
  const fmt = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const feeRows = [
    { label: "Legal fee (ex VAT)", amount: fees.legalFee },
    fees.leaseholdSupplement > 0 ? { label: "Leasehold supplement", amount: fees.leaseholdSupplement } : null,
    fees.newBuildFee > 0 ? { label: "New build supplement", amount: fees.newBuildFee } : null,
    fees.companyFee > 0 ? { label: "Company purchase", amount: fees.companyFee } : null,
    fees.giftFundsFee > 0 ? { label: "Gift funds verification", amount: fees.giftFundsFee } : null,
  ].filter(Boolean) as { label: string; amount: number }[]

  const feeRowsHtml = feeRows.map(row => `
    <tr>
      <td style="padding:8px 0;color:#555;font-size:14px;">${row.label}</td>
      <td style="padding:8px 0;text-align:right;font-size:14px;">${fmt(row.amount)}</td>
    </tr>`).join("")

  const sdltLabel = fees.isFTB
    ? `SDLT <span style="color:#16a34a;font-size:12px;">(First Time Buyer relief applied)</span>`
    : fees.isAdditional
    ? "SDLT (+3% additional property surcharge)"
    : "Stamp Duty Land Tax (SDLT)"

  return {
    subject: `Your HomePanel quote — ${fmt(fees.total)} for your ${fees.transactionLabel}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 16px;background-color:#f5f5f3;">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:24px;">
    <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="40" height="40" style="display:inline-block;" />
    <p style="margin:6px 0 0;font-size:13px;color:#999;letter-spacing:0.04em;text-transform:uppercase;">HomePanel</p>
  </div>

  <!-- Card -->
  <div style="background:#fff;border-radius:20px;padding:40px 36px;box-shadow:0 1px 4px rgba(0,0,0,0.07);">

    <!-- Greeting -->
    <h1 style="font-size:22px;font-weight:700;margin:0 0 6px;color:#1a1a1a;">Hi ${data.firstName},</h1>
    <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.7;">
      Thank you for getting in touch. Here's your personalised conveyancing quote for your <strong>${fees.transactionLabel}</strong>. 
      Someone from our team will be in touch shortly — in the meantime, everything you need is below.
    </p>

    <!-- Quote highlight -->
    <div style="background:#f9f9f7;border:1px solid #e8e4de;border-radius:14px;padding:24px;margin-bottom:28px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:0.06em;">Your estimated total</p>
      <p style="margin:0;font-size:40px;font-weight:800;color:#1a1a1a;letter-spacing:-1px;">${fmt(fees.total)}</p>
      ${fees.sdlt > 0 ? `<p style="margin:8px 0 0;font-size:13px;color:#888;">Excl. SDLT: ${fmt(fees.totalExSDLT)} &nbsp;·&nbsp; SDLT: ${fmt(fees.sdlt)}</p>` : ""}
      ${fees.sdlt === 0 && fees.isFTB ? `<p style="margin:8px 0 0;font-size:13px;color:#16a34a;font-weight:500;">✓ First Time Buyer SDLT relief applied — £0 stamp duty</p>` : ""}
    </div>

    <!-- Fee breakdown -->
    <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#888;margin:0 0 12px;">Fee breakdown</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${feeRowsHtml}
      <tr>
        <td style="padding:10px 0 8px;color:#555;font-size:14px;border-top:1px solid #eee;">Subtotal (ex VAT)</td>
        <td style="padding:10px 0 8px;text-align:right;font-size:14px;border-top:1px solid #eee;">${fmt(fees.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#555;font-size:14px;">VAT (20%)</td>
        <td style="padding:6px 0;text-align:right;font-size:14px;">${fmt(fees.vat)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 6px;color:#555;font-size:14px;border-top:1px solid #eee;">Disbursements</td>
        <td style="padding:10px 0 6px;text-align:right;font-size:14px;border-top:1px solid #eee;">${fmt(fees.disbursements)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 0 8px;color:#aaa;font-size:12px;">
          ${fees.searchFees > 0 ? `Searches (${fmt(fees.searchFees)}) &nbsp;` : ""}Land Registry ${fees.landRegistryFee > 0 ? `(${fmt(fees.landRegistryFee)})` : "(n/a — sale)"} &nbsp;Bank transfer (${fmt(fees.bankTransferFee)})
        </td>
      </tr>
      ${fees.sdlt >= 0 ? `
      <tr>
        <td style="padding:10px 0 6px;color:#555;font-size:14px;border-top:1px solid #eee;">${sdltLabel}</td>
        <td style="padding:10px 0 6px;text-align:right;font-size:14px;border-top:1px solid #eee;${fees.sdlt === 0 ? "color:#16a34a;font-weight:600;" : ""}">${fees.sdlt === 0 ? "£0" : fmt(fees.sdlt)}</td>
      </tr>` : ""}
      <tr>
        <td style="padding:14px 0 0;font-size:16px;font-weight:700;border-top:2px solid #1a1a1a;">Total estimate</td>
        <td style="padding:14px 0 0;text-align:right;font-size:16px;font-weight:700;border-top:2px solid #1a1a1a;">${fmt(fees.total)}</td>
      </tr>
    </table>

    <p style="font-size:12px;color:#aaa;margin:0 0 28px;line-height:1.6;">
      All fees are estimates. Final figures confirmed on instruction. SDLT rates correct as at April 2025. 
      Disbursements are passed through at cost with no markup.
    </p>

    <!-- What happens next -->
    <div style="background:#f2faf6;border-left:4px solid #2d7a4f;border-radius:0 12px 12px 0;padding:18px 20px;margin-bottom:28px;">
      <h3 style="font-size:14px;font-weight:700;color:#2d7a4f;margin:0 0 12px;">What happens next</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:28px;vertical-align:top;padding-bottom:10px;"><span style="background:#2d7a4f;color:white;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;font-size:11px;line-height:20px;font-weight:700;">1</span></td>
          <td style="padding-bottom:10px;font-size:14px;color:#1a1a1a;">A member of our team will review your enquiry and be in touch within <strong>1 business day</strong></td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;padding-bottom:10px;"><span style="background:#2d7a4f;color:white;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;font-size:11px;line-height:20px;font-weight:700;">2</span></td>
          <td style="padding-bottom:10px;font-size:14px;color:#1a1a1a;">We'll send you a secure onboarding link to collect your ID, source of funds, and key documents</td>
        </tr>
        <tr>
          <td style="width:28px;vertical-align:top;padding-bottom:10px;"><span style="background:#2d7a4f;color:white;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;font-size:11px;line-height:20px;font-weight:700;">3</span></td>
          <td style="padding-bottom:10px;font-size:14px;color:#1a1a1a;">Once your file is ready, your dedicated solicitor will be assigned and your case begins</td>
        </tr>
      </table>
    </div>

    <!-- Agents -->
    <div style="text-align:center;margin-bottom:28px;">
      <p style="color:#555;font-size:14px;margin:0 0 14px;">Your case will be handled directly by</p>
      <table style="margin:0 auto;border-collapse:collapse;">
        <tr>
          ${agents.map((agent, i) => `
            ${i > 0 ? '<td style="padding:0 12px;color:#ccc;font-size:14px;">or</td>' : ''}
            <td style="text-align:center;padding:0 8px;">
              <img src="${agent.photo}" alt="${agent.name}" width="56" height="56" style="width:56px;height:56px;border-radius:50%;object-fit:cover;margin:0 auto 8px;display:block;border:2px solid #eee;" />
              <p style="margin:0;font-weight:600;font-size:13px;color:#1a1a1a;">${agent.name}</p>
              <p style="margin:3px 0 0;color:#888;font-size:12px;">${agent.role}</p>
            </td>
          `).join("")}
        </tr>
      </table>
      <p style="color:#aaa;font-size:12px;margin:12px 0 0;">Authorised and regulated by the Solicitors Regulation Authority</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:20px;">
      <a href="https://homepanel.co.uk/start" style="display:inline-block;background:#1a1a1a;color:white;padding:14px 36px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:-0.2px;">Proceed with your move →</a>
    </div>

    <p style="color:#aaa;font-size:13px;text-align:center;margin:0;">
      Questions? Simply reply to this email — we're here to help.
    </p>
  </div>

  <!-- Footer -->
  <p style="color:#bbb;font-size:12px;text-align:center;margin-top:24px;line-height:1.8;">
    HomePanel · <a href="https://homepanel.co.uk" style="color:#bbb;text-decoration:none;">homepanel.co.uk</a><br>
    Simplifying your home move
  </p>

</body>
</html>`,
    text: `
Hi ${data.firstName},

Thank you for getting a quote with HomePanel. Here's your personalised estimate for your ${fees.transactionLabel}.

YOUR QUOTE: ${fmt(fees.total)}

Fee breakdown:
${feeRows.map(r => `  ${r.label}: ${fmt(r.amount)}`).join("\n")}
  Subtotal (ex VAT): ${fmt(fees.subtotal)}
  VAT (20%): ${fmt(fees.vat)}
  Disbursements: ${fmt(fees.disbursements)}
    Searches: ${fees.searchFees > 0 ? fmt(fees.searchFees) : "n/a"}
    Land Registry: ${fees.landRegistryFee > 0 ? fmt(fees.landRegistryFee) : "n/a"}
    Bank transfer: ${fmt(fees.bankTransferFee)}
  SDLT: ${fees.sdlt === 0 && fees.isFTB ? "£0 (First Time Buyer relief)" : fmt(fees.sdlt)}

Total: ${fmt(fees.total)}

WHAT HAPPENS NEXT:
1. A member of our team will review your enquiry and be in touch within 1 business day
2. We'll send you a secure onboarding link to collect your ID, source of funds, and key documents
3. Once your file is ready, your dedicated solicitor will be assigned and your case begins

Your case will be handled by: ${agents.map(a => a.name).join(" or ")}

Questions? Simply reply to this email.

The HomePanel Team
homepanel.co.uk
    `,
  }
}

// Email sent when user declines to proceed with quote
export function getDeclineEmail(data: {
  firstName: string
  lastName: string
  email?: string
  quoteAmount?: number
}) {
  const fmt = (n: number) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return {
    subject: `We're sorry to see you go, ${data.firstName} — a quick note from HomePanel`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 16px;background-color:#f5f5f3;">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:24px;">
    <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="40" height="40" style="display:inline-block;" />
    <p style="margin:6px 0 0;font-size:13px;color:#999;letter-spacing:0.04em;text-transform:uppercase;">HomePanel</p>
  </div>

  <!-- Card -->
  <div style="background:#fff;border-radius:20px;padding:40px 36px;box-shadow:0 1px 4px rgba(0,0,0,0.07);">

    <h1 style="font-size:22px;font-weight:700;margin:0 0 6px;color:#1a1a1a;">Hi ${data.firstName},</h1>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
      Thank you for taking the time to get a quote with us. We completely understand that choosing the right conveyancer is a big decision — and it's not always straightforward.
    </p>

    ${data.quoteAmount ? `
    <div style="background:#f9f9f7;border:1px solid #e8e4de;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#aaa;text-transform:uppercase;letter-spacing:0.05em;">Your quote remains valid for 30 days</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;">${fmt(data.quoteAmount)}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#888;">Simply reply to this email and we'll pick up right where you left off.</p>
    </div>` : ""}

    <!-- Feedback section -->
    <div style="background:#f9f9f7;border-radius:14px;padding:24px;margin-bottom:28px;">
      <h3 style="font-size:15px;font-weight:700;margin:0 0 6px;color:#1a1a1a;">Could you tell us why?</h3>
      <p style="font-size:14px;color:#666;margin:0 0 16px;">Your feedback genuinely shapes how we improve. It takes 30 seconds.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:7px 0;border-bottom:1px solid #eee;">
            <a href="https://homepanel.co.uk/feedback?reason=price" style="text-decoration:none;color:#1a1a1a;font-size:14px;">💰 &nbsp;The price was too high</a>
          </td>
        </tr>
        <tr>
          <td style="padding:7px 0;border-bottom:1px solid #eee;">
            <a href="https://homepanel.co.uk/feedback?reason=timing" style="text-decoration:none;color:#1a1a1a;font-size:14px;">⏳ &nbsp;I'm not ready to proceed yet</a>
          </td>
        </tr>
        <tr>
          <td style="padding:7px 0;border-bottom:1px solid #eee;">
            <a href="https://homepanel.co.uk/feedback?reason=comparison" style="text-decoration:none;color:#1a1a1a;font-size:14px;">🔍 &nbsp;I'm comparing other firms</a>
          </td>
        </tr>
        <tr>
          <td style="padding:7px 0;border-bottom:1px solid #eee;">
            <a href="https://homepanel.co.uk/feedback?reason=local" style="text-decoration:none;color:#1a1a1a;font-size:14px;">📍 &nbsp;I'd prefer a local solicitor</a>
          </td>
        </tr>
        <tr>
          <td style="padding:7px 0;border-bottom:1px solid #eee;">
            <a href="https://homepanel.co.uk/feedback?reason=recommendation" style="text-decoration:none;color:#1a1a1a;font-size:14px;">👥 &nbsp;I'm going with a personal recommendation</a>
          </td>
        </tr>
        <tr>
          <td style="padding:7px 0;">
            <a href="https://homepanel.co.uk/feedback?reason=other" style="text-decoration:none;color:#1a1a1a;font-size:14px;">✏️ &nbsp;Something else</a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Why HomePanel -->
    <div style="margin-bottom:28px;">
      <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#888;margin:0 0 14px;">Before you go — why clients choose us</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#555;border-bottom:1px solid #f0f0f0;">✓ &nbsp;Transparent, fixed fees — no hidden costs</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#555;border-bottom:1px solid #f0f0f0;">✓ &nbsp;Named solicitor handling your case from day one</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#555;border-bottom:1px solid #f0f0f0;">✓ &nbsp;SRA authorised and regulated firm</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#555;border-bottom:1px solid #f0f0f0;">✓ &nbsp;Streamlined onboarding — less paperwork, faster start</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#555;">✓ &nbsp;Based in Canary Wharf, London — accessible by appointment</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://homepanel.co.uk/start" style="display:inline-block;background:#1a1a1a;color:white;padding:13px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">Reconsider and get started →</a>
    </div>

    <p style="color:#aaa;font-size:13px;text-align:center;margin:0;">
      Changed your mind? Just reply to this email — no forms needed.
    </p>
  </div>

  <!-- Footer -->
  <p style="color:#bbb;font-size:12px;text-align:center;margin-top:24px;line-height:1.8;">
    HomePanel · <a href="https://homepanel.co.uk" style="color:#bbb;text-decoration:none;">homepanel.co.uk</a><br>
    Simplifying your home move
  </p>

</body>
</html>`,
    text: `
Hi ${data.firstName},

Thank you for taking the time to get a quote with HomePanel. We completely understand that choosing the right conveyancer takes thought.

${data.quoteAmount ? `Your quote of ${fmt(data.quoteAmount)} remains valid for 30 days. Simply reply to this email and we'll pick up where you left off.` : ""}

Could you tell us why you didn't proceed? Your feedback helps us improve:

→ The price was too high: https://homepanel.co.uk/feedback?reason=price
→ I'm not ready yet: https://homepanel.co.uk/feedback?reason=timing
→ Comparing other firms: https://homepanel.co.uk/feedback?reason=comparison
→ Want a local solicitor: https://homepanel.co.uk/feedback?reason=local
→ Going with a recommendation: https://homepanel.co.uk/feedback?reason=recommendation
→ Something else: https://homepanel.co.uk/feedback?reason=other

Why clients choose HomePanel:
✓ Transparent, fixed fees — no hidden costs
✓ Named solicitor handling your case from day one
✓ SRA authorised and regulated
✓ Streamlined onboarding — less paperwork, faster start
✓ Based in Canary Wharf, London

Changed your mind? Just reply to this email — no forms needed.

The HomePanel Team
homepanel.co.uk
    `,
  }
}

// Client onboarding invite email with magic link
export function getOnboardingInviteEmail(data: {
  firstName: string
  lastName: string
  email: string
  caseReference: string
  magicLink: string
}) {
  const fullName = `${data.firstName} ${data.lastName}`
  
  return {
    subject: `Welcome to HomePanel - Complete Your Onboarding`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf8;">
  <div style="background-color: white; border-radius: 24px; padding: 40px;">
    
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="48" height="48" style="display: inline-block;" />
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px;">Welcome to HomePanel</h1>
      <p style="color: #666; margin: 0;">Your conveyancing journey starts here</p>
    </div>

    <p style="margin-bottom: 24px;">Hi ${data.firstName},</p>
    
    <p style="margin-bottom: 24px;">Great news! Your quote has been accepted and we're ready to start working on your case. Your reference number is <strong>${data.caseReference}</strong>.</p>

    <p style="margin-bottom: 24px;">To get started, please complete our secure onboarding process. This will take approximately 10-15 minutes and includes:</p>

    <ul style="margin-bottom: 24px; padding-left: 20px; color: #666;">
      <li style="margin-bottom: 8px;">Identity verification</li>
      <li style="margin-bottom: 8px;">Source of funds declaration</li>
      <li style="margin-bottom: 8px;">Document upload</li>
      <li style="margin-bottom: 8px;">Terms and conditions</li>
    </ul>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${data.magicLink}" style="display: inline-block; background-color: #059669; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">Start Your Onboarding Journey</a>
    </div>

    <p style="color: #666; font-size: 14px; margin-bottom: 24px;">This link will expire in 7 days. If you need a new link, please contact us.</p>
    
    <p style="color: #999; font-size: 12px; margin-bottom: 24px;">If the button above doesn&apos;t work, copy and paste this link into your browser:<br><a href="${data.magicLink}" style="color: #059669; word-break: break-all;">${data.magicLink}</a></p>

    <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px;">Need help?</h3>
      <p style="color: #666; margin: 0; font-size: 14px;">Our team is here to assist you every step of the way. Simply reply to this email or call us on <a href="tel:+441onal234567890" style="color: #1a1a1a;">01onal 234 567 890</a>.</p>
    </div>

    <p style="color: #1a1a1a; font-weight: 500; margin: 0; font-size: 14px;">
      The HomePanel Team
    </p>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
    HomePanel | Simplifying your home move<br>
    <a href="https://homepanel.co.uk" style="color: #999;">homepanel.co.uk</a>
  </p>
</body>
</html>
    `,
    text: `
Welcome to HomePanel

Hi ${data.firstName},

Great news! Your quote has been accepted and we're ready to start working on your case. Your reference number is ${data.caseReference}.

To get started, please complete our secure onboarding process by clicking the link below:

${data.magicLink}

This will take approximately 10-15 minutes and includes:
- Identity verification
- Source of funds declaration
- Document upload
- Terms and conditions

This link will expire in 24 hours. If you need a new link, please contact us.

Need help? Our team is here to assist you every step of the way. Simply reply to this email.

Best regards,
The HomePanel Team
    `
  }
}

// Status update email
export function getStatusUpdateEmail(data: {
  firstName: string
  caseReference: string
  previousStatus: string
  newStatus: string
  message?: string
}) {
  const statusLabels: Record<string, string> = {
    onboarding: "Onboarding",
    active: "Active",
    exchanged: "Contracts Exchanged",
    completed: "Completed",
    aborted: "Aborted"
  }

  const newStatusLabel = statusLabels[data.newStatus] || data.newStatus

  return {
    subject: `Case Update: ${data.caseReference} - ${newStatusLabel}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf8;">
  <div style="background-color: white; border-radius: 24px; padding: 40px;">
    
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="48" height="48" style="display: inline-block;" />
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px;">Case Update</h1>
      <p style="color: #666; margin: 0;">Reference: ${data.caseReference}</p>
    </div>

    <p style="margin-bottom: 24px;">Hi ${data.firstName},</p>
    
    <p style="margin-bottom: 24px;">Your case status has been updated to:</p>

    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <p style="font-size: 18px; font-weight: 600; color: #059669; margin: 0;">${newStatusLabel}</p>
    </div>

    ${data.message ? `<p style="margin-bottom: 24px;">${data.message}</p>` : ""}

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://homepanel.co.uk/dashboard" style="display: inline-block; background-color: #059669; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">View Your Dashboard</a>
    </div>

    <p style="color: #1a1a1a; font-weight: 500; margin: 0; font-size: 14px;">
      The HomePanel Team
    </p>
  </div>
</body>
</html>
    `,
    text: `
Case Update - ${data.caseReference}

Hi ${data.firstName},

Your case status has been updated to: ${newStatusLabel}

${data.message || ""}

View your dashboard: https://homepanel.co.uk/dashboard

Best regards,
The HomePanel Team
    `
  }
}

// Document request email
export function getDocumentRequestEmail(data: {
  firstName: string
  caseReference: string
  documents: string[]
  message?: string
}) {
  const documentList = data.documents.map(doc => `<li style="margin-bottom: 8px;">${doc}</li>`).join("")
  
  return {
    subject: `Document Request: ${data.caseReference}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf8;">
  <div style="background-color: white; border-radius: 24px; padding: 40px;">
    
    <div style="text-align: center; margin-bottom: 32px;">
      <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="48" height="48" style="display: inline-block;" />
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px;">Documents Needed</h1>
      <p style="color: #666; margin: 0;">Reference: ${data.caseReference}</p>
    </div>

    <p style="margin-bottom: 24px;">Hi ${data.firstName},</p>
    
    <p style="margin-bottom: 24px;">To progress your case, we need the following documents:</p>

    <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <ul style="margin: 0; padding-left: 20px; color: #92400e;">
        ${documentList}
      </ul>
    </div>

    ${data.message ? `<p style="margin-bottom: 24px;">${data.message}</p>` : ""}

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://homepanel.co.uk/dashboard/documents" style="display: inline-block; background-color: #059669; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">Upload Documents</a>
    </div>

    <p style="color: #666; font-size: 14px;">Please upload these documents as soon as possible to avoid delays.</p>

    <p style="color: #1a1a1a; font-weight: 500; margin: 24px 0 0; font-size: 14px;">
      The HomePanel Team
    </p>
  </div>
</body>
</html>
    `,
    text: `
Documents Needed - ${data.caseReference}

Hi ${data.firstName},

To progress your case, we need the following documents:

${data.documents.map(doc => `- ${doc}`).join("\n")}

${data.message || ""}

Please upload these documents: https://homepanel.co.uk/dashboard/documents

Best regards,
The HomePanel Team
    `
  }
}

export function getInternalAlertEmail(data: EnquiryFormData) {
  const fees = calculateFees(data)
  const tenure = tenureLabels[data.tenure || ""] || data.tenure || "Not specified"
  const fullName = `${data.firstName} ${data.lastName}`
  const timestamp = new Date().toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
  })

  const formatYesNo = (value: string | undefined) => {
    if (!value) return "Not specified"
    return value === "yes" ? "Yes" : "No"
  }

  return {
    subject: `New Enquiry: ${fullName} - £${fees.total.toLocaleString("en-GB")} ${fees.transactionLabel}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="48" height="48" style="display: inline-block;" />
    <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 600;">New Enquiry</h1>
    <p style="margin: 8px 0 0; font-size: 32px; font-weight: 700; color: #059669;">£${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
  </div>

  <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 16px; color: #666;">Contact Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 40%;">Client Name</td>
        <td style="padding: 8px 0; font-weight: 500;">${fullName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Email</td>
        <td style="padding: 8px 0; font-weight: 500;"><a href="mailto:${data.email}" style="color: #1a1a1a;">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Phone</td>
        <td style="padding: 8px 0; font-weight: 500;"><a href="tel:${data.phone}" style="color: #1a1a1a;">${data.phone}</a></td>
      </tr>
    </table>
  </div>

  <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 16px; color: #666;">Transaction Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; width: 40%;">Transaction Type</td>
        <td style="padding: 8px 0; font-weight: 500;">${fees.transactionLabel}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Property Postcode</td>
        <td style="padding: 8px 0; font-weight: 500;">${data.propertyPostcode || (data.propertyAddressUnknown ? "Unknown" : "Not provided")}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Tenure</td>
        <td style="padding: 8px 0; font-weight: 500;">${tenure}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Property Value</td>
        <td style="padding: 8px 0; font-weight: 500;">${data.propertyValue ? `£${data.propertyValue}` : "Not specified"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Number of Owners</td>
        <td style="padding: 8px 0; font-weight: 500;">${data.ownerCount || "Not specified"}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">First-Time Buyer</td>
        <td style="padding: 8px 0; font-weight: 500;">${formatYesNo(data.firstTimeBuyer)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">New Build</td>
        <td style="padding: 8px 0; font-weight: 500;">${formatYesNo(data.isNewBuild)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Mortgage Required</td>
        <td style="padding: 8px 0; font-weight: 500;">${formatYesNo(data.hasMortgage)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Company Purchase</td>
        <td style="padding: 8px 0; font-weight: 500;">${formatYesNo(data.isCompanyPurchase)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Gift Funds</td>
        <td style="padding: 8px 0; font-weight: 500;">${formatYesNo(data.hasGiftFunds)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Bank Funds Only</td>
        <td style="padding: 8px 0; font-weight: 500;">${formatYesNo(data.bankFundsOnly)}</td>
      </tr>
    </table>
  </div>

  <div style="background-color: #ecfdf5; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 16px; color: #059669;">Quote Breakdown</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666;">Legal Fee</td>
        <td style="padding: 8px 0; text-align: right;">£${fees.legalFee}</td>
      </tr>
      ${fees.leaseholdSupplement > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Leasehold Supplement</td><td style="padding: 8px 0; text-align: right;">£${fees.leaseholdSupplement}</td></tr>` : ""}
      ${fees.mortgageFee > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Mortgage Work</td><td style="padding: 8px 0; text-align: right;">£${fees.mortgageFee}</td></tr>` : ""}
      ${fees.newBuildFee > 0 ? `<tr><td style="padding: 8px 0; color: #666;">New Build Supplement</td><td style="padding: 8px 0; text-align: right;">£${fees.newBuildFee}</td></tr>` : ""}
      ${fees.companyFee > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Company Purchase</td><td style="padding: 8px 0; text-align: right;">£${fees.companyFee}</td></tr>` : ""}
      ${fees.giftFundsFee > 0 ? `<tr><td style="padding: 8px 0; color: #666;">Gift Funds</td><td style="padding: 8px 0; text-align: right;">£${fees.giftFundsFee}</td></tr>` : ""}
      <tr>
        <td style="padding: 8px 0; color: #666; border-top: 1px solid #d1fae5;">Subtotal</td>
        <td style="padding: 8px 0; text-align: right; border-top: 1px solid #d1fae5;">£${fees.subtotal}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">VAT (20%)</td>
        <td style="padding: 8px 0; text-align: right;">£${fees.vat}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Disbursements</td>
        <td style="padding: 8px 0; text-align: right;">£${fees.disbursements}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-weight: 600; border-top: 1px solid #d1fae5;">Total</td>
        <td style="padding: 12px 0; text-align: right; font-weight: 600; font-size: 18px; border-top: 1px solid #d1fae5;">£${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  <p style="color: #666; font-size: 14px; margin-bottom: 8px;">
    Submitted: ${timestamp}
  </p>
  <p style="color: #666; font-size: 14px;">
    Please follow up with this client within 24 hours.
  </p>
</body>
</html>
    `,
    text: `
New HomePanel Enquiry - £${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}

Contact Details:
- Name: ${fullName}
- Email: ${data.email}
- Phone: ${data.phone}

Transaction Details:
- Transaction Type: ${fees.transactionLabel}
- Property Postcode: ${data.propertyPostcode || (data.propertyAddressUnknown ? "Unknown" : "Not provided")}
- Tenure: ${tenure}
- Property Value: ${data.propertyValue ? `£${data.propertyValue}` : "Not specified"}
- Number of Owners: ${data.ownerCount || "Not specified"}
- First-Time Buyer: ${formatYesNo(data.firstTimeBuyer)}
- New Build: ${formatYesNo(data.isNewBuild)}
- Mortgage Required: ${formatYesNo(data.hasMortgage)}
- Company Purchase: ${formatYesNo(data.isCompanyPurchase)}
- Gift Funds: ${formatYesNo(data.hasGiftFunds)}
- Bank Funds Only: ${formatYesNo(data.bankFundsOnly)}

Quote Breakdown:
- Legal Fee: £${fees.legalFee}
${fees.leaseholdSupplement > 0 ? `- Leasehold Supplement: £${fees.leaseholdSupplement}\n` : ""}${fees.mortgageFee > 0 ? `- Mortgage Work: £${fees.mortgageFee}\n` : ""}${fees.newBuildFee > 0 ? `- New Build Supplement: £${fees.newBuildFee}\n` : ""}${fees.companyFee > 0 ? `- Company Purchase: £${fees.companyFee}\n` : ""}${fees.giftFundsFee > 0 ? `- Gift Funds: £${fees.giftFundsFee}\n` : ""}- Subtotal: £${fees.subtotal}
- VAT (20%): £${fees.vat}
- Disbursements: £${fees.disbursements}
- Total: £${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}

Submitted: ${timestamp}

Please follow up with this client within 24 hours.
    `,
  }
}

// Compliance completion notification to admin
export function getComplianceCompletionEmail(data: {
  clientName: string
  caseReference: string
  enquiryId: string
  checkType: "identity_verification" | "source_of_funds"
  provider: string
  result: "passed" | "failed" | "review_required"
}) {
  const checkLabels: Record<string, string> = {
    identity_verification: "Identity Verification",
    source_of_funds: "Source of Funds Check"
  }
  
  const resultLabels: Record<string, { label: string; color: string; bgColor: string }> = {
    passed: { label: "Passed", color: "#059669", bgColor: "#ecfdf5" },
    failed: { label: "Failed", color: "#dc2626", bgColor: "#fef2f2" },
    review_required: { label: "Manual Review Required", color: "#d97706", bgColor: "#fef3c7" }
  }

  const checkLabel = checkLabels[data.checkType] || data.checkType
  const resultInfo = resultLabels[data.result] || resultLabels.review_required

  return {
    subject: `[Action Required] ${checkLabel} ${resultInfo.label} - ${data.caseReference}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf8;">
  <div style="background-color: white; border-radius: 24px; padding: 40px;">
    
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="48" height="48" style="display: inline-block;" />
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Compliance Check Complete</h1>
      <p style="color: #666; margin: 0;">${data.caseReference}</p>
    </div>

    <div style="background-color: ${resultInfo.bgColor}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0 0 8px; font-weight: 600;">${checkLabel}</p>
      <p style="margin: 0; color: ${resultInfo.color}; font-weight: 600; font-size: 18px;">${resultInfo.label}</p>
    </div>

    <table style="width: 100%; margin-bottom: 24px; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; color: #666;">Client</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 500;">${data.clientName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Provider</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 500;">${data.provider}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Time</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 500;">${new Date().toLocaleString("en-GB")}</td>
      </tr>
    </table>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://v0-home-panel-v2.vercel.app/admin/enquiries/${data.enquiryId}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">Review in Dashboard</a>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Compliance Check Complete - ${data.caseReference}

${checkLabel}: ${resultInfo.label}

Client: ${data.clientName}
Provider: ${data.provider}
Time: ${new Date().toLocaleString("en-GB")}

Review in dashboard: https://v0-home-panel-v2.vercel.app/admin/enquiries/${data.enquiryId}
    `
  }
}

// Onboarding complete notification to admin
export function getOnboardingCompleteEmail(data: {
  clientName: string
  caseReference: string
  enquiryId: string
  completedSteps: string[]
}) {
  const stepsHtml = data.completedSteps.map(step => 
    `<li style="margin-bottom: 8px; color: #059669;">&#10003; ${step}</li>`
  ).join("")

  return {
    subject: `[Ready for Review] Onboarding Complete - ${data.caseReference}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf8;">
  <div style="background-color: white; border-radius: 24px; padding: 40px;">
    
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://v0-home-panel-v2.vercel.app/logo.svg" alt="HomePanel" width="48" height="48" style="display: inline-block;" />
    </div>

    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background-color: #ecfdf5; border-radius: 50%; width: 64px; height: 64px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">&#10003;</span>
      </div>
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Client Onboarding Complete</h1>
      <p style="color: #666; margin: 0;">${data.caseReference}</p>
    </div>

    <p style="margin-bottom: 16px;"><strong>${data.clientName}</strong> has completed all onboarding steps:</p>

    <ul style="background-color: #f8f8f6; border-radius: 12px; padding: 16px 16px 16px 36px; margin-bottom: 24px; list-style: none;">
      ${stepsHtml}
    </ul>

    <p style="color: #666; font-size: 14px; margin-bottom: 24px;">This case is now ready for internal compliance review before being assigned to a conveyancing firm.</p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="https://v0-home-panel-v2.vercel.app/admin/enquiries/${data.enquiryId}" style="display: inline-block; background-color: #059669; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">Review &amp; Approve</a>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Client Onboarding Complete - ${data.caseReference}

${data.clientName} has completed all onboarding steps:
${data.completedSteps.map(step => `- ${step}`).join("\n")}

This case is now ready for internal compliance review before being assigned to a conveyancing firm.

Review in dashboard: https://v0-home-panel-v2.vercel.app/admin/enquiries/${data.enquiryId}
    `
  }
}
