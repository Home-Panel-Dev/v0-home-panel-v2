CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_select_own" ON public.activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "activity_insert" ON public.activity_log FOR INSERT WITH CHECK (true);
