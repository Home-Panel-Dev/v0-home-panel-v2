-- Case Status History
CREATE TABLE IF NOT EXISTS case_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Notes
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'internal',
  content TEXT NOT NULL,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Contacts
CREATE TABLE IF NOT EXISTS case_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  business_type TEXT,
  company TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  fax TEXT,
  mobile TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Correspondence (primary/joint client addresses)
CREATE TABLE IF NOT EXISTS case_correspondence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  address_type TEXT DEFAULT 'primary',
  organisation TEXT,
  flat_plot_building_no TEXT,
  development_building_name TEXT,
  street_no TEXT,
  street TEXT,
  locality TEXT,
  post_town TEXT,
  postcode TEXT,
  county TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  sms_enabled BOOLEAN DEFAULT FALSE,
  same_as_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Property Transaction
CREATE TABLE IF NOT EXISTS case_property_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  transaction_type TEXT,
  property_details TEXT,
  property_number TEXT,
  postcode TEXT,
  street_no TEXT,
  street TEXT,
  district TEXT,
  town TEXT,
  county TEXT,
  amount DECIMAL(12,2),
  holding_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Lender Details
CREATE TABLE IF NOT EXISTS case_lender_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
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
  password TEXT,
  contact_person TEXT,
  amount DECIMAL(12,2),
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Other Party
CREATE TABLE IF NOT EXISTS case_other_party (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  party_type TEXT DEFAULT 'other_party',
  company TEXT,
  is_company BOOLEAN DEFAULT FALSE,
  title TEXT,
  first_name TEXT,
  last_name TEXT,
  building_name TEXT,
  property_details TEXT,
  postcode TEXT,
  street TEXT,
  district TEXT,
  town TEXT,
  county TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  dx_number TEXT,
  reference_number TEXT,
  account_number TEXT,
  password TEXT,
  contact_person TEXT,
  assistant TEXT,
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branch Users
CREATE TABLE IF NOT EXISTS branch_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns to enquiries if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'priority_exchange') THEN
    ALTER TABLE enquiries ADD COLUMN priority_exchange BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'secondary_client_title') THEN
    ALTER TABLE enquiries ADD COLUMN secondary_client_title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'secondary_client_first_name') THEN
    ALTER TABLE enquiries ADD COLUMN secondary_client_first_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'secondary_client_last_name') THEN
    ALTER TABLE enquiries ADD COLUMN secondary_client_last_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'other_info') THEN
    ALTER TABLE enquiries ADD COLUMN other_info TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'description') THEN
    ALTER TABLE enquiries ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'allow_view_account') THEN
    ALTER TABLE enquiries ADD COLUMN allow_view_account BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'expected_completion_date') THEN
    ALTER TABLE enquiries ADD COLUMN expected_completion_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'next_action_date') THEN
    ALTER TABLE enquiries ADD COLUMN next_action_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'branch_id') THEN
    ALTER TABLE enquiries ADD COLUMN branch_id UUID REFERENCES branches(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'branch_user_id') THEN
    ALTER TABLE enquiries ADD COLUMN branch_user_id UUID REFERENCES branch_users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'abort_requested') THEN
    ALTER TABLE enquiries ADD COLUMN abort_requested BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'abort_reason') THEN
    ALTER TABLE enquiries ADD COLUMN abort_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enquiries' AND column_name = 'abort_confirmed') THEN
    ALTER TABLE enquiries ADD COLUMN abort_confirmed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add same columns to cases table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'priority_exchange') THEN
    ALTER TABLE cases ADD COLUMN priority_exchange BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'secondary_client_title') THEN
    ALTER TABLE cases ADD COLUMN secondary_client_title TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'secondary_client_first_name') THEN
    ALTER TABLE cases ADD COLUMN secondary_client_first_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'secondary_client_last_name') THEN
    ALTER TABLE cases ADD COLUMN secondary_client_last_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'other_info') THEN
    ALTER TABLE cases ADD COLUMN other_info TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'description') THEN
    ALTER TABLE cases ADD COLUMN description TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'allow_view_account') THEN
    ALTER TABLE cases ADD COLUMN allow_view_account BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'expected_completion_date') THEN
    ALTER TABLE cases ADD COLUMN expected_completion_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'next_action_date') THEN
    ALTER TABLE cases ADD COLUMN next_action_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'branch_id') THEN
    ALTER TABLE cases ADD COLUMN branch_id UUID REFERENCES branches(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'branch_user_id') THEN
    ALTER TABLE cases ADD COLUMN branch_user_id UUID REFERENCES branch_users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'abort_requested') THEN
    ALTER TABLE cases ADD COLUMN abort_requested BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'abort_reason') THEN
    ALTER TABLE cases ADD COLUMN abort_reason TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cases' AND column_name = 'abort_confirmed') THEN
    ALTER TABLE cases ADD COLUMN abort_confirmed BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
