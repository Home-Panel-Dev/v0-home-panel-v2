-- Case Management Schema Extension
-- Adds tables for comprehensive case management: notes, status history, contacts, correspondence, lender details, other party details

-- Case Status History Table
CREATE TABLE IF NOT EXISTS case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Notes Table
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'internal', -- internal, to_client, to_solicitor, to_agent
  content TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Contacts Table (estate agents, mortgage brokers, etc.)
CREATE TABLE IF NOT EXISTS case_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  business_type TEXT, -- estate_agent, mortgage_broker, lender, management_company, other
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

-- Case Correspondence Details Table
CREATE TABLE IF NOT EXISTS case_correspondence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  -- Primary Client Correspondence
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
  -- Joint Client Details
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Property Transaction Details Table
CREATE TABLE IF NOT EXISTS case_property_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  transaction_type TEXT, -- sale, purchase, remortgage
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
  tenure TEXT, -- freehold, leasehold
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Lender Details Table
CREATE TABLE IF NOT EXISTS case_lender_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Other Party Details Table
CREATE TABLE IF NOT EXISTS case_other_party (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  -- Other Party
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
  -- Their Solicitor
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Branch Assignment Table
CREATE TABLE IF NOT EXISTS case_branch_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES firms(id),
  branch_user_id UUID REFERENCES auth.users(id),
  branch_user_name TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id)
);

-- Add new columns to enquiries table for extended case management
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS secondary_client_title TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS secondary_client_first_name TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS secondary_client_last_name TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS current_postcode TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS reference_number TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS allow_view_account BOOLEAN DEFAULT FALSE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS expected_completion_date DATE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS next_action_date DATE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS abort_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS abort_reason TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS abort_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS abort_requested_at TIMESTAMPTZ;

-- Add similar columns to cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS secondary_client_title TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS secondary_client_first_name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS secondary_client_last_name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS current_postcode TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS reference_number TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS allow_view_account BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS expected_completion_date DATE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS next_action_date DATE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS abort_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS abort_reason TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS abort_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS abort_requested_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_status_history_case_id ON case_status_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_status_history_enquiry_id ON case_status_history(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_case_id ON case_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_notes_enquiry_id ON case_notes(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_case_id ON case_contacts(case_id);
CREATE INDEX IF NOT EXISTS idx_case_contacts_enquiry_id ON case_contacts(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_case_correspondence_case_id ON case_correspondence(case_id);
CREATE INDEX IF NOT EXISTS idx_case_correspondence_enquiry_id ON case_correspondence(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_case_property_transaction_case_id ON case_property_transaction(case_id);
CREATE INDEX IF NOT EXISTS idx_case_property_transaction_enquiry_id ON case_property_transaction(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_case_lender_details_case_id ON case_lender_details(case_id);
CREATE INDEX IF NOT EXISTS idx_case_lender_details_enquiry_id ON case_lender_details(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_case_other_party_case_id ON case_other_party(case_id);
CREATE INDEX IF NOT EXISTS idx_case_other_party_enquiry_id ON case_other_party(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_case_branch_assignment_case_id ON case_branch_assignment(case_id);
CREATE INDEX IF NOT EXISTS idx_case_branch_assignment_enquiry_id ON case_branch_assignment(enquiry_id);
