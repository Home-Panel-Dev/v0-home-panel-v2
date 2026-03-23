"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react"

interface Document {
  id: string
  file_name: string
  file_url: string
  document_type: string
  review_status: string
  review_notes?: string
  created_at: string
  mime_type?: string
  file_size?: number
}

interface DocumentReviewPanelProps {
  enquiryId?: string
  caseId?: string
  documents: Document[]
  onStatusUpdate?: () => void
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  passport: "Passport",
  driving_licence: "Driving Licence",
  proof_of_address: "Proof of Address",
  bank_statement: "Bank Statement",
  payslip: "Payslip",
  source_of_funds_evidence: "Source of Funds Evidence",
  gifted_deposit_letter: "Gifted Deposit Letter",
  other: "Other Document",
}

const REVIEW_STATUS_CONFIG = {
  pending_review: { label: "Pending Review", icon: Clock, className: "text-amber-700 bg-amber-50" },
  approved: { label: "Approved", icon: CheckCircle2, className: "text-accent bg-accent/10" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-red-700 bg-red-50" },
  replacement_requested: { label: "Replacement Requested", icon: RefreshCw, className: "text-amber-700 bg-amber-50" },
}

export function DocumentReviewPanel({
  enquiryId,
  caseId,
  documents,
  onStatusUpdate
}: DocumentReviewPanelProps) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  const handleReviewDecision = async (docId: string, decision: string) => {
    setSubmitting(docId)
    try {
      const res = await fetch("/api/admin/documents/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          decision,
          notes: reviewNotes[docId] || "",
        }),
      })
      if (!res.ok) throw new Error("Failed to submit review")
      setReviewNotes(prev => ({ ...prev, [docId]: "" }))
      onStatusUpdate?.()
    } catch (err) {
      console.error("Document review error:", err)
    } finally {
      setSubmitting(null)
    }
  }

  const renderStatusBadge = (status: string) => {
    const cfg = REVIEW_STATUS_CONFIG[status as keyof typeof REVIEW_STATUS_CONFIG] || REVIEW_STATUS_CONFIG.pending_review
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>
        <Icon className="h-3.5 w-3.5" />
        {cfg.label}
      </span>
    )
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (documents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Documents</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No documents uploaded yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Documents</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-accent">{documents.filter(d => d.review_status === "approved").length} approved</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-amber-600">{documents.filter(d => d.review_status === "pending_review").length} pending</span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {documents.map((doc) => (
          <div key={doc.id} className="p-5">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}
                    {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {renderStatusBadge(doc.review_status)}
                {expandedDoc === doc.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedDoc === doc.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {/* Document Actions */}
                <div className="flex gap-2">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </a>
                  <a
                    href={doc.file_url}
                    download={doc.file_name}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>

                {/* Document Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Uploaded</p>
                    <p className="font-medium">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">File Type</p>
                    <p className="font-medium">{doc.mime_type || "Unknown"}</p>
                  </div>
                </div>

                {/* Previous Review Notes */}
                {doc.review_notes && (
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Review Notes</p>
                    <p className="text-sm">{doc.review_notes}</p>
                  </div>
                )}

                {/* Review Actions */}
                {doc.review_status !== "approved" && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add review notes (optional)..."
                      value={reviewNotes[doc.id] || ""}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [doc.id]: e.target.value }))}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                        onClick={() => handleReviewDecision(doc.id, "approved")}
                        disabled={submitting === doc.id}
                      >
                        {submitting === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewDecision(doc.id, "replacement_requested")}
                        disabled={submitting === doc.id}
                      >
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Request Replacement
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleReviewDecision(doc.id, "rejected")}
                        disabled={submitting === doc.id}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
