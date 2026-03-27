import { Resend } from "resend"
import { getFirmById, getFirmTemplate, renderTemplate, getClientCareTemplateType, TEMPLATE_TYPES } from "./firms"
import { createAdminClient } from "./database"
import { formatCurrency } from "./utils/format"

const resend = new Resend(process.env.RESEND_API_KEY)

// Get base URL for links
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "https://v0-home-panel-v2.vercel.app"
}

// Get from email address
function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "HomePanel <onboarding@resend.dev>"
}

interface SendOnboardingInviteParams {
  enquiryId: string
  onboardingToken: string
}

// Send firm-branded onboarding invite email
export async function sendFirmOnboardingInvite({
  enquiryId,
  onboardingToken,
}: SendOnboardingInviteParams): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()
  
  // Get enquiry with firm
  const { data: enquiry, error: enquiryError } = await adminClient
    .from("enquiries")
    .select("*, firm:firms(*)")
    .eq("id", enquiryId)
    .single()
  
  if (enquiryError || !enquiry) {
    return { success: false, error: "Enquiry not found" }
  }
  
  const firm = enquiry.firm
  const onboardingUrl = `${getBaseUrl()}/onboarding/${onboardingToken}`
  
  // Build template variables
  const variables: Record<string, string> = {
    client_name: `${enquiry.first_name} ${enquiry.last_name}`,
    property_address: enquiry.address || "your property",
    onboarding_url: onboardingUrl,
    quote_amount: formatCurrency(enquiry.quote_amount),
  }
  
  let subject: string
  let html: string
  let text: string
  
  if (firm) {
    // Get firm-specific template
    const template = await getFirmTemplate(firm.id, TEMPLATE_TYPES.ONBOARDING_INVITE)
    
    if (template) {
      subject = renderTemplate(template.subject || "Your Onboarding", variables)
      html = renderTemplate(template.html_content || "", variables)
      text = renderTemplate(template.text_content || "", variables)
    } else {
      // Fallback to default template with firm branding
      const result = getDefaultOnboardingEmail(variables, firm)
      subject = result.subject
      html = result.html
      text = result.text
    }
  } else {
    // No firm assigned - use default HomePanel template
    const result = getDefaultOnboardingEmail(variables, null)
    subject = result.subject
    html = result.html
    text = result.text
  }
  
  try {
    const { error: emailError } = await resend.emails.send({
      from: getFromEmail(),
      to: enquiry.email,
      subject,
      html,
      text,
    })
    
    if (emailError) {
      console.error("Email send error:", emailError)
      return { success: false, error: emailError.message }
    }
    
    // Log activity
    await adminClient.from("activity_log").insert({
      enquiry_id: enquiryId,
      actor_type: "system",
      action: "onboarding_invite_sent",
      description: `Onboarding invite sent to ${enquiry.email}`,
      metadata: { firm_id: firm?.id, firm_name: firm?.name },
    })
    
    return { success: true }
  } catch (error) {
    console.error("Email error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

interface SendClientCareEmailParams {
  enquiryId: string
}

// Send firm-branded client care email
export async function sendFirmClientCareEmail({
  enquiryId,
}: SendClientCareEmailParams): Promise<{ success: boolean; error?: string }> {
  const adminClient = createAdminClient()
  
  // Get enquiry with firm
  const { data: enquiry, error: enquiryError } = await adminClient
    .from("enquiries")
    .select("*, firm:firms(*)")
    .eq("id", enquiryId)
    .single()
  
  if (enquiryError || !enquiry) {
    return { success: false, error: "Enquiry not found" }
  }
  
  const firm = enquiry.firm
  if (!firm) {
    return { success: false, error: "No firm assigned to enquiry" }
  }
  
  // Get the right template type based on transaction
  const templateType = getClientCareTemplateType(enquiry.transaction_type)
  const template = await getFirmTemplate(firm.id, templateType)
  
  if (!template) {
    return { success: false, error: "No client care template found for firm" }
  }
  
  // Build template variables
  const variables: Record<string, string> = {
    client_name: `${enquiry.first_name} ${enquiry.last_name}`,
    property_address: enquiry.address || "your property",
    quote_amount: formatCurrency(enquiry.quote_amount),
    transaction_type: enquiry.transaction_type,
  }
  
  const subject = renderTemplate(template.subject || "Your Terms of Engagement", variables)
  const html = renderTemplate(template.html_content || "", variables)
  const text = renderTemplate(template.text_content || "", variables)
  
  try {
    const { error: emailError } = await resend.emails.send({
      from: getFromEmail(),
      to: enquiry.email,
      subject,
      html,
      text,
    })
    
    if (emailError) {
      console.error("Email send error:", emailError)
      return { success: false, error: emailError.message }
    }
    
    // Update enquiry
    await adminClient
      .from("enquiries")
      .update({ client_care_sent_at: new Date().toISOString() })
      .eq("id", enquiryId)
    
    // Log activity
    await adminClient.from("activity_log").insert({
      enquiry_id: enquiryId,
      actor_type: "system",
      action: "client_care_sent",
      description: `Client care letter sent to ${enquiry.email}`,
      metadata: { firm_id: firm.id, firm_name: firm.name, template_type: templateType },
    })
    
    return { success: true }
  } catch (error) {
    console.error("Email error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// Default onboarding email template
function getDefaultOnboardingEmail(
  variables: Record<string, string>,
  firm: { name: string; primary_color: string } | null
) {
  const firmName = firm?.name || "HomePanel"
  const primaryColor = firm?.primary_color || "#1a1a1a"
  
  return {
    subject: `Your Property Transaction - Action Required`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fafaf8;">
  <div style="background-color: white; border-radius: 24px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: ${primaryColor}; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 18px;">${firmName.charAt(0)}</div>
      <h1 style="font-size: 20px; font-weight: 600; margin: 16px 0 0;">${firmName}</h1>
    </div>
    
    <p style="margin-bottom: 16px;">Dear ${variables.client_name},</p>
    
    <p style="margin-bottom: 16px;">Thank you for instructing us to act on your behalf for your property transaction at <strong>${variables.property_address}</strong>.</p>
    
    <p style="margin-bottom: 16px;">To proceed, please complete our secure onboarding process.</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${variables.onboarding_url}" style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 500;">Begin Onboarding</a>
    </div>
    
    <p style="margin-bottom: 8px;">Best regards,</p>
    <p style="margin: 0; font-weight: 600;">${firmName}</p>
  </div>
</body>
</html>
    `,
    text: `Dear ${variables.client_name},

Thank you for instructing us for your property transaction at ${variables.property_address}.

Please complete onboarding at: ${variables.onboarding_url}

Best regards,
${firmName}`,
  }
}
