-- HomePanel Database Schema
-- Run this migration to create all required tables

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table (property transactions)
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_solicitor_id UUID REFERENCES public.profiles(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buying', 'selling', 'buying-selling', 'remortgage', 'transfer-equity')),
  property_address TEXT,
  property_postcode TEXT,
  property_value DECIMAL(12, 2),
  tenure TEXT CHECK (tenure IN ('freehold', 'leasehold', 'not-sure')),
  status TEXT NOT NULL DEFAULT 'pending_onboarding' CHECK (status IN ('pending_onboarding', 'id_verification', 'aml_check', 'source_of_funds', 'documents', 'in_progress', 'completed', 'cancelled')),
  quote_total DECIMAL(10, 2),
  is_first_time_buyer BOOLEAN DEFAULT FALSE,
  has_mortgage BOOLEAN DEFAULT FALSE,
  is_new_build BOOLEAN DEFAULT FALSE,
  is_company_purchase BOOLEAN DEFAULT FALSE,
  has_gift_funds BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding progress tracking
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  step TEXT NOT NULL CHECK (step IN ('id_verification', 'aml_check', 'source_of_funds', 'documents')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  provider TEXT,
  provider_reference TEXT,
  provider_data JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(case_id, step)
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('id', 'proof_of_address', 'mortgage_offer', 'bank_statement', 'contract', 'searches', 'other')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Cases RLS Policies
CREATE POLICY "Clients can view own cases" ON public.cases FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "Clients can insert own cases" ON public.cases FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Admins can view all cases" ON public.cases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update cases" ON public.cases FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Onboarding Progress RLS Policies
CREATE POLICY "Users can view own onboarding" ON public.onboarding_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "Users can update own onboarding" ON public.onboarding_progress FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can view all onboarding" ON public.onboarding_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can insert onboarding" ON public.onboarding_progress FOR INSERT WITH CHECK (true);

-- Documents RLS Policies
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "Users can upload own documents" ON public.documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can view all documents" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update documents" ON public.documents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Messages RLS Policies
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
  OR sender_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activity Log RLS Policies
CREATE POLICY "Users can view own activity" ON public.activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can view all activity" ON public.activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can insert activity" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_case_id ON public.onboarding_progress(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_messages_case_id ON public.messages(case_id);
CREATE INDEX IF NOT EXISTS idx_activity_case_id ON public.activity_log(case_id);
