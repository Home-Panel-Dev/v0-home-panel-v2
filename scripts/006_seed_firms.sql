-- ============================================
-- Seed Mock Firms for HomePanel
-- ============================================

-- 1. NPS Law - Premium, professional, formal
INSERT INTO public.firms (id, name, slug, primary_color, secondary_color, sra_number, address, phone, email, email_domain, website)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  'NPS Law',
  'nps-law',
  '#1e3a5f',
  '#f5f7fa',
  '123456',
  '45 Chancery Lane, London, WC2A 1JE',
  '020 7946 0958',
  'enquiries@npslaw.co.uk',
  'npslaw.co.uk',
  'https://npslaw.co.uk'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color;

-- 2. Urban Conveyancing - Modern, tech-forward, friendly
INSERT INTO public.firms (id, name, slug, primary_color, secondary_color, sra_number, address, phone, email, email_domain, website)
VALUES (
  'f2000000-0000-0000-0000-000000000002',
  'Urban Conveyancing',
  'urban-conveyancing',
  '#059669',
  '#ecfdf5',
  '654321',
  '12 Tech Hub, Manchester, M1 4BT',
  '0161 234 5678',
  'hello@urbanconveyancing.co.uk',
  'urbanconveyancing.co.uk',
  'https://urbanconveyancing.co.uk'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color;

-- 3. Prime Property Lawyers - High-end, luxury, minimal
INSERT INTO public.firms (id, name, slug, primary_color, secondary_color, sra_number, address, phone, email, email_domain, website)
VALUES (
  'f3000000-0000-0000-0000-000000000003',
  'Prime Property Lawyers',
  'prime-property',
  '#0f172a',
  '#faf9f7',
  '789012',
  '1 Mayfair Place, London, W1K 1BJ',
  '020 7123 4567',
  'concierge@primeproperty.law',
  'primeproperty.law',
  'https://primeproperty.law'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color;

-- ============================================
-- Firm Templates - NPS Law
-- ============================================

-- NPS Law - Onboarding Invite Email
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  'onboarding_invite',
  'NPS Law Onboarding Invite',
  'Your Property Transaction with NPS Law - Action Required',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #1e3a5f; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f7fa;">
  <div style="background-color: white; border-radius: 4px; padding: 48px; border: 1px solid #e2e8f0;">
    <div style="border-bottom: 2px solid #1e3a5f; padding-bottom: 24px; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #1e3a5f;">NPS Law</h1>
      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Solicitors & Conveyancers</p>
    </div>
    
    <p style="margin-bottom: 16px;">Dear {{client_name}},</p>
    
    <p style="margin-bottom: 16px;">Thank you for instructing NPS Law to act on your behalf in connection with your property transaction at <strong>{{property_address}}</strong>.</p>
    
    <p style="margin-bottom: 16px;">To proceed with your matter, we require you to complete our secure onboarding process. This will involve:</p>
    
    <ul style="margin-bottom: 24px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Verifying your identity</li>
      <li style="margin-bottom: 8px;">Confirming your source of funds</li>
      <li style="margin-bottom: 8px;">Reviewing and accepting our terms of engagement</li>
      <li style="margin-bottom: 8px;">Uploading any required documentation</li>
    </ul>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{onboarding_url}}" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 14px 32px; text-decoration: none; font-weight: 500; border-radius: 4px;">Begin Onboarding</a>
    </div>
    
    <p style="margin-bottom: 16px;">Should you have any questions, please do not hesitate to contact us.</p>
    
    <p style="margin-bottom: 4px;">Yours faithfully,</p>
    <p style="margin: 0; font-weight: 600;">NPS Law</p>
    <p style="font-size: 12px; color: #64748b; margin-top: 4px;">SRA Number: 123456</p>
    
    <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #64748b;">
      <p style="margin: 0;">NPS Law | 45 Chancery Lane, London, WC2A 1JE | 020 7946 0958</p>
      <p style="margin: 4px 0 0;">This email is confidential and intended solely for the addressee.</p>
    </div>
  </div>
</body>
</html>',
  'Dear {{client_name}},

Thank you for instructing NPS Law to act on your behalf in connection with your property transaction at {{property_address}}.

To proceed with your matter, please complete our secure onboarding process at:
{{onboarding_url}}

Yours faithfully,
NPS Law
SRA Number: 123456'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- NPS Law - Client Care Letter (Purchase)
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  'client_care_purchase',
  'NPS Law Client Care - Purchase',
  'Your Purchase - Terms of Engagement | NPS Law',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #1e3a5f; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f7fa;">
  <div style="background-color: white; border-radius: 4px; padding: 48px; border: 1px solid #e2e8f0;">
    <div style="border-bottom: 2px solid #1e3a5f; padding-bottom: 24px; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #1e3a5f;">NPS Law</h1>
      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Client Care Letter - Purchase</p>
    </div>
    
    <p style="margin-bottom: 16px;">Dear {{client_name}},</p>
    
    <p style="margin-bottom: 16px;"><strong>Re: Purchase of {{property_address}}</strong></p>
    
    <p style="margin-bottom: 16px;">We are pleased to confirm our instructions to act on your behalf in connection with your proposed purchase of the above property.</p>
    
    <h3 style="font-size: 16px; margin: 24px 0 12px; color: #1e3a5f;">Our Services</h3>
    <p style="margin-bottom: 16px;">We will carry out the legal work necessary to complete your purchase, including:</p>
    <ul style="margin-bottom: 24px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Reviewing the contract documentation</li>
      <li style="margin-bottom: 8px;">Carrying out necessary searches</li>
      <li style="margin-bottom: 8px;">Raising enquiries with the seller''s solicitors</li>
      <li style="margin-bottom: 8px;">Reporting to your mortgage lender (if applicable)</li>
      <li style="margin-bottom: 8px;">Completing the transaction and registering your ownership</li>
    </ul>
    
    <h3 style="font-size: 16px; margin: 24px 0 12px; color: #1e3a5f;">Costs</h3>
    <p style="margin-bottom: 16px;">Our fees for this transaction are <strong>{{quote_amount}}</strong> plus VAT and disbursements as outlined in our quotation.</p>
    
    <h3 style="font-size: 16px; margin: 24px 0 12px; color: #1e3a5f;">Next Steps</h3>
    <p style="margin-bottom: 16px;">Please review the attached documents and confirm your acceptance of our terms of engagement.</p>
    
    <p style="margin-bottom: 4px;">Yours faithfully,</p>
    <p style="margin: 0; font-weight: 600;">NPS Law</p>
  </div>
</body>
</html>',
  'Client Care Letter - Purchase

Dear {{client_name}},

Re: Purchase of {{property_address}}

We are pleased to confirm our instructions to act on your behalf.

Our fees: {{quote_amount}} plus VAT and disbursements.

Yours faithfully,
NPS Law'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- NPS Law - Client Care Letter (Sale)
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  'client_care_sale',
  'NPS Law Client Care - Sale',
  'Your Sale - Terms of Engagement | NPS Law',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #1e3a5f; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f7fa;">
  <div style="background-color: white; border-radius: 4px; padding: 48px; border: 1px solid #e2e8f0;">
    <div style="border-bottom: 2px solid #1e3a5f; padding-bottom: 24px; margin-bottom: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0; color: #1e3a5f;">NPS Law</h1>
      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Client Care Letter - Sale</p>
    </div>
    
    <p style="margin-bottom: 16px;">Dear {{client_name}},</p>
    
    <p style="margin-bottom: 16px;"><strong>Re: Sale of {{property_address}}</strong></p>
    
    <p style="margin-bottom: 16px;">We are pleased to confirm our instructions to act on your behalf in connection with your proposed sale of the above property.</p>
    
    <h3 style="font-size: 16px; margin: 24px 0 12px; color: #1e3a5f;">Our Services</h3>
    <p style="margin-bottom: 16px;">We will carry out the legal work necessary to complete your sale, including:</p>
    <ul style="margin-bottom: 24px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Preparing the contract documentation</li>
      <li style="margin-bottom: 8px;">Responding to buyer enquiries</li>
      <li style="margin-bottom: 8px;">Liaising with your mortgage lender for redemption</li>
      <li style="margin-bottom: 8px;">Completing the transaction</li>
    </ul>
    
    <h3 style="font-size: 16px; margin: 24px 0 12px; color: #1e3a5f;">Costs</h3>
    <p style="margin-bottom: 16px;">Our fees for this transaction are <strong>{{quote_amount}}</strong> plus VAT and disbursements.</p>
    
    <p style="margin-bottom: 4px;">Yours faithfully,</p>
    <p style="margin: 0; font-weight: 600;">NPS Law</p>
  </div>
</body>
</html>',
  'Client Care Letter - Sale

Dear {{client_name}},

Re: Sale of {{property_address}}

We are pleased to confirm our instructions to act on your behalf.

Yours faithfully,
NPS Law'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- ============================================
-- Firm Templates - Urban Conveyancing
-- ============================================

-- Urban Conveyancing - Onboarding Invite Email
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f2000000-0000-0000-0000-000000000002',
  'onboarding_invite',
  'Urban Conveyancing Onboarding Invite',
  'Let''s get your property move started {{client_name}}',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ecfdf5;">
  <div style="background-color: white; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #059669; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 20px;">U</div>
      <h1 style="font-size: 20px; font-weight: 600; margin: 16px 0 0; color: #059669;">Urban Conveyancing</h1>
    </div>
    
    <p style="margin-bottom: 16px;">Hi {{client_name}},</p>
    
    <p style="margin-bottom: 16px;">Great news - we''re ready to get your property transaction moving at <strong>{{property_address}}</strong>.</p>
    
    <p style="margin-bottom: 16px;">Our simple onboarding takes just a few minutes and covers:</p>
    
    <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="color: #059669; margin-right: 12px;">1.</span>
        <span>Quick ID verification</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 12px;">
        <span style="color: #059669; margin-right: 12px;">2.</span>
        <span>Secure source of funds check</span>
      </div>
      <div style="display: flex; align-items: center;">
        <span style="color: #059669; margin-right: 12px;">3.</span>
        <span>Document upload</span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{onboarding_url}}" style="display: inline-block; background-color: #059669; color: white; padding: 14px 32px; text-decoration: none; font-weight: 500; border-radius: 12px;">Start Onboarding</a>
    </div>
    
    <p style="margin-bottom: 16px;">Questions? Just reply to this email - we''re here to help.</p>
    
    <p style="margin: 0;">Cheers,<br><strong>The Urban Conveyancing Team</strong></p>
  </div>
</body>
</html>',
  'Hi {{client_name}},

Great news - we''re ready to get your property transaction moving!

Start your onboarding here: {{onboarding_url}}

Cheers,
The Urban Conveyancing Team'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- Urban Conveyancing - Client Care (Purchase)
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f2000000-0000-0000-0000-000000000002',
  'client_care_purchase',
  'Urban Conveyancing Client Care - Purchase',
  'Your purchase is in safe hands',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ecfdf5;">
  <div style="background-color: white; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #059669; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 20px;">U</div>
    </div>
    
    <p style="margin-bottom: 16px;">Hi {{client_name}},</p>
    
    <p style="margin-bottom: 16px;">Thanks for choosing Urban Conveyancing for your purchase at <strong>{{property_address}}</strong>.</p>
    
    <p style="margin-bottom: 16px;">Here''s what we''ll take care of:</p>
    
    <ul style="margin-bottom: 24px; padding-left: 20px;">
      <li style="margin-bottom: 8px;">Contract review and negotiation</li>
      <li style="margin-bottom: 8px;">Property searches</li>
      <li style="margin-bottom: 8px;">Mortgage liaison</li>
      <li style="margin-bottom: 8px;">Completion and registration</li>
    </ul>
    
    <div style="background-color: #f8f8f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-weight: 600;">Your quote: {{quote_amount}}</p>
      <p style="margin: 4px 0 0; font-size: 14px; color: #666;">Plus VAT and disbursements</p>
    </div>
    
    <p style="margin: 0;">Best,<br><strong>Urban Conveyancing</strong></p>
  </div>
</body>
</html>',
  'Hi {{client_name}},

Thanks for choosing Urban Conveyancing!

Your quote: {{quote_amount}} plus VAT and disbursements.

Best,
Urban Conveyancing'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- Urban Conveyancing - Client Care (Sale)
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f2000000-0000-0000-0000-000000000002',
  'client_care_sale',
  'Urban Conveyancing Client Care - Sale',
  'Your sale is in safe hands',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ecfdf5;">
  <div style="background-color: white; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background-color: #059669; color: white; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-weight: 600; font-size: 20px;">U</div>
    </div>
    
    <p style="margin-bottom: 16px;">Hi {{client_name}},</p>
    
    <p style="margin-bottom: 16px;">Thanks for choosing Urban Conveyancing for your sale at <strong>{{property_address}}</strong>.</p>
    
    <div style="background-color: #f8f8f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <p style="margin: 0; font-weight: 600;">Your quote: {{quote_amount}}</p>
    </div>
    
    <p style="margin: 0;">Best,<br><strong>Urban Conveyancing</strong></p>
  </div>
</body>
</html>',
  'Hi {{client_name}},

Thanks for choosing Urban Conveyancing for your sale!

Best,
Urban Conveyancing'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- ============================================
-- Firm Templates - Prime Property Lawyers
-- ============================================

-- Prime Property Lawyers - Onboarding Invite Email
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f3000000-0000-0000-0000-000000000003',
  'onboarding_invite',
  'Prime Property Lawyers Onboarding Invite',
  'Prime Property Lawyers | Your Onboarding',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; line-height: 1.8; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f7;">
  <div style="background-color: white; padding: 56px;">
    <div style="text-align: center; margin-bottom: 48px;">
      <h1 style="font-size: 14px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #0f172a;">Prime Property Lawyers</h1>
    </div>
    
    <p style="margin-bottom: 24px;">Dear {{client_name}},</p>
    
    <p style="margin-bottom: 24px;">We are honoured to represent you in your acquisition at {{property_address}}.</p>
    
    <p style="margin-bottom: 24px;">To initiate your matter, please complete our streamlined onboarding process.</p>
    
    <div style="text-align: center; margin: 48px 0;">
      <a href="{{onboarding_url}}" style="display: inline-block; background-color: #0f172a; color: white; padding: 16px 48px; text-decoration: none; font-weight: 400; letter-spacing: 1px; font-size: 12px; text-transform: uppercase;">Begin</a>
    </div>
    
    <p style="margin-bottom: 8px;">With distinction,</p>
    <p style="margin: 0; font-weight: 500;">Prime Property Lawyers</p>
    
    <div style="border-top: 1px solid #e2e8f0; margin-top: 48px; padding-top: 24px; text-align: center;">
      <p style="font-size: 11px; color: #64748b; margin: 0; letter-spacing: 1px;">1 MAYFAIR PLACE, LONDON W1K 1BJ</p>
    </div>
  </div>
</body>
</html>',
  'Dear {{client_name}},

We are honoured to represent you.

Please complete onboarding: {{onboarding_url}}

With distinction,
Prime Property Lawyers'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- Prime Property Lawyers - Client Care (Purchase)
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f3000000-0000-0000-0000-000000000003',
  'client_care_purchase',
  'Prime Property Lawyers Client Care - Purchase',
  'Your Acquisition | Prime Property Lawyers',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; line-height: 1.8; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f7;">
  <div style="background-color: white; padding: 56px;">
    <div style="text-align: center; margin-bottom: 48px;">
      <h1 style="font-size: 14px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; margin: 0;">Prime Property Lawyers</h1>
      <p style="font-size: 11px; color: #64748b; margin: 8px 0 0; letter-spacing: 2px;">TERMS OF ENGAGEMENT</p>
    </div>
    
    <p style="margin-bottom: 24px;">Dear {{client_name}},</p>
    
    <p style="margin-bottom: 24px;"><strong>Re: Acquisition of {{property_address}}</strong></p>
    
    <p style="margin-bottom: 24px;">We confirm our appointment to act exclusively on your behalf in this acquisition.</p>
    
    <p style="margin-bottom: 24px;">Our comprehensive service encompasses all legal requirements for completion.</p>
    
    <div style="background-color: #faf9f7; padding: 24px; margin: 32px 0; text-align: center;">
      <p style="font-size: 11px; color: #64748b; margin: 0 0 8px; letter-spacing: 2px; text-transform: uppercase;">Professional Fees</p>
      <p style="font-size: 24px; font-weight: 300; margin: 0;">{{quote_amount}}</p>
      <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">Exclusive of VAT and disbursements</p>
    </div>
    
    <p style="margin-bottom: 8px;">With distinction,</p>
    <p style="margin: 0; font-weight: 500;">Prime Property Lawyers</p>
  </div>
</body>
</html>',
  'Dear {{client_name}},

Re: Acquisition of {{property_address}}

Professional Fees: {{quote_amount}} exclusive of VAT.

With distinction,
Prime Property Lawyers'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- Prime Property Lawyers - Client Care (Sale)
INSERT INTO public.firm_templates (firm_id, template_type, name, subject, html_content, text_content)
VALUES (
  'f3000000-0000-0000-0000-000000000003',
  'client_care_sale',
  'Prime Property Lawyers Client Care - Sale',
  'Your Disposal | Prime Property Lawyers',
  '<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; line-height: 1.8; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f7;">
  <div style="background-color: white; padding: 56px;">
    <div style="text-align: center; margin-bottom: 48px;">
      <h1 style="font-size: 14px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; margin: 0;">Prime Property Lawyers</h1>
    </div>
    
    <p style="margin-bottom: 24px;">Dear {{client_name}},</p>
    
    <p style="margin-bottom: 24px;"><strong>Re: Disposal of {{property_address}}</strong></p>
    
    <p style="margin-bottom: 24px;">We confirm our appointment to act on your behalf.</p>
    
    <div style="background-color: #faf9f7; padding: 24px; margin: 32px 0; text-align: center;">
      <p style="font-size: 24px; font-weight: 300; margin: 0;">{{quote_amount}}</p>
    </div>
    
    <p style="margin: 0; font-weight: 500;">Prime Property Lawyers</p>
  </div>
</body>
</html>',
  'Dear {{client_name}},

Re: Disposal of {{property_address}}

Professional Fees: {{quote_amount}}

Prime Property Lawyers'
)
ON CONFLICT (firm_id, template_type) DO UPDATE SET
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  text_content = EXCLUDED.text_content;

-- ============================================
-- Document Packs
-- ============================================

-- NPS Law - Purchase Document Pack
INSERT INTO public.firm_document_packs (firm_id, transaction_type, name, documents)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  'buying',
  'NPS Law Purchase Pack',
  '[
    {"name": "Client Care Letter", "type": "client_care", "required": true},
    {"name": "Source of Funds Form", "type": "source_of_funds_form", "required": true},
    {"name": "Property Information Form", "type": "property_info", "required": true},
    {"name": "SDLT Form", "type": "sdlt", "required": false},
    {"name": "Joint Ownership Declaration", "type": "joint_ownership", "required": false}
  ]'::jsonb
)
ON CONFLICT (firm_id, transaction_type) DO UPDATE SET
  documents = EXCLUDED.documents;

-- NPS Law - Sale Document Pack
INSERT INTO public.firm_document_packs (firm_id, transaction_type, name, documents)
VALUES (
  'f1000000-0000-0000-0000-000000000001',
  'selling',
  'NPS Law Sale Pack',
  '[
    {"name": "Client Care Letter", "type": "client_care", "required": true},
    {"name": "Property Information Form (TA6)", "type": "ta6", "required": true},
    {"name": "Fixtures and Fittings (TA10)", "type": "ta10", "required": true}
  ]'::jsonb
)
ON CONFLICT (firm_id, transaction_type) DO UPDATE SET
  documents = EXCLUDED.documents;

-- Urban Conveyancing - Purchase Document Pack
INSERT INTO public.firm_document_packs (firm_id, transaction_type, name, documents)
VALUES (
  'f2000000-0000-0000-0000-000000000002',
  'buying',
  'Urban Conveyancing Purchase Pack',
  '[
    {"name": "Welcome Pack", "type": "welcome", "required": true},
    {"name": "Terms of Engagement", "type": "client_care", "required": true},
    {"name": "AML Questionnaire", "type": "aml", "required": true}
  ]'::jsonb
)
ON CONFLICT (firm_id, transaction_type) DO UPDATE SET
  documents = EXCLUDED.documents;

-- Urban Conveyancing - Sale Document Pack
INSERT INTO public.firm_document_packs (firm_id, transaction_type, name, documents)
VALUES (
  'f2000000-0000-0000-0000-000000000002',
  'selling',
  'Urban Conveyancing Sale Pack',
  '[
    {"name": "Welcome Pack", "type": "welcome", "required": true},
    {"name": "Seller Questionnaire", "type": "seller_questionnaire", "required": true}
  ]'::jsonb
)
ON CONFLICT (firm_id, transaction_type) DO UPDATE SET
  documents = EXCLUDED.documents;

-- Prime Property - Purchase Document Pack
INSERT INTO public.firm_document_packs (firm_id, transaction_type, name, documents)
VALUES (
  'f3000000-0000-0000-0000-000000000003',
  'buying',
  'Prime Property Acquisition Pack',
  '[
    {"name": "Letter of Engagement", "type": "client_care", "required": true},
    {"name": "Wealth Declaration", "type": "source_of_funds_form", "required": true},
    {"name": "KYC Documentation", "type": "kyc", "required": true}
  ]'::jsonb
)
ON CONFLICT (firm_id, transaction_type) DO UPDATE SET
  documents = EXCLUDED.documents;

-- Prime Property - Sale Document Pack
INSERT INTO public.firm_document_packs (firm_id, transaction_type, name, documents)
VALUES (
  'f3000000-0000-0000-0000-000000000003',
  'selling',
  'Prime Property Disposal Pack',
  '[
    {"name": "Letter of Engagement", "type": "client_care", "required": true},
    {"name": "Property Schedule", "type": "property_schedule", "required": true}
  ]'::jsonb
)
ON CONFLICT (firm_id, transaction_type) DO UPDATE SET
  documents = EXCLUDED.documents;
