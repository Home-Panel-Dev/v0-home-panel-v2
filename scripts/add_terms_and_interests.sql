-- Migration: Add terms consent and product interests to enquiries table
-- This adds fields for:
-- 1. Terms and conditions consent (with timestamp)
-- 2. Marketing consent for third party data sharing
-- 3. Product interest preferences (solar, boiler)

-- Add terms and consent columns to enquiries table
ALTER TABLE enquiries
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;

-- Add product interest columns to enquiries table
ALTER TABLE enquiries
ADD COLUMN IF NOT EXISTS interest_solar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interest_boiler BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN enquiries.terms_accepted IS 'Whether the user accepted terms and conditions at intake';
COMMENT ON COLUMN enquiries.terms_accepted_at IS 'Timestamp when terms were accepted';
COMMENT ON COLUMN enquiries.marketing_consent IS 'Whether the user consented to share data with third parties for marketing';
COMMENT ON COLUMN enquiries.marketing_consent_at IS 'Timestamp when marketing consent was given';
COMMENT ON COLUMN enquiries.interest_solar IS 'User expressed interest in solar products';
COMMENT ON COLUMN enquiries.interest_boiler IS 'User expressed interest in boiler products and services';
