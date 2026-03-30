"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, Loader2, Building, Plus, Pencil, Trash2 } from "lucide-react"

interface Contact {
  id: string
  business_type: string
  company: string
  contact_person: string
  phone: string
  mobile: string
  fax: string
  email: string
  address: string
  created_at: string
}

interface CaseContactsProps {
  enquiryId?: string
  caseId?: string
}

const BUSINESS_TYPES = [
  { value: "estate_agent", label: "Estate Agent" },
  { value: "mortgage_broker", label: "Mortgage Broker/IFA" },
  { value: "lender", label: "Lender" },
  { value: "management_company", label: "Management Company" },
  { value: "freeholder", label: "Freeholder" },
  { value: "insurance", label: "Insurance Company" },
  { value: "developer", label: "Developer" },
  { value: "other", label: "Other" },
]

const emptyContact = {
  business_type: "",
  company: "",
  contact_person: "",
  phone: "",
  mobile: "",
  fax: "",
  email: "",
  address: "",
}

export function CaseContacts({ enquiryId, caseId }: CaseContactsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState(emptyContact)

  useEffect(() => {
    fetchContacts()
  }, [enquiryId, caseId])

  async function fetchContacts() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(`/api/admin/case-management/contacts?${type}Id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/contacts", {
        method: editingContact ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingContact?.id,
          enquiryId,
          caseId,
          ...formData,
        }),
      })

      if (response.ok) {
        await fetchContacts()
        setDialogOpen(false)
        setEditingContact(null)
        setFormData(emptyContact)
      }
    } catch (error) {
      console.error("Failed to save contact:", error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(contactId: string) {
    if (!confirm("Are you sure you want to delete this contact?")) return
    
    try {
      const response = await fetch(`/api/admin/case-management/contacts?id=${contactId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchContacts()
      }
    } catch (error) {
      console.error("Failed to delete contact:", error)
    }
  }

  function openEditDialog(contact: Contact) {
    setEditingContact(contact)
    setFormData({
      business_type: contact.business_type || "",
      company: contact.company || "",
      contact_person: contact.contact_person || "",
      phone: contact.phone || "",
      mobile: contact.mobile || "",
      fax: contact.fax || "",
      email: contact.email || "",
      address: contact.address || "",
    })
    setDialogOpen(true)
  }

  function openAddDialog() {
    setEditingContact(null)
    setFormData(emptyContact)
    setDialogOpen(true)
  }

  function getBusinessTypeLabel(value: string) {
    return BUSINESS_TYPES.find(t => t.value === value)?.label || value
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <Building className="h-4 w-4" />
              <CardTitle className="text-base">Contacts</CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContact ? "Edit Contact" : "Add Contact"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="business_type">Business Type</Label>
                      <Select
                        value={formData.business_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                          id="mobile"
                          value={formData.mobile}
                          onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="fax">Fax</Label>
                        <Input
                          id="fax"
                          value={formData.fax}
                          onChange={(e) => setFormData(prev => ({ ...prev, fax: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {contacts.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Type</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {getBusinessTypeLabel(contact.business_type)}
                        </TableCell>
                        <TableCell>{contact.company}</TableCell>
                        <TableCell>{contact.contact_person}</TableCell>
                        <TableCell>{contact.phone || contact.mobile}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(contact)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(contact.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No contacts added yet
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
