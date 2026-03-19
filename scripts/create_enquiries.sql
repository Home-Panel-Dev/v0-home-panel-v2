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
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'accepted', 'declined', 'converted')),
  case_id UUID REFERENCES public.cases(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all enquiries
CREATE POLICY enquiries_admin_select ON public.enquiries 
  FOR SELECT USING (true);

-- Allow admins to update enquiries
CREATE POLICY enquiries_admin_update ON public.enquiries 
  FOR UPDATE USING (true);

-- Allow inserts from API (service role)
CREATE POLICY enquiries_insert ON public.enquiries 
  FOR INSERT WITH CHECK (true);
