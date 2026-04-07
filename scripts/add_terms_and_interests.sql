-- Migration: Add terms consent and product interests to enquiries table
-- Run each statement separately to avoid issues with IF NOT EXISTS

-- Add terms_accepted column
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;

-- Add terms_accepted_at column
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- Add marketing_consent column  
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Add marketing_consent_at column
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ;

-- Add interest_solar column
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS interest_solar BOOLEAN DEFAULT false;

-- Add interest_boiler column
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS interest_boiler BOOLEAN DEFAULT false;
