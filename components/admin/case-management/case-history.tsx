"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <CardTitle className="text-base">Case Details</CardTitle>
                {currentStatus && (
                  <Badge variant="secondary" className="ml-auto">
                    {currentStatus}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <div className="text-sm font-medium text-foreground">
                    {currentStatus || "New Enquiry"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-status">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="new-status">
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
                <div className="space-y-2">
                  <Label htmlFor="expected-completion">Expected Completion Date</Label>
                  <div className="relative">
                    <Input
                      id="expected-completion"
                      type="date"
                      value={expectedCompletion}
                      onChange={(e) => setExpectedCompletion(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-action">Next Action Date</Label>
                  <div className="relative">
                    <Input
                      id="next-action"
                      type="date"
                      value={nextActionDate}
                      onChange={(e) => setNextActionDate(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="update-status"
                    checked={updateCaseStatus}
                    onCheckedChange={(checked) => setUpdateCaseStatus(checked as boolean)}
                  />
                  <Label htmlFor="update-status" className="text-sm font-normal">
                    Update Case Status
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email-reminder"
                    checked={emailReminder}
                    onCheckedChange={(checked) => setEmailReminder(checked as boolean)}
                  />
                  <Label htmlFor="email-reminder" className="text-sm font-normal">
                    Email Reminder
                  </Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={!newStatus || !updateCaseStatus || saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>

              {/* Status History Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : statusHistory.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {statusHistory.map((entry, index) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{entry.status}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(entry.created_at), "dd.MM.yyyy")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.notes || `Status updated to ${entry.status}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No status history yet
                </p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Request Abort Section */}
      <Collapsible open={isAbortOpen} onOpenChange={setIsAbortOpen}>
        <Card className="border-destructive/50">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-destructive/5 transition-colors">
              <div className="flex items-center gap-2">
                {isAbortOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <CardTitle className="text-base text-destructive">Request Abort</CardTitle>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Request to abort this case. This action will notify all relevant parties.
              </p>
              
              <div className="flex items-center gap-2">
                <Checkbox
                  id="confirm-abort"
                  checked={abortConfirmed}
                  onCheckedChange={(checked) => setAbortConfirmed(checked as boolean)}
                />
                <Label htmlFor="confirm-abort" className="text-sm font-normal">
                  Confirm Abort
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abort-reason">Reason</Label>
                <Textarea
                  id="abort-reason"
                  placeholder="Enter reason for aborting this case..."
                  value={abortReason}
                  onChange={(e) => setAbortReason(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="destructive"
                  onClick={handleRequestAbort}
                  disabled={!abortConfirmed || !abortReason || saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Request
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}
