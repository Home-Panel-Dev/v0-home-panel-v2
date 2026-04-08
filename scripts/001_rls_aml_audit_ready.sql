-- ============================================================================
-- HomePanel v2 - RLS, AML Schema, Activity Metadata, SOC2 Audit-Ready
-- ============================================================================
-- Run this migration in Supabase SQL Editor
-- This script is idempotent - safe to run multiple times
-- ============================================================================

-- ============================================================================
-- PART 1: User Roles and Profiles Enhancement
-- ============================================================================

-- Create roles enum type if not exists
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin', 
    'operations',
    'compliance',
    'firm_admin',
    'firm_user',
    'reviewer',
    'client'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add role column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firm_id UUID REFERENCES firms(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- PART 2: Activity Log Enhancement with Metadata
-- ============================================================================

-- Add metadata column to activity_log
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS case_id UUID;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create index for faster metadata queries
CREATE INDEX IF NOT EXISTS idx_activity_log_metadata ON activity_log USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log (action);
CREATE INDEX IF NOT EXISTS idx_activity_log_actor ON activity_log (actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_enquiry ON activity_log (enquiry_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_case ON activity_log (case_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log (created_at DESC);

-- ============================================================================
-- PART 3: AML Reviews Table (Armalytix-Ready)
-- ============================================================================

-- Create AML status enum
DO $$ BEGIN
  CREATE TYPE aml_status AS ENUM (
    'not_started',
    'pending',
    'in_review', 
    'approved',
    'flagged',
    'failed',
    'manual_review_required'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create risk level enum
DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM (
    'low',
    'medium',
    'high',
    'very_high'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create AML reviews table
CREATE TABLE IF NOT EXISTS aml_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  
  -- Overall status
  status TEXT DEFAULT 'not_started',
  risk_level TEXT DEFAULT 'low',
  
  -- Individual check statuses
  source_of_funds_status TEXT DEFAULT 'not_started',
  id_verification_status TEXT DEFAULT 'not_started',
  pep_sanctions_status TEXT DEFAULT 'not_started',
  address_verification_status TEXT DEFAULT 'not_started',
  
  -- Provider information (abstracted for any AML provider)
  provider TEXT, -- 'armalytix', 'yoti', 'onfido', etc.
  provider_reference TEXT,
  provider_payload JSONB DEFAULT '{}',
  
  -- Review tracking
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Risk assessment
  risk_factors JSONB DEFAULT '[]',
  risk_score INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Ensure at least one relationship
  CONSTRAINT aml_reviews_has_parent CHECK (enquiry_id IS NOT NULL OR case_id IS NOT NULL)
);

-- Indexes for AML reviews
CREATE INDEX IF NOT EXISTS idx_aml_reviews_enquiry ON aml_reviews (enquiry_id);
CREATE INDEX IF NOT EXISTS idx_aml_reviews_case ON aml_reviews (case_id);
CREATE INDEX IF NOT EXISTS idx_aml_reviews_status ON aml_reviews (status);
CREATE INDEX IF NOT EXISTS idx_aml_reviews_provider ON aml_reviews (provider);
CREATE INDEX IF NOT EXISTS idx_aml_reviews_risk ON aml_reviews (risk_level);

-- ============================================================================
-- PART 4: Audit Log Table (SOC2 Ready)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor information
  actor_id UUID,
  actor_type TEXT NOT NULL, -- 'user', 'system', 'api', 'webhook'
  actor_email TEXT,
  actor_role TEXT,
  
  -- Action details
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'enquiry', 'case', 'document', 'user', etc.
  resource_id UUID,
  
  -- Change tracking
  previous_state JSONB,
  new_state JSONB,
  changes JSONB, -- Diff of what changed
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  session_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Immutability - no updates or deletes allowed via RLS
  is_immutable BOOLEAN DEFAULT true
);

-- Indexes for audit log (optimized for SOC2 queries)
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log (actor_id, actor_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_metadata ON audit_log USING GIN (metadata);

-- ============================================================================
-- PART 5: Row Level Security Policies
-- ============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE aml_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for clean slate)
DROP POLICY IF EXISTS enquiries_admin_all ON enquiries;
DROP POLICY IF EXISTS enquiries_firm_read ON enquiries;
DROP POLICY IF EXISTS enquiries_service_role ON enquiries;

DROP POLICY IF EXISTS cases_admin_all ON cases;
DROP POLICY IF EXISTS cases_firm_read ON cases;
DROP POLICY IF EXISTS cases_service_role ON cases;

DROP POLICY IF EXISTS documents_admin_all ON documents;
DROP POLICY IF EXISTS documents_firm_read ON documents;
DROP POLICY IF EXISTS documents_service_role ON documents;

DROP POLICY IF EXISTS activity_log_admin_read ON activity_log;
DROP POLICY IF EXISTS activity_log_service_role ON activity_log;

DROP POLICY IF EXISTS aml_reviews_compliance_all ON aml_reviews;
DROP POLICY IF EXISTS aml_reviews_admin_read ON aml_reviews;
DROP POLICY IF EXISTS aml_reviews_service_role ON aml_reviews;

DROP POLICY IF EXISTS audit_log_admin_read ON audit_log;
DROP POLICY IF EXISTS audit_log_service_role_insert ON audit_log;

DROP POLICY IF EXISTS firms_admin_all ON firms;
DROP POLICY IF EXISTS firms_firm_admin_read ON firms;
DROP POLICY IF EXISTS firms_public_read ON firms;

DROP POLICY IF EXISTS profiles_admin_all ON profiles;
DROP POLICY IF EXISTS profiles_own_read ON profiles;
DROP POLICY IF EXISTS profiles_service_role ON profiles;

-- ============================================================================
-- ENQUIRIES POLICIES
-- ============================================================================

-- Service role has full access (for API routes)
CREATE POLICY enquiries_service_role ON enquiries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins and operations can see all enquiries
CREATE POLICY enquiries_admin_all ON enquiries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin', 'operations', 'compliance')
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin')
      AND profiles.is_active = true
    )
  );

-- Firm users can only see enquiries assigned to their firm
CREATE POLICY enquiries_firm_read ON enquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('firm_admin', 'firm_user')
      AND profiles.firm_id = enquiries.firm_id
      AND profiles.is_active = true
    )
  );

-- ============================================================================
-- CASES POLICIES
-- ============================================================================

CREATE POLICY cases_service_role ON cases
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY cases_admin_all ON cases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin', 'operations', 'compliance')
      AND profiles.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin', 'operations')
      AND profiles.is_active = true
    )
  );

CREATE POLICY cases_firm_read ON cases
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('firm_admin', 'firm_user')
      AND profiles.firm_id = cases.firm_id
      AND profiles.is_active = true
    )
  );

-- ============================================================================
-- DOCUMENTS POLICIES
-- ============================================================================

CREATE POLICY documents_service_role ON documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY documents_admin_all ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin', 'operations', 'compliance', 'reviewer')
      AND profiles.is_active = true
    )
  );

CREATE POLICY documents_firm_read ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN enquiries e ON e.firm_id = p.firm_id
      WHERE p.id = auth.uid() 
      AND p.role IN ('firm_admin', 'firm_user')
      AND (documents.enquiry_id = e.id OR documents.case_id IN (
        SELECT c.id FROM cases c WHERE c.firm_id = p.firm_id
      ))
      AND p.is_active = true
    )
  );

-- ============================================================================
-- ACTIVITY LOG POLICIES
-- ============================================================================

CREATE POLICY activity_log_service_role ON activity_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY activity_log_admin_read ON activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin', 'operations', 'compliance')
      AND profiles.is_active = true
    )
  );

-- ============================================================================
-- AML REVIEWS POLICIES
-- ============================================================================

CREATE POLICY aml_reviews_service_role ON aml_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY aml_reviews_compliance_all ON aml_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin', 'compliance')
      AND profiles.is_active = true
    )
  );

CREATE POLICY aml_reviews_admin_read ON aml_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('operations', 'reviewer')
      AND profiles.is_active = true
    )
  );

-- ============================================================================
-- AUDIT LOG POLICIES (Immutable - Insert Only)
-- ============================================================================

CREATE POLICY audit_log_service_role_insert ON audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY audit_log_admin_read ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin', 'compliance')
      AND profiles.is_active = true
    )
  );

-- ============================================================================
-- FIRMS POLICIES
-- ============================================================================

CREATE POLICY firms_admin_all ON firms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('super_admin', 'admin')
      AND profiles.is_active = true
    )
  );

CREATE POLICY firms_firm_admin_read ON firms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('firm_admin', 'firm_user')
      AND profiles.firm_id = firms.id
      AND profiles.is_active = true
    )
  );

-- Public read for active firms (for firm selection dropdowns)
CREATE POLICY firms_public_read ON firms
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

CREATE POLICY profiles_service_role ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY profiles_admin_all ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('super_admin', 'admin')
      AND p.is_active = true
    )
  );

-- Users can read their own profile
CREATE POLICY profiles_own_read ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ============================================================================
-- PART 6: Helper Functions
-- ============================================================================

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION has_role(required_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(required_roles)
    AND is_active = true
  );
$$;

-- Function to log audit entry (called from application)
CREATE OR REPLACE FUNCTION log_audit(
  p_actor_id UUID,
  p_actor_type TEXT,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_previous_state JSONB DEFAULT NULL,
  p_new_state JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_audit_id UUID;
  v_actor_email TEXT;
  v_actor_role TEXT;
BEGIN
  -- Get actor details
  SELECT email, role INTO v_actor_email, v_actor_role
  FROM profiles WHERE id = p_actor_id;

  -- Insert audit record
  INSERT INTO audit_log (
    actor_id, actor_type, actor_email, actor_role,
    action, resource_type, resource_id,
    previous_state, new_state, metadata
  ) VALUES (
    p_actor_id, p_actor_type, v_actor_email, v_actor_role,
    p_action, p_resource_type, p_resource_id,
    p_previous_state, p_new_state, p_metadata
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- ============================================================================
-- PART 7: Updated Timestamp Triggers
-- ============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to aml_reviews
DROP TRIGGER IF EXISTS aml_reviews_updated_at ON aml_reviews;
CREATE TRIGGER aml_reviews_updated_at
  BEFORE UPDATE ON aml_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Apply to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant service_role full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant authenticated users select on necessary tables
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON firms TO authenticated;
