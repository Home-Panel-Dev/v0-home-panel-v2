CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select_own" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
CREATE POLICY "documents_insert_own" ON public.documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.cases WHERE id = case_id AND client_id = auth.uid())
);
