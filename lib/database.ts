import { createClient } from "@supabase/supabase-js"

// Create admin client with service role key for server-side operations
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Activity action types
export type ActivityAction =
  | "enquiry_submitted"
  | "onboarding_invited"
  | "onboarding_step_completed"
  | "onboarding_completed"
  | "document_uploaded"
  | "document_reviewed"
  | "case_created"
  | "case_status_changed"
  | "firm_assigned"
  | "note_added"
  | "email_sent"

// Log activity - simplified to only use columns that exist in the table
export async function logActivity({
  enquiryId,
  actorType,
  actorId,
  action,
  description,
}: {
  enquiryId?: string
  caseId?: string // kept for API compatibility but not used
  actorType: "system" | "admin" | "client"
  actorId?: string
  action: ActivityAction
  description?: string
  metadata?: Record<string, unknown> // kept for API compatibility but not used
}) {
  try {
    const adminClient = createAdminClient()
    
    // Only insert columns that exist in the activity_log table
    // Based on errors, the table only has: enquiry_id, actor_type, actor_id, action, description
    const { error } = await adminClient.from("activity_log").insert({
      enquiry_id: enquiryId,
      actor_type: actorType,
      actor_id: actorId,
      action,
      description,
    })

    if (error) {
      // Log but don't throw - activity logging should never break the main flow
      console.error("[v0] Activity log insert failed:", error.message)
    }
  } catch (err) {
    // Catch any unexpected errors
    console.error("[v0] Activity logging error:", err)
  }
}

// Generate case reference
export async function generateCaseReference(): Promise<string> {
  const adminClient = createAdminClient()
  
  // Try using the database function first
  const { data, error } = await adminClient.rpc("generate_case_reference")
  
  if (!error && data) {
    return data
  }
  
  // Fallback: generate in code
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `HP-${year}-${random}`
}

// Status helpers
export const ENQUIRY_STATUSES = [
  "new",
  "under_review",
  "accepted",
  "onboarding_invited",
  "onboarding",
  "onboarding_complete",
  "converted",
  "rejected",
] as const

export const CASE_STATUSES = [
  "pending_onboarding",
  "onboarding_complete",
  "ready_for_review",
  "id_verification",
  "source_of_funds",
  "documents_pending",
  "ready_to_instruct",
  "with_firm",
  "in_progress",
  "awaiting_exchange",
  "completed",
  "cancelled",
] as const

export const ONBOARDING_STATUSES = [
  "not_started",
  "in_progress",
  "pending_review",
  "completed",
  "failed",
] as const

export const COMPLIANCE_STATUSES = [
  "not_started",
  "invited",
  "pending",
  "completed",
  "failed",
  "under_review",
  "approved",
  "rejected",
] as const

export const DOCUMENT_TYPES = [
  "passport",
  "driving_licence",
  "proof_of_address",
  "bank_statement",
  "payslip",
  "source_of_funds_evidence",
  "other",
] as const

export const DOCUMENT_REVIEW_STATUSES = [
  "pending_review",
  "approved",
  "rejected",
  "replacement_requested",
] as const

// Internal decision statuses
export const INTERNAL_STATUSES = [
  "awaiting_client",
  "awaiting_reports",
  "pending_internal_review",
  "approved_to_proceed",
  "escalated",
  "rejected",
] as const

// Matter readiness
export const MATTER_READINESS = [
  "not_ready",
  "pending_compliance",
  "pending_documents",
  "ready_for_review",
  "approved",
  "blocked",
  "manual_review_required",
] as const

// Compliance check types
export const CHECK_TYPES = {
  IDENTITY: "identity_verification",
  SOURCE_OF_FUNDS: "source_of_funds",
} as const

// Provider names
export const PROVIDERS = {
  YOTI: "yoti",
  ARMALYTIX: "armalytix",
} as const

// Document types for compliance
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: "Passport",
  driving_licence: "Driving Licence",
  proof_of_address: "Proof of Address",
  bank_statement: "Bank Statement",
  payslip: "Payslip",
  source_of_funds_evidence: "Source of Funds Evidence",
  gifted_deposit_letter: "Gifted Deposit Letter",
  other: "Other Document",
}

// Compliance summary type
export interface ComplianceSummary {
  identity: {
    status: string
    provider?: string
    completedAt?: string
    reviewStatus?: string
  }
  sourceOfFunds: {
    status: string
    provider?: string
    completedAt?: string
    reviewStatus?: string
  }
  documents: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  overallReadiness: string
}

// Calculate overall compliance status
export function calculateComplianceReadiness(
  identityStatus: string,
  sofStatus: string,
  documentsApproved: number,
  documentsTotal: number
): string {
  const identityPassed = identityStatus === "approved"
  const sofPassed = sofStatus === "approved"
  const documentsComplete = documentsApproved === documentsTotal && documentsTotal > 0
  
  if (identityPassed && sofPassed && documentsComplete) {
    return "approved"
  }
  
  if (identityStatus === "rejected" || sofStatus === "rejected") {
    return "blocked"
  }
  
  if (identityStatus === "manual_review_required" || sofStatus === "manual_review_required") {
    return "manual_review_required"
  }
  
  return "pending_compliance"
}

// Status display helpers
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    // Enquiry statuses
    new: "New",
    under_review: "Reviewing",
    accepted: "Accepted",
    onboarding_invited: "Invited",
    onboarding: "Onboarding",
    onboarding_complete: "Onboarding Complete",
    converted: "Converted",
    rejected: "Declined",
    
    // Case statuses
    pending_onboarding: "Pending Onboarding",
    ready_for_review: "Ready for Review",
    id_verification: "ID Verification",
    source_of_funds: "Source of Funds",
    documents_pending: "Documents Pending",
    ready_to_instruct: "Ready to Instruct",
    with_firm: "With Firm",
    in_progress: "In Progress",
    awaiting_exchange: "Awaiting Exchange",
    completed: "Completed",
    cancelled: "Cancelled",
    
    // Onboarding/Compliance statuses
    not_started: "Not Started",
    invited: "Invited",
    pending: "Pending",
    failed: "Failed",
    approved: "Approved",
    pending_review: "Pending Review",
    replacement_requested: "Replacement Requested",
  }
  
  return labels[status] || status
}

export function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    // Success states
    completed: "bg-accent/10 text-accent",
    approved: "bg-accent/10 text-accent",
    onboarding_complete: "bg-accent/10 text-accent",
    converted: "bg-accent/10 text-accent",
    
    // Warning/in-progress states
    new: "bg-blue-50 text-blue-700",
    under_review: "bg-amber-50 text-amber-700",
    onboarding: "bg-purple-50 text-purple-700",
    onboarding_invited: "bg-purple-50 text-purple-700",
    in_progress: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    pending_review: "bg-amber-50 text-amber-700",
    invited: "bg-purple-50 text-purple-700",
    
    // Neutral states
    not_started: "bg-muted text-muted-foreground",
    cancelled: "bg-muted text-muted-foreground",
    
    // Error states
    rejected: "bg-red-50 text-red-700",
    failed: "bg-red-50 text-red-700",
    replacement_requested: "bg-red-50 text-red-700",
  }
  
  return styles[status] || "bg-muted text-muted-foreground"
}
