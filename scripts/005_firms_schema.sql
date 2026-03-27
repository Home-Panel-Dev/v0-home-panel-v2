-- ============================================
-- HomePanel Multi-Firm Support Schema
-- ============================================

-- 1. Create firms table
CREATE TABLE IF NOT EXISTS public.firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1a1a1a',
  secondary_color TEXT DEFAULT '#f8f8f6',
  sra_number TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  email_domain TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create firm_templates table
CREATE TABLE IF NOT EXISTS public.firm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT,
  html_content TEXT,
  text_content TEXT,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(firm_id, template_type)
);

-- 3. Create firm_document_packs table
CREATE TABLE IF NOT EXISTS public.firm_document_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  name TEXT NOT NULL,
  documents JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(firm_id, transaction_type)
);

-- 4. Add firm_id to enquiries table
ALTER TABLE public.enquiries
ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES public.firms(id),
ADD COLUMN IF NOT EXISTS firm_assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS client_care_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS client_care_accepted_at TIMESTAMPTZ;

-- 5. Add firm_id to cases table
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES public.firms(id);

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_firms_slug ON public.firms(slug);
CREATE INDEX IF NOT EXISTS idx_firms_is_active ON public.firms(is_active);
CREATE INDEX IF NOT EXISTS idx_firm_templates_firm_id ON public.firm_templates(firm_id);
CREATE INDEX IF NOT EXISTS idx_firm_templates_type ON public.firm_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_firm_document_packs_firm_id ON public.firm_document_packs(firm_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_firm_id ON public.enquiries(firm_id);
CREATE INDEX IF NOT EXISTS idx_cases_firm_id ON public.cases(firm_id);

-- 7. Enable RLS
ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.firm_document_packs ENABLE ROW LEVEL SECURITY;

-- 8. Create permissive policies
DROP POLICY IF EXISTS "Allow all for firms" ON public.firms;
DROP POLICY IF EXISTS "Allow all for firm_templates" ON public.firm_templates;
DROP POLICY IF EXISTS "Allow all for firm_document_packs" ON public.firm_document_packs;

CREATE POLICY "Allow all for firms" ON public.firms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for firm_templates" ON public.firm_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for firm_document_packs" ON public.firm_document_packs FOR ALL USING (true) WITH CHECK (true);

-- 9. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_firms_updated_at ON public.firms;
DROP TRIGGER IF EXISTS update_firm_templates_updated_at ON public.firm_templates;
DROP TRIGGER IF EXISTS update_firm_document_packs_updated_at ON public.firm_document_packs;

CREATE TRIGGER update_firms_updated_at
  BEFORE UPDATE ON public.firms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_firm_templates_updated_at
  BEFORE UPDATE ON public.firm_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_firm_document_packs_updated_at
  BEFORE UPDATE ON public.firm_document_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
