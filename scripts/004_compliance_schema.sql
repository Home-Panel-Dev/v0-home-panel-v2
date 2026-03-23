-- ============================================
-- HomePanel Compliance Schema
-- ============================================

-- 1. Create compliance_checks table
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL, -- 'identity_verification' or 'source_of_funds'
  provider TEXT NOT NULL, -- 'yoti' or 'armalytix'
  provider_reference TEXT, -- External reference from provider
  status TEXT DEFAULT 'not_started', -- not_started, invited, in_progress, completed, failed, under_review, approved, rejected, manual_review_required
  summary_json JSONB DEFAULT '{}', -- Structured summary for UI display
  raw_payload_json JSONB, -- Raw response from provider (optional)
  matched_fields JSONB DEFAULT '{}', -- For identity: which fields matched
  exception_flags TEXT[] DEFAULT '{}', -- Any issues or flags raised
  completed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_decision TEXT, -- approved, rejected, manual_review_required
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update documents table with improved schema
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'other',
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by_type TEXT DEFAULT 'client',
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending_review',
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);

-- 3. Add internal decision status to enquiries
ALTER TABLE public.enquiries
ADD COLUMN IF NOT EXISTS internal_status TEXT DEFAULT 'awaiting_client',
ADD COLUMN IF NOT EXISTS compliance_summary JSONB DEFAULT '{}';

-- 4. Add compliance fields to cases
ALTER TABLE public.cases
ADD COLUMN IF NOT EXISTS internal_status TEXT DEFAULT 'awaiting_client',
ADD COLUMN IF NOT EXISTS compliance_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compliance_approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS matter_readiness TEXT DEFAULT 'not_ready';

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_compliance_checks_enquiry_id ON public.compliance_checks(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_case_id ON public.compliance_checks(case_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON public.compliance_checks(status);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_check_type ON public.compliance_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_documents_review_status ON public.documents(review_status);

-- 6. Enable RLS
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

-- 7. Create permissive policy for compliance_checks
DROP POLICY IF EXISTS "Allow all for compliance_checks" ON public.compliance_checks;
CREATE POLICY "Allow all for compliance_checks" ON public.compliance_checks FOR ALL USING (true) WITH CHECK (true);

-- 8. Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_compliance_checks_updated_at ON public.compliance_checks;
CREATE TRIGGER update_compliance_checks_updated_at
  BEFORE UPDATE ON public.compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
