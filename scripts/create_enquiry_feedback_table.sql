-- Create enquiry_feedback table to store decline reasons
CREATE TABLE IF NOT EXISTS enquiry_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  reasons TEXT[] DEFAULT '{}',
  other_reason TEXT,
  quote_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_enquiry_feedback_email ON enquiry_feedback(email);

-- Add index for created_at for reporting
CREATE INDEX IF NOT EXISTS idx_enquiry_feedback_created_at ON enquiry_feedback(created_at);
