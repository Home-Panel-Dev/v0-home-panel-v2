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

// Fee calculation - mirrors the logic in multi-step-form.tsx
function calculateFees(data: EnquiryFormData) {
  const propertyValue = parseFloat(data.propertyValue?.replace(/,/g, "") || "0")
  
  // Base legal fee
  let legalFee = 595
  if (propertyValue > 250000) legalFee = 695
  if (propertyValue > 500000) legalFee = 895
  if (propertyValue > 1000000) legalFee = 1295
  
  // Additional fees based on options
  const isLeasehold = data.tenure === "leasehold"
  const hasMortgage = data.hasMortgage === "yes"
  const isNewBuild = data.isNewBuild === "yes"
  const isCompanyPurchase = data.isCompanyPurchase === "yes"
  const hasGiftFunds = data.hasGiftFunds === "yes"
  
  const fees = {
    legalFee,
    leaseholdSupplement: isLeasehold ? 195 : 0,
    mortgageFee: hasMortgage ? 95 : 0,
    newBuildFee: isNewBuild ? 195 : 0,
    companyFee: isCompanyPurchase ? 295 : 0,
    giftFundsFee: hasGiftFunds ? 50 : 0,
    searchFees: 300,
    landRegistryFee: propertyValue > 500000 ? 295 : propertyValue > 250000 ? 150 : 100,
    bankTransferFee: 35,
  }
  
  const subtotal = fees.legalFee + fees.leaseholdSupplement + fees.mortgageFee + 
    fees.newBuildFee + fees.companyFee + fees.giftFundsFee
  const vat = Math.round(subtotal * 0.2)
  const disbursements = fees.searchFees + fees.landRegistryFee + fees.bankTransferFee
  const total = subtotal + vat + disbursements
  
  return {
    ...fees,
    subtotal,
    vat,
    disbursements,
    total,
    transactionLabel: transactionTypeLabels[data.transactionType] || data.transactionType
  }
}

// Agent data
const agents = [
  { name: "Sarah Mitchell", role: "Senior Conveyancer" },
  { name: "James Thompson", role: "Property Solicitor" },
]

export function getCustomerConfirmationEmail(data: EnquiryFormData) {
  const fees = calculateFees(data)
  const fullName = `${data.firstName} ${data.lastName}`

  // Build fee breakdown rows
  const feeRows = [
    { label: "Legal fee", amount: fees.legalFee },
    fees.leaseholdSupplement > 0 ? { label: "Leasehold supplement", amount: fees.leaseholdSupplement } : null,
    fees.mortgageFee > 0 ? { label: "Mortgage work", amount: fees.mortgageFee } : null,
    fees.newBuildFee > 0 ? { label: "New build supplement", amount: fees.newBuildFee } : null,
    fees.companyFee > 0 ? { label: "Company purchase", amount: fees.companyFee } : null,
    fees.giftFundsFee > 0 ? { label: "Gift funds verification", amount: fees.giftFundsFee } : null,
  ].filter(Boolean) as { label: string; amount: number }[]

  const feeRowsHtml = feeRows.map(row => `
    <tr>
      <td style="padding: 8px 0; color: #666;">${row.label}</td>
      <td style="padding: 8px 0; text-align: right;">£${row.amount}</td>
    </tr>
  `).join("")

  const feeRowsText = feeRows.map(row => `${row.label}: £${row.amount}`).join("\n")

  return {
    subject: `Your HomePanel Quote - £${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf8;">
  <div style="background-color: white; border-radius: 24px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
    
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #1a1a1a; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">H</div>
    </div>

    <!-- Heading -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 8px;">If you let us handle this</h1>
      <h1 style="font-size: 24px; font-weight: 600; margin: 0;">journey for you</h1>
    </div>

    <!-- Main fee -->
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="color: #666; margin: 0 0 8px;">Our fee for your ${fees.transactionLabel} would be:</p>
      <p style="font-size: 36px; font-weight: 700; margin: 0; color: #1a1a1a;">£${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>

    <!-- Fee breakdown -->
    <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
      <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 16px; color: #1a1a1a;">Fee breakdown</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${feeRowsHtml}
        <tr>
          <td style="padding: 12px 0 8px; color: #666; border-top: 1px solid #e5e5e5;">Subtotal</td>
          <td style="padding: 12px 0 8px; text-align: right; border-top: 1px solid #e5e5e5;">£${fees.subtotal}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">VAT (20%)</td>
          <td style="padding: 8px 0; text-align: right;">£${fees.vat}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0 8px; color: #666; border-top: 1px solid #e5e5e5;">Disbursements</td>
          <td style="padding: 12px 0 8px; text-align: right; border-top: 1px solid #e5e5e5;">£${fees.disbursements}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #999; font-size: 12px;" colspan="2">
            Searches (£${fees.searchFees}), Land Registry (£${fees.landRegistryFee}), Bank Transfer (£${fees.bankTransferFee})
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 0 0; font-weight: 600; border-top: 1px solid #e5e5e5;">Total</td>
          <td style="padding: 16px 0 0; text-align: right; font-weight: 600; border-top: 1px solid #e5e5e5;">£${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>

    <!-- Agents -->
    <div style="text-align: center; margin-bottom: 32px;">
      <p style="color: #666; margin: 0 0 16px;">Your case would directly be handled by</p>
      <table style="margin: 0 auto;">
        <tr>
          ${agents.map((agent, i) => `
            ${i > 0 ? '<td style="padding: 0 16px; color: #999; font-size: 14px;">or</td>' : ''}
            <td style="text-align: center; padding: 0 8px;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background-color: #e5e5e5; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 20px; color: #666;">${agent.name.split(" ").map(n => n[0]).join("")}</span>
              </div>
              <p style="margin: 0; font-weight: 500; font-size: 14px;">${agent.name}</p>
              <p style="margin: 4px 0 0; color: #666; font-size: 12px;">${agent.role}</p>
            </td>
          `).join("")}
        </tr>
      </table>
      <p style="color: #666; font-size: 14px; margin: 16px 0 0;">Experts in their field.</p>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="https://homepanel.co.uk/contact" style="display: inline-block; background-color: #059669; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">Get started with HomePanel</a>
    </div>

    <!-- What happens next -->
    <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px;">
      <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 16px;">What happens next?</h3>
      <ol style="color: #666; margin: 0; padding-left: 20px; font-size: 14px;">
        <li style="margin-bottom: 8px;">Our team will review your details</li>
        <li style="margin-bottom: 8px;">We'll contact you to discuss your move</li>
        <li style="margin-bottom: 8px;">We'll guide you through our onboarding process</li>
        <li>Once ready, we'll connect you with your dedicated conveyancer</li>
      </ol>
    </div>

    <p style="color: #666; margin: 24px 0 8px; font-size: 14px;">
      Questions? Simply reply to this email.
    </p>
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
Your HomePanel Quote

If you let us handle this journey for you

Our fee for your ${fees.transactionLabel} would be:
£${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Fee breakdown:
${feeRowsText}
Subtotal: £${fees.subtotal}
VAT (20%): £${fees.vat}
Disbursements: £${fees.disbursements}
  - Searches: £${fees.searchFees}
  - Land Registry: £${fees.landRegistryFee}
  - Bank Transfer: £${fees.bankTransferFee}
Total: £${fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Your case would directly be handled by:
${agents.map(a => `- ${a.name}, ${a.role}`).join("\n")}
Experts in their field.

What happens next?
1. Our team will review your details
2. We'll contact you to discuss your move
3. We'll guide you through our onboarding process
4. Once ready, we'll connect you with your dedicated conveyancer

Questions? Simply reply to this email.

Best regards,
The HomePanel Team

---
HomePanel | Simplifying your home move
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
      <div style="display: inline-block; background-color: #1a1a1a; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">H</div>
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
      <a href="${data.magicLink}" style="display: inline-block; background-color: #059669; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">Start Onboarding</a>
    </div>

    <p style="color: #666; font-size: 14px; margin-bottom: 24px;">This link will expire in 24 hours. If you need a new link, please contact us.</p>

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
      <div style="display: inline-block; background-color: #1a1a1a; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">H</div>
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
      <div style="display: inline-block; background-color: #1a1a1a; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">H</div>
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
    <div style="display: inline-block; background-color: #1a1a1a; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">H</div>
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
