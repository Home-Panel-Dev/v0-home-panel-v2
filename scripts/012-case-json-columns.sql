-- Add JSON columns to enquiries for case management data fallback
-- These columns store case management data when dedicated tables don't exist

-- Enquiries table JSON columns
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS correspondence_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS property_transaction_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS lender_details_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS other_party_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS contacts_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS notes_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS status_history_data JSONB DEFAULT '[]'::jsonb;

-- Branch assignment columns
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS branch_id UUID;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS branch_user_id UUID;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS branch_name TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS branch_user_name TEXT;

-- Dates for case management
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS expected_completion_date DATE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS next_action_date DATE;

-- Abort columns
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS abort_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS abort_reason TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS abort_requested_at TIMESTAMPTZ;

-- Cases table JSON columns
ALTER TABLE cases ADD COLUMN IF NOT EXISTS correspondence_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS property_transaction_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS lender_details_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS other_party_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS contacts_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS notes_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS status_history_data JSONB DEFAULT '[]'::jsonb;

-- Branch assignment columns for cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS branch_id UUID;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS branch_user_id UUID;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS branch_name TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS branch_user_name TEXT;

-- Dates for case management
ALTER TABLE cases ADD COLUMN IF NOT EXISTS expected_completion_date DATE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS next_action_date DATE;

-- Abort columns for cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS abort_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS abort_reason TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS abort_requested_at TIMESTAMPTZ;
