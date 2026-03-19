-- Create enquiries table to store quote requests
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction details
  transaction_type TEXT NOT NULL,
  property_address TEXT,
  postcode TEXT,
  tenure TEXT,
  property_value INTEGER,
  
  -- Property details
  owner_count TEXT,
  first_time_buyer BOOLEAN DEFAULT false,
  property_count TEXT,
  new_build BOOLEAN DEFAULT false,
  mortgage BOOLEAN DEFAULT false,
  company_purchase BOOLEAN DEFAULT false,
  gift_funds BOOLEAN DEFAULT false,
  bank_funds_only BOOLEAN DEFAULT false,
  
  -- Contact details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Quote details
  quote_amount INTEGER,
  legal_fees INTEGER,
  disbursements INTEGER,
  
  -- Status tracking
  status TEXT DEFAULT 'new',
  case_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for now to allow all operations
ALTER TABLE public.enquiries DISABLE ROW LEVEL SECURITY;
