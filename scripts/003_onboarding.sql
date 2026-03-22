CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_reference TEXT,
  provider_data JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(case_id, step)
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_select_own" ON public.onboarding_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "onboarding_update_own" ON public.onboarding_progress FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "onboarding_insert" ON public.onboarding_progress FOR INSERT WITH CHECK (true);
