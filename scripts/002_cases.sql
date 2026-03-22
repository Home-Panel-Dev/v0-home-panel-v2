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

-- Clients can view their own cases
CREATE POLICY "cases_select_own" ON public.cases FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "cases_insert_own" ON public.cases FOR INSERT WITH CHECK (client_id = auth.uid());

-- Admins can view and manage all cases
CREATE POLICY "cases_admin_select" ON public.cases FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "cases_admin_update" ON public.cases FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "cases_admin_delete" ON public.cases FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
