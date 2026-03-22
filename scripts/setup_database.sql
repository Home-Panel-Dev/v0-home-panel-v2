-- HomePanel Database Setup
-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_select" ON public.profiles;
DROP POLICY IF EXISTS "cases_select_own" ON public.cases;
DROP POLICY IF EXISTS "cases_insert_own" ON public.cases;
DROP POLICY IF EXISTS "cases_admin_select" ON public.cases;
DROP POLICY IF EXISTS "cases_admin_update" ON public.cases;
DROP POLICY IF EXISTS "cases_admin_delete" ON public.cases;
DROP POLICY IF EXISTS "onboarding_select_own" ON public.onboarding_progress;
DROP POLICY IF EXISTS "onboarding_update_own" ON public.onboarding_progress;
DROP POLICY IF EXISTS "onboarding_admin_select" ON public.onboarding_progress;
DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
DROP POLICY IF EXISTS "documents_admin_all" ON public.documents;
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
DROP POLICY IF EXISTS "activity_select_own" ON public.activity_log;
DROP POLICY IF EXISTS "activity_admin_select" ON public.activity_log;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Cases table
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_solicitor_id UUID REFERENCES public.profiles(id),
  transaction_type TEXT NOT NULL,
  property_address TEXT,
  property_postcode TEXT,
  property_value DECIMAL(12, 2),
  tenure TEXT,
  status TEXT NOT NULL DEFAULT 'pending_onboarding',
  quote_total DECIMAL(10, 2),
  is_first_time_buyer BOOLEAN DEFAULT FALSE,
  has_mortgage BOOLEAN DEFAULT FALSE,
  is_new_build BOOLEAN DEFAULT FALSE,
  is_company_purchase BOOLEAN DEFAULT FALSE,
  has_gift_funds BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases_select_own" ON public.cases FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "cases_insert_own" ON public.cases FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "cases_admin_select" ON public.cases FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "cases_admin_update" ON public.cases FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Onboarding progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  id_verification_status TEXT DEFAULT 'pending',
  id_verification_provider TEXT,
  id_verification_date TIMESTAMP WITH TIME ZONE,
  aml_check_status TEXT DEFAULT 'pending',
  aml_check_date TIMESTAMP WITH TIME ZONE,
  source_of_funds_status TEXT DEFAULT 'pending',
  source_of_funds_provider TEXT,
  source_of_funds_date TIMESTAMP WITH TIME ZONE,
  documents_status TEXT DEFAULT 'pending',
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "onboarding_select_own" ON public.onboarding_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "onboarding_update_own" ON public.onboarding_progress FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "onboarding_admin_select" ON public.onboarding_progress FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending_review',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select_own" ON public.documents FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "documents_insert_own" ON public.documents FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "documents_admin_all" ON public.documents FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));

-- Activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_select_own" ON public.activity_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid()));
CREATE POLICY "activity_admin_select" ON public.activity_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
