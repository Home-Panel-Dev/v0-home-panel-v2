"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Calendar, AlertTriangle, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface StatusHistory {
  id: string
  status: string
  notes: string
  created_by_name: string
  created_at: string
}

interface CaseHistoryProps {
  enquiryId?: string
  caseId?: string
  currentStatus?: string
}

const STATUS_OPTIONS = [
  "New Enquiry",
  "Issued Client Pack",
  "Instructions Received",
  "Client Pack Received",
  "Search Pack or Contract Pack Ordered",
  "Draft Contract Issued",
  "Enquiries Raised",
  "Enquiries Answered",
  "Contract Signed",
  "CONTRACT EXCHANGED",
  "Completion",
  "Completed",
  "Aborted",
]

export function CaseHistory({ enquiryId, caseId, currentStatus }: CaseHistoryProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isAbortOpen, setIsAbortOpen] = useState(false)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [newStatus, setNewStatus] = useState("")
  const [expectedCompletion, setExpectedCompletion] = useState("")
  const [nextActionDate, setNextActionDate] = useState("")
  const [updateCaseStatus, setUpdateCaseStatus] = useState(false)
  const [emailReminder, setEmailReminder] = useState(false)
  
  const [abortConfirmed, setAbortConfirmed] = useState(false)
  const [abortReason, setAbortReason] = useState("")

  useEffect(() => {
    fetchStatusHistory()
  }, [enquiryId, caseId])

  async function fetchStatusHistory() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(`/api/admin/case-management/status-history?${type}Id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setStatusHistory(data.history || [])
      }
    } catch (error) {
      console.error("Failed to fetch status history:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus() {
    if (!newStatus || !updateCaseStatus) return
    
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/status-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          status: newStatus,
          expectedCompletionDate: expectedCompletion,
          nextActionDate,
          emailReminder,
        }),
      })

      if (response.ok) {
        await fetchStatusHistory()
        setNewStatus("")
        setExpectedCompletion("")
        setNextActionDate("")
        setUpdateCaseStatus(false)
        setEmailReminder(false)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleRequestAbort() {
    if (!abortConfirmed || !abortReason) return
    
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/abort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          reason: abortReason,
        }),
      })

      if (response.ok) {
        setAbortConfirmed(false)
        setAbortReason("")
        await fetchStatusHistory()
      }
    } catch (error) {
      console.error("Failed to request abort:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Case Details Section */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border">
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                <h3 className="font-medium text-sm">Case Details</h3>
                {currentStatus && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {currentStatus}
                  </Badge>
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-5 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Current Status</Label>
                  <div className="text-sm font-medium">
                    {currentStatus || "New Enquiry"}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-status" className="text-xs text-muted-foreground">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="new-status" className="h-9 text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="expected-completion" className="text-xs text-muted-foreground">Expected Completion Date</Label>
                  <Input
                    id="expected-completion"
                    type="date"
                    value={expectedCompletion}
                    onChange={(e) => setExpectedCompletion(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="next-action" className="text-xs text-muted-foreground">Next Action Date</Label>
                  <Input
                    id="next-action"
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="update-status"
                    checked={updateCaseStatus}
                    onCheckedChange={(checked) => setUpdateCaseStatus(checked as boolean)}
                  />
                  <Label htmlFor="update-status" className="text-sm font-normal cursor-pointer">
                    Update Case Status
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email-reminder"
                    checked={emailReminder}
                    onCheckedChange={(checked) => setEmailReminder(checked as boolean)}
                  />
                  <Label htmlFor="email-reminder" className="text-sm font-normal cursor-pointer">
                    Email Reminder
                  </Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={!newStatus || !updateCaseStatus || saving}
                  size="sm"
                >
                  {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Save
                </Button>
              </div>

              {/* Status History Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : statusHistory.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-12">#</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Updated</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {statusHistory.map((entry, index) => (
                        <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-2.5 font-medium">{index + 1}</td>
                          <td className="px-4 py-2.5">{entry.status}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {format(new Date(entry.created_at), "dd.MM.yyyy")}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {entry.notes || `Status updated to ${entry.status}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No status history yet
                </p>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Request Abort Section */}
      <Collapsible open={isAbortOpen} onOpenChange={setIsAbortOpen}>
        <div className="bg-card border border-destructive/30 rounded-xl overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="px-5 py-4 cursor-pointer hover:bg-destructive/5 transition-colors border-b border-destructive/30">
              <div className="flex items-center gap-2">
                {isAbortOpen ? <ChevronDown className="h-4 w-4 text-destructive" /> : <ChevronRight className="h-4 w-4 text-destructive" />}
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <h3 className="font-medium text-sm text-destructive">Request Abort</h3>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Request to abort this case. This action will notify all relevant parties.
              </p>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-abort"
                  checked={abortConfirmed}
                  onCheckedChange={(checked) => setAbortConfirmed(checked as boolean)}
                />
                <Label htmlFor="confirm-abort" className="text-sm font-normal cursor-pointer">
                  Confirm Abort
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="abort-reason" className="text-xs text-muted-foreground">Reason</Label>
                <Textarea
                  id="abort-reason"
                  placeholder="Enter reason for aborting this case..."
                  value={abortReason}
                  onChange={(e) => setAbortReason(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="destructive"
                  onClick={handleRequestAbort}
                  disabled={!abortConfirmed || !abortReason || saving}
                  size="sm"
                >
                  {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Request
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}
