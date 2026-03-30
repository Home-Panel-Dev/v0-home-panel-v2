-- Case Management Schema Extension
-- Adds tables for comprehensive case management

-- Case Status History Table
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

-- Case Notes Table
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  note_type TEXT DEFAULT 'internal',
  content TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Contacts Table
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

-- Case Correspondence Details Table
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Property Transaction Details Table
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Lender Details Table
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Other Party Details Table
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Branch Assignment Table
CREATE TABLE IF NOT EXISTS case_branch_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  enquiry_id UUID,
  branch_id UUID,
  branch_name TEXT,
  branch_user_id UUID,
  branch_user_name TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID
);
