import type { EnquiryFormData } from "@/lib/form-schema"

const transactionTypeLabels: Record<string, string> = {
  buying: "Buying",
  selling: "Selling",
  "buying-selling": "Buying & Selling",
  remortgage: "Remortgaging",
  "transfer-equity": "Transfer of Equity",
}

const tenureLabels: Record<string, string> = {
  freehold: "Freehold",
  leasehold: "Leasehold",
  unsure: "Unsure",
}

export function getCustomerConfirmationEmail(data: EnquiryFormData) {
  const transactionType = transactionTypeLabels[data.transactionType] || data.transactionType
  const fullName = `${data.firstName} ${data.lastName}`

  return {
    subject: "HomePanel has received your enquiry",
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
    <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 600;">HomePanel</h1>
  </div>

  <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Thank you for your enquiry</h2>
  
  <p style="color: #666; margin-bottom: 24px;">
    Dear ${fullName},
  </p>
  
  <p style="color: #666; margin-bottom: 24px;">
    We've received your enquiry about your ${transactionType.toLowerCase()} transaction, and a member of the HomePanel team will be in touch shortly.
  </p>

  <div style="background-color: #f8f8f6; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 16px;">What happens next?</h3>
    <ol style="color: #666; margin: 0; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Our team will review your details</li>
      <li style="margin-bottom: 8px;">We'll contact you to discuss your move</li>
      <li style="margin-bottom: 8px;">We'll guide you through our onboarding process</li>
      <li>Once ready, we'll connect you with a suitable solicitor</li>
    </ol>
  </div>

  <p style="color: #666; margin-bottom: 24px;">
    In the meantime, if you have any questions, please don't hesitate to reply to this email.
  </p>

  <p style="color: #666; margin-bottom: 8px;">
    Best regards,
  </p>
  <p style="color: #1a1a1a; font-weight: 500; margin: 0;">
    The HomePanel Team
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    HomePanel | Simplifying your home move<br>
    <a href="https://homepanel.co.uk" style="color: #999;">homepanel.co.uk</a>
  </p>
</body>
</html>
    `,
    text: `
Thank you for your enquiry

Dear ${fullName},

We've received your enquiry about your ${transactionType.toLowerCase()} transaction, and a member of the HomePanel team will be in touch shortly.

What happens next?

1. Our team will review your details
2. We'll contact you to discuss your move
3. We'll guide you through our onboarding process
4. Once ready, we'll connect you with a suitable solicitor

In the meantime, if you have any questions, please don't hesitate to reply to this email.

Best regards,
The HomePanel Team

---
HomePanel | Simplifying your home move
homepanel.co.uk
    `,
  }
}

export function getInternalAlertEmail(data: EnquiryFormData) {
  const transactionType = transactionTypeLabels[data.transactionType] || data.transactionType
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
    subject: "New HomePanel enquiry received",
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
  </div>

  <p style="color: #666; margin-bottom: 24px;">
    A new enquiry has been submitted through the HomePanel website.
  </p>

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
        <td style="padding: 8px 0; font-weight: 500;">${transactionType}</td>
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
      <tr>
        <td style="padding: 8px 0; color: #666;">Submitted</td>
        <td style="padding: 8px 0; font-weight: 500;">${timestamp}</td>
      </tr>
    </table>
  </div>

  <p style="color: #666; font-size: 14px;">
    Please follow up with this client within 24 hours.
  </p>
</body>
</html>
    `,
    text: `
New HomePanel Enquiry

A new enquiry has been submitted through the HomePanel website.

Contact Details:
- Name: ${fullName}
- Email: ${data.email}
- Phone: ${data.phone}

Transaction Details:
- Transaction Type: ${transactionType}
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
- Submitted: ${timestamp}

Please follow up with this client within 24 hours.
    `,
  }
}
