-- HomePanel Database Setup - All Tables
-- Run this script to create all required tables

-- 1. Profiles table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enquiries table (stores quote requests from intake form)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  property_address TEXT,
  property_postcode TEXT,
  property_price NUMERIC,
  transaction_type TEXT,
  is_leasehold BOOLEAN DEFAULT FALSE,
  referral_source TEXT,
  quote_total NUMERIC,
  quote_legal_fees NUMERIC,
  quote_disbursements NUMERIC,
  quote_vat NUMERIC,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
DROP POLICY IF EXISTS "Service role full access to profiles" ON public.profiles;
CREATE POLICY "Service role full access to profiles" ON public.profiles
  FOR ALL USING (true);

-- Enquiries: Anyone can insert (public form), admins can read all
DROP POLICY IF EXISTS "Anyone can create enquiry" ON public.enquiries;
CREATE POLICY "Anyone can create enquiry" ON public.enquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can view enquiries" ON public.enquiries;
CREATE POLICY "Authenticated can view enquiries" ON public.enquiries
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can update enquiries" ON public.enquiries;
CREATE POLICY "Authenticated can update enquiries" ON public.enquiries
  FOR UPDATE USING (auth.role() = 'authenticated');
