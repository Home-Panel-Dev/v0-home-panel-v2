"use client"

import { useRouter } from "next/navigation"
import { ComplianceReviewPanel } from "./compliance-review-panel"

interface ComplianceCheck {
  id: string
  check_type: string
  provider: string
  status: string
  completed_at?: string
  summary_json?: Record<string, unknown>
  exception_flags?: string[]
  review_decision?: string
  review_notes?: string
  reviewed_at?: string
}

interface Document {
  id: string
  name: string
  file_url: string
  document_type: string
  review_status: string
  review_notes?: string
  created_at: string
}

interface EnquiryComplianceSectionProps {
  enquiryId: string
  complianceChecks: ComplianceCheck[]
  documents: Document[]
  internalStatus: string
}

export function EnquiryComplianceSection({
  enquiryId,
  complianceChecks,
  documents,
  internalStatus
}: EnquiryComplianceSectionProps) {
  const router = useRouter()

  const handleStatusUpdate = () => {
    router.refresh()
  }

  return (
    <ComplianceReviewPanel
      enquiryId={enquiryId}
      complianceChecks={complianceChecks}
      documents={documents}
      internalStatus={internalStatus}
      onStatusUpdate={handleStatusUpdate}
    />
  )
}
