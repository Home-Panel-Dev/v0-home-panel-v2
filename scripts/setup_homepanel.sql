-- HomePanel Database Schema
-- Run this in Supabase SQL Editor

-- Drop existing tables if needed (be careful in production!)
-- DROP TABLE IF EXISTS case_documents CASCADE;
-- DROP TABLE IF EXISTS case_notes CASCADE;
-- DROP TABLE IF EXISTS cases CASCADE;
-- DROP TABLE IF EXISTS enquiries CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all_profiles" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_select_all_profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- 2. Enquiries table (quote requests)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Property details
  property_address TEXT,
  property_postcode TEXT,
  transaction_type TEXT CHECK (transaction_type IN ('purchase', 'sale', 'both')),
  property_value NUMERIC,
  
  -- Property options
  tenure TEXT,
  owner_count TEXT,
  first_time_buyer TEXT,
  is_new_build TEXT,
  has_mortgage TEXT,
  is_company_purchase TEXT,
  has_gift_funds TEXT,
  bank_funds_only TEXT,
  
  -- Fee breakdown
  legal_fee NUMERIC,
  leasehold_supplement NUMERIC,
  mortgage_fee NUMERIC,
  new_build_fee NUMERIC,
  company_fee NUMERIC,
  gift_funds_fee NUMERIC,
  subtotal NUMERIC,
  vat NUMERIC,
  disbursements NUMERIC,
  quote_amount NUMERIC,
  
  -- Status workflow: new > under_review > accepted > onboarding > active > completed
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'accepted', 'onboarding', 'active', 'completed', 'rejected')),
  
  -- Linking
  assigned_to UUID REFERENCES auth.users(id),
  converted_to_case_id UUID,
  client_user_id UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Enquiries policies - allow service role and admins full access
DROP POLICY IF EXISTS "enquiries_insert_public" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_select_admin" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_update_admin" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_select_own" ON public.enquiries;

CREATE POLICY "enquiries_insert_public" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "enquiries_select_admin" ON public.enquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "enquiries_update_admin" ON public.enquiries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "enquiries_select_own" ON public.enquiries FOR SELECT USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 3. Cases table (active conveyancing cases)
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  enquiry_id UUID REFERENCES public.enquiries(id),
  client_id UUID REFERENCES auth.users(id),
  
  -- Client details (copied from enquiry)
  client_first_name TEXT NOT NULL,
  client_last_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Property details
  property_address TEXT,
  property_postcode TEXT,
  transaction_type TEXT,
  property_value NUMERIC,
  tenure TEXT,
  
  -- Status workflow
  status TEXT DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'exchanged', 'completed', 'aborted')),
  
  -- Key dates
  instruction_date DATE DEFAULT CURRENT_DATE,
  target_completion_date DATE,
  exchange_date DATE,
  completion_date DATE,
  
  -- Assigned staff
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Onboarding progress (JSON for flexibility)
  onboarding_progress JSONB DEFAULT '{"id_verification": false, "source_of_funds": false, "terms_accepted": false}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cases_select_admin" ON public.cases;
DROP POLICY IF EXISTS "cases_select_own" ON public.cases;
DROP POLICY IF EXISTS "cases_insert_admin" ON public.cases;
DROP POLICY IF EXISTS "cases_update_admin" ON public.cases;
DROP POLICY IF EXISTS "cases_update_own" ON public.cases;

CREATE POLICY "cases_select_admin" ON public.cases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "cases_select_own" ON public.cases FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "cases_insert_admin" ON public.cases FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "cases_update_admin" ON public.cases FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "cases_update_own" ON public.cases FOR UPDATE USING (client_id = auth.uid());

-- 4. Case Notes table
CREATE TABLE IF NOT EXISTS public.case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_notes_select_admin" ON public.case_notes;
DROP POLICY IF EXISTS "case_notes_select_client" ON public.case_notes;
DROP POLICY IF EXISTS "case_notes_insert_admin" ON public.case_notes;

CREATE POLICY "case_notes_select_admin" ON public.case_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "case_notes_select_client" ON public.case_notes FOR SELECT USING (
  NOT is_internal AND EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_notes.case_id AND cases.client_id = auth.uid())
);
CREATE POLICY "case_notes_insert_admin" ON public.case_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- 5. Case Documents table
CREATE TABLE IF NOT EXISTS public.case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),
  
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT CHECK (category IN ('id_verification', 'proof_of_funds', 'proof_of_address', 'mortgage_offer', 'contract', 'search_results', 'other')),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_admin" ON public.case_documents;
DROP POLICY IF EXISTS "documents_select_own" ON public.case_documents;
DROP POLICY IF EXISTS "documents_insert_own" ON public.case_documents;
DROP POLICY IF EXISTS "documents_update_admin" ON public.case_documents;

CREATE POLICY "documents_select_admin" ON public.case_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "documents_select_own" ON public.case_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_documents.case_id AND cases.client_id = auth.uid())
);
CREATE POLICY "documents_insert_own" ON public.case_documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_documents.case_id AND cases.client_id = auth.uid())
);
CREATE POLICY "documents_update_admin" ON public.case_documents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- 6. Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Generate case reference function
CREATE OR REPLACE FUNCTION generate_case_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_ref TEXT;
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := to_char(CURRENT_DATE, 'YY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM 4) AS INTEGER)), 0) + 1 INTO seq_num
  FROM public.cases
  WHERE reference LIKE 'HP' || year_part || '%';
  new_ref := 'HP' || year_part || LPAD(seq_num::TEXT, 5, '0');
  RETURN new_ref;
END;
$$;
