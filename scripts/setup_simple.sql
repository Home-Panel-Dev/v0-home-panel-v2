-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create cases table
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Create onboarding_progress table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  id_verification_status TEXT DEFAULT 'pending',
  id_verification_provider TEXT,
  id_verification_date TIMESTAMPTZ,
  aml_check_status TEXT DEFAULT 'pending',
  aml_check_date TIMESTAMPTZ,
  source_of_funds_status TEXT DEFAULT 'pending',
  source_of_funds_provider TEXT,
  source_of_funds_date TIMESTAMPTZ,
  documents_status TEXT DEFAULT 'pending',
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create documents table
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
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create activity_log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
