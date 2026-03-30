-- Complete Case Management Schema
-- Run this in Supabase SQL Editor to add all case management tables

-- ================================================
-- 1. Add Extended Columns to Enquiries
-- ================================================
ALTER TABLE public.enquiries 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS secondary_title TEXT,
ADD COLUMN IF NOT EXISTS secondary_first_name TEXT,
ADD COLUMN IF NOT EXISTS secondary_last_name TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS current_postcode TEXT,
ADD COLUMN IF NOT EXISTS reference TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS allow_view_account BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority_exchange BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expected_completion_date DATE,
ADD COLUMN IF NOT EXISTS next_action_date DATE,
ADD COLUMN IF NOT EXISTS branch_id UUID,
ADD COLUMN IF NOT EXISTS branch_name TEXT,
ADD COLUMN IF NOT EXISTS branch_user_id UUID,
ADD COLUMN IF NOT EXISTS branch_user_name TEXT,
ADD COLUMN IF NOT EXISTS abort_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS abort_reason TEXT,
ADD COLUMN IF NOT EXISTS abort_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS abort_requested_at TIMESTAMPTZ;

-- ================================================
-- 2. Add Extended Columns to Cases
-- ================================================
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS secondary_title TEXT,
ADD COLUMN IF NOT EXISTS secondary_first_name TEXT,
ADD COLUMN IF NOT EXISTS secondary_last_name TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS current_postcode TEXT,
ADD COLUMN IF NOT EXISTS reference TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS comment TEXT,
ADD COLUMN IF NOT EXISTS allow_view_account BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority_exchange BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expected_completion_date DATE,
ADD COLUMN IF NOT EXISTS next_action_date DATE,
ADD COLUMN IF NOT EXISTS branch_id UUID,
ADD COLUMN IF NOT EXISTS branch_name TEXT,
ADD COLUMN IF NOT EXISTS branch_user_id UUID,
ADD COLUMN IF NOT EXISTS branch_user_name TEXT,
ADD COLUMN IF NOT EXISTS abort_requested BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS abort_reason TEXT,
ADD COLUMN IF NOT EXISTS abort_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS abort_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email TEXT;

-- ================================================
-- 3. Case Status History Table
-- ================================================
CREATE TABLE IF NOT EXISTS case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_status_history_case ON case_status_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_status_history_enquiry ON case_status_history(enquiry_id);

-- ================================================
-- 4. Case Notes Table
-- ================================================
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  note_type TEXT DEFAULT 'internal',
  content TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_recipient TEXT,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case ON case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_enquiry ON case_notes(enquiry_id);

-- ================================================
-- 5. Case Contacts Table
-- ================================================
CREATE TABLE IF NOT EXISTS case_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  business_type TEXT,
  company TEXT,
  contact_person TEXT,
  phone TEXT,
  mobile TEXT,
  fax TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_contacts_case ON case_contacts(case_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_enquiry ON case_contacts(enquiry_id);

-- ================================================
-- 6. Case Correspondence Details Table
-- ================================================
CREATE TABLE IF NOT EXISTS case_correspondence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  organisation TEXT,
  flat_building_no TEXT,
  building_name TEXT,
  street_no TEXT,
  street TEXT,
  locality TEXT,
  post_town TEXT,
  postcode TEXT,
  county TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  sms_opt_in BOOLEAN DEFAULT FALSE,
  joint_organisation TEXT,
  joint_flat_building_no TEXT,
  joint_building_name TEXT,
  joint_street_no TEXT,
  joint_street TEXT,
  joint_locality TEXT,
  joint_post_town TEXT,
  joint_postcode TEXT,
  joint_county TEXT,
  joint_email TEXT,
  joint_phone TEXT,
  joint_mobile TEXT,
  joint_same_as_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id),
  UNIQUE(enquiry_id)
);

-- ================================================
-- 7. Case Property Transaction Details Table
-- ================================================
CREATE TABLE IF NOT EXISTS case_property_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  transaction_type TEXT,
  organisation TEXT,
  property_name TEXT,
  property_number TEXT,
  street_no TEXT,
  street TEXT,
  district TEXT,
  town TEXT,
  county TEXT,
  postcode TEXT,
  amount DECIMAL(12,2),
  tenure TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id),
  UNIQUE(enquiry_id)
);

-- ================================================
-- 8. Case Lender Details Table
-- ================================================
CREATE TABLE IF NOT EXISTS case_lender_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  lender TEXT,
  building_name TEXT,
  property_details TEXT,
  postcode TEXT,
  street TEXT,
  locality TEXT,
  town TEXT,
  county TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  reference_number TEXT,
  account_number TEXT,
  contact_person TEXT,
  amount DECIMAL(12,2),
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id),
  UNIQUE(enquiry_id)
);

-- ================================================
-- 9. Case Other Party Details Table
-- ================================================
CREATE TABLE IF NOT EXISTS case_other_party (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  party_company TEXT,
  party_is_company BOOLEAN DEFAULT FALSE,
  party_title TEXT,
  party_first_name TEXT,
  party_last_name TEXT,
  party_building_name TEXT,
  party_property_details TEXT,
  party_postcode TEXT,
  party_street TEXT,
  party_district TEXT,
  party_town TEXT,
  party_county TEXT,
  party_email TEXT,
  party_phone TEXT,
  party_mobile TEXT,
  solicitor_name TEXT,
  solicitor_building_name TEXT,
  solicitor_property_details TEXT,
  solicitor_postcode TEXT,
  solicitor_street TEXT,
  solicitor_district TEXT,
  solicitor_town TEXT,
  solicitor_county TEXT,
  solicitor_email TEXT,
  solicitor_phone TEXT,
  solicitor_mobile TEXT,
  solicitor_dx_number TEXT,
  solicitor_reference TEXT,
  solicitor_account_number TEXT,
  solicitor_contact_person TEXT,
  solicitor_assistant TEXT,
  solicitor_additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id),
  UNIQUE(enquiry_id)
);

-- ================================================
-- 10. Branches Table (for branch assignment)
-- ================================================
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  firm_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some example branches
INSERT INTO branches (name, code) VALUES 
  ('Head Office', 'HO'),
  ('NPS Solihull', 'NPS-SOL'),
  ('NPS Birmingham', 'NPS-BHM'),
  ('NPS London', 'NPS-LDN')
ON CONFLICT DO NOTHING;

-- ================================================
-- 11. Branch Users Table
-- ================================================
CREATE TABLE IF NOT EXISTS branch_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed some example branch users
INSERT INTO branch_users (branch_id, name, email)
SELECT b.id, 'Lindsay Gregory', 'lindsay@example.com'
FROM branches b WHERE b.name = 'NPS Solihull'
ON CONFLICT DO NOTHING;

INSERT INTO branch_users (branch_id, name, email)
SELECT b.id, 'Claire Smith', 'claire@example.com'
FROM branches b WHERE b.name = 'NPS Solihull'
ON CONFLICT DO NOTHING;

INSERT INTO branch_users (branch_id, name, email)
SELECT b.id, 'Lisa Jones', 'lisa@example.com'
FROM branches b WHERE b.name = 'Head Office'
ON CONFLICT DO NOTHING;

-- ================================================
-- 12. Update Activity Log to support case management
-- ================================================
ALTER TABLE public.activity_log
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- ================================================
-- 13. Enable RLS on new tables (with permissive policies for admin access)
-- ================================================
ALTER TABLE case_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_correspondence ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_property_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_lender_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_other_party ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_users ENABLE ROW LEVEL SECURITY;

-- Permissive policies for all tables (admin uses service role)
CREATE POLICY "Allow all case_status_history" ON case_status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all case_notes" ON case_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all case_contacts" ON case_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all case_correspondence" ON case_correspondence FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all case_property_transaction" ON case_property_transaction FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all case_lender_details" ON case_lender_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all case_other_party" ON case_other_party FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all branches" ON branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all branch_users" ON branch_users FOR ALL USING (true) WITH CHECK (true);
