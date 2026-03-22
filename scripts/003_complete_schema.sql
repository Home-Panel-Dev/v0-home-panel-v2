-- HomePanel Complete Schema Migration
-- Run this in Supabase SQL Editor

-- ================================================
-- 1. ENQUIRIES TABLE UPDATES
-- ================================================
ALTER TABLE public.enquiries 
ADD COLUMN IF NOT EXISTS case_reference TEXT,
ADD COLUMN IF NOT EXISTS onboarding_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS invited_to_onboarding_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_client_activity_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on onboarding_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_enquiries_onboarding_token ON public.enquiries(onboarding_token);

-- ================================================
-- 2. CASES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  case_reference TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending_onboarding',
  
  -- Assignment
  assigned_firm_name TEXT,
  assigned_firm_id TEXT,
  assigned_admin_id UUID REFERENCES public.profiles(id),
  
  -- Client info (copied from enquiry for quick access)
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Property info
  property_address TEXT,
  property_postcode TEXT,
  property_value NUMERIC,
  transaction_type TEXT,
  tenure TEXT,
  
  -- Compliance statuses
  id_verification_status TEXT DEFAULT 'not_started',
  source_of_funds_status TEXT DEFAULT 'not_started',
  aml_review_status TEXT DEFAULT 'not_started',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_enquiry_id ON public.cases(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_cases_case_reference ON public.cases(case_reference);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Cases policies (admin access via service role)
DROP POLICY IF EXISTS "Allow all access to cases" ON public.cases;
CREATE POLICY "Allow all access to cases" ON public.cases FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- 3. DOCUMENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- Upload info
  uploaded_by_type TEXT DEFAULT 'client', -- 'client', 'admin'
  uploaded_by_id TEXT,
  
  -- File info
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  
  -- Document metadata
  document_type TEXT DEFAULT 'other', -- passport, driving_licence, proof_of_address, bank_statement, payslip, source_of_funds_evidence, other
  
  -- Review
  review_status TEXT DEFAULT 'pending_review', -- pending_review, approved, rejected, replacement_requested
  review_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_enquiry_id ON public.documents(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON public.documents(review_status);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Documents policies
DROP POLICY IF EXISTS "Allow all access to documents" ON public.documents;
CREATE POLICY "Allow all access to documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- 4. ACTIVITY LOG TABLE
-- ================================================
DROP TABLE IF EXISTS public.activity_log;
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  
  -- Actor info
  actor_type TEXT NOT NULL, -- 'system', 'admin', 'client'
  actor_id TEXT,
  
  -- Action info
  action TEXT NOT NULL, -- 'enquiry_submitted', 'onboarding_invited', 'onboarding_step_completed', 'document_uploaded', 'case_created', etc.
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_enquiry_id ON public.activity_log(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_case_id ON public.activity_log(case_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Activity log policies
DROP POLICY IF EXISTS "Allow all access to activity_log" ON public.activity_log;
CREATE POLICY "Allow all access to activity_log" ON public.activity_log FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- 5. PROFILES TABLE UPDATES
-- ================================================
-- Ensure profiles has proper policies
DROP POLICY IF EXISTS "Allow all inserts to profiles" ON public.profiles;
CREATE POLICY "Allow all inserts to profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
CREATE POLICY "Allow all access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Make existing users admin
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- ================================================
-- 6. HELPER FUNCTION FOR CASE REFERENCE
-- ================================================
CREATE OR REPLACE FUNCTION generate_case_reference()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_ref TEXT;
  exists_already BOOLEAN;
BEGIN
  year_part := TO_CHAR(NOW(), 'YY');
  LOOP
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    new_ref := 'HP-' || year_part || '-' || random_part;
    SELECT EXISTS(SELECT 1 FROM public.cases WHERE case_reference = new_ref) INTO exists_already;
    IF NOT exists_already THEN
      RETURN new_ref;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 7. UPDATE TRIGGER FOR updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to enquiries
DROP TRIGGER IF EXISTS update_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER update_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to cases
DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
