"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Mail, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface Note {
  id: string
  content: string
  note_type: string
  email_sent: boolean
  created_by_name: string
  created_at: string
}

interface CaseNotesProps {
  enquiryId?: string
  caseId?: string
  clientName: string
  clientEmail: string
}

export function CaseNotes({ enquiryId, caseId, clientName, clientEmail }: CaseNotesProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [clientNote, setClientNote] = useState("")
  const [solicitorNote, setSolicitorNote] = useState("")
  const [emailClient, setEmailClient] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [enquiryId, caseId, currentPage])

  async function fetchNotes() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(
        `/api/admin/case-management/notes?${type}Id=${id}&page=${currentPage}`
      )
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddNote() {
    if (!clientNote && !solicitorNote) return
    
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          clientNote,
          solicitorNote,
          emailClient,
          clientName,
          clientEmail,
        }),
      })

      if (response.ok) {
        await fetchNotes()
        setClientNote("")
        setSolicitorNote("")
        setEmailClient(false)
      }
    } catch (error) {
      console.error("Failed to add note:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleSendEmail() {
    if (!clientNote) return
    
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/notes/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          content: clientNote,
          clientName,
          clientEmail,
        }),
      })

      if (response.ok) {
        await fetchNotes()
        setClientNote("")
      }
    } catch (error) {
      console.error("Failed to send email:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <MessageSquare className="h-4 w-4" />
              <CardTitle className="text-base">Add Notes</CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Add Notes Form */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-note">Comments to Client</Label>
                <Textarea
                  id="client-note"
                  placeholder="Enter comments for the client..."
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email-client"
                    checked={emailClient}
                    onCheckedChange={(checked) => setEmailClient(checked as boolean)}
                  />
                  <Label htmlFor="email-client" className="text-sm font-normal">
                    E-Mail Client
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="solicitor-note">Comments to Solicitor/EA</Label>
                <Textarea
                  id="solicitor-note"
                  placeholder="Enter comments for the solicitor or estate agent..."
                  value={solicitorNote}
                  onChange={(e) => setSolicitorNote(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleSendEmail}
                disabled={!clientNote || saving}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                E-Mail
              </Button>
            </div>

            {/* Notes History Table */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notes.length > 0 ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-36">By whom</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead className="w-40">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notes.map((note, index) => (
                        <TableRow key={note.id}>
                          <TableCell className="font-medium">
                            {note.created_by_name || "System"}
                          </TableCell>
                          <TableCell className="whitespace-pre-wrap">
                            {note.content}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(note.created_at), "dd-MM-yyyy HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-muted-foreground">
                      {totalPages} Pages
                    </span>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes yet
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
