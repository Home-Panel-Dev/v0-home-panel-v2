-- Migration: Add onboarding support to enquiries table
-- Run this in Supabase SQL Editor

-- Add onboarding columns to enquiries table
ALTER TABLE public.enquiries 
ADD COLUMN IF NOT EXISTS case_reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS onboarding_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS invited_to_onboarding_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_client_activity_at TIMESTAMPTZ;

-- Create index on onboarding_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_enquiries_onboarding_token ON public.enquiries(onboarding_token);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL, -- 'admin', 'client', 'system'
  actor_id TEXT,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for activity lookups by enquiry
CREATE INDEX IF NOT EXISTS idx_activity_log_enquiry_id ON public.activity_log(enquiry_id);

-- Fix profiles table policies - allow service role to insert
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to see all activity
CREATE POLICY "Admins can view all activity" ON public.activity_log
  FOR SELECT USING (true);

CREATE POLICY "System can insert activity" ON public.activity_log
  FOR INSERT WITH CHECK (true);

-- Function to generate unique case reference
CREATE OR REPLACE FUNCTION generate_case_reference()
RETURNS TEXT AS $$
DECLARE
  new_ref TEXT;
  ref_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate reference like HP-2026-001234
    new_ref := 'HP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM public.enquiries WHERE case_reference = new_ref) INTO ref_exists;
    
    -- If not exists, return it
    IF NOT ref_exists THEN
      RETURN new_ref;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate onboarding token
CREATE OR REPLACE FUNCTION generate_onboarding_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
