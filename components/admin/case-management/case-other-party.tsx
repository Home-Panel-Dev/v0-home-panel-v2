"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Users } from "lucide-react"

interface OtherPartyData {
  party_company: string
  party_is_company: boolean
  party_title: string
  party_first_name: string
  party_last_name: string
  party_building_name: string
  party_property_details: string
  party_postcode: string
  party_street: string
  party_district: string
  party_town: string
  party_county: string
  party_email: string
  party_phone: string
  party_mobile: string
  solicitor_name: string
  solicitor_building_name: string
  solicitor_property_details: string
  solicitor_postcode: string
  solicitor_street: string
  solicitor_district: string
  solicitor_town: string
  solicitor_county: string
  solicitor_email: string
  solicitor_phone: string
  solicitor_mobile: string
  solicitor_dx_number: string
  solicitor_reference: string
  solicitor_account_number: string
  solicitor_contact_person: string
  solicitor_assistant: string
  solicitor_additional_info: string
}

interface CaseOtherPartyProps {
  enquiryId?: string
  caseId?: string
}

const emptyData: OtherPartyData = {
  party_company: "",
  party_is_company: false,
  party_title: "",
  party_first_name: "",
  party_last_name: "",
  party_building_name: "",
  party_property_details: "",
  party_postcode: "",
  party_street: "",
  party_district: "",
  party_town: "",
  party_county: "",
  party_email: "",
  party_phone: "",
  party_mobile: "",
  solicitor_name: "",
  solicitor_building_name: "",
  solicitor_property_details: "",
  solicitor_postcode: "",
  solicitor_street: "",
  solicitor_district: "",
  solicitor_town: "",
  solicitor_county: "",
  solicitor_email: "",
  solicitor_phone: "",
  solicitor_mobile: "",
  solicitor_dx_number: "",
  solicitor_reference: "",
  solicitor_account_number: "",
  solicitor_contact_person: "",
  solicitor_assistant: "",
  solicitor_additional_info: "",
}

export function CaseOtherParty({ enquiryId, caseId }: CaseOtherPartyProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OtherPartyData>(emptyData)

  useEffect(() => {
    fetchData()
  }, [enquiryId, caseId])

  async function fetchData() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(`/api/admin/case-management/other-party?${type}Id=${id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setData({ ...emptyData, ...result.data })
        }
      }
    } catch (error) {
      console.error("Failed to fetch other party:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/other-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          ...data,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save other party")
      }
    } catch (error) {
      console.error("Failed to save other party:", error)
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof OtherPartyData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border">
            <div className="flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Other Party Details & Solicitor</h3>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 space-y-5">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Other Party */}
              <div className="space-y-4">
                <div className="px-3 py-2 bg-muted/50 rounded-lg border border-border">
                  <span className="font-medium text-sm">Other Party</span>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="party_company" className="text-xs text-muted-foreground">Company</Label>
                    <Input
                      id="party_company"
                      value={data.party_company}
                      onChange={(e) => updateField("party_company", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="party_is_company"
                      checked={data.party_is_company}
                      onCheckedChange={(checked) => updateField("party_is_company", checked as boolean)}
                    />
                    <Label htmlFor="party_is_company" className="text-sm font-normal cursor-pointer">
                      Is Company
                    </Label>
                  </div>
                  
                  {[
                    { id: "party_title", label: "Title", field: "party_title" as const },
                    { id: "party_first_name", label: "First Name", field: "party_first_name" as const },
                    { id: "party_last_name", label: "Last Name", field: "party_last_name" as const },
                    { id: "party_building_name", label: "Building Name", field: "party_building_name" as const },
                    { id: "party_property_details", label: "Property Details", field: "party_property_details" as const },
                    { id: "party_postcode", label: "Postcode", field: "party_postcode" as const },
                    { id: "party_street", label: "Street", field: "party_street" as const },
                    { id: "party_district", label: "District", field: "party_district" as const },
                    { id: "party_town", label: "Town", field: "party_town" as const },
                    { id: "party_county", label: "County", field: "party_county" as const },
                    { id: "party_email", label: "E-Mail", field: "party_email" as const, type: "email" },
                    { id: "party_phone", label: "Phone No.", field: "party_phone" as const },
                    { id: "party_mobile", label: "Mobile", field: "party_mobile" as const },
                  ].map(({ id, label, field, type }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        id={id}
                        type={type || "text"}
                        value={data[field] as string}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Their Solicitor */}
              <div className="space-y-4">
                <div className="px-3 py-2 bg-muted/50 rounded-lg border border-border">
                  <span className="font-medium text-sm">Their Solicitor</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { id: "solicitor_name", label: "Other Solicitor", field: "solicitor_name" as const },
                    { id: "solicitor_building_name", label: "Building Name", field: "solicitor_building_name" as const },
                    { id: "solicitor_property_details", label: "Property Details", field: "solicitor_property_details" as const },
                    { id: "solicitor_postcode", label: "Postcode", field: "solicitor_postcode" as const },
                    { id: "solicitor_street", label: "Street", field: "solicitor_street" as const },
                    { id: "solicitor_district", label: "District", field: "solicitor_district" as const },
                    { id: "solicitor_town", label: "Town", field: "solicitor_town" as const },
                    { id: "solicitor_county", label: "County", field: "solicitor_county" as const },
                    { id: "solicitor_email", label: "E-Mail", field: "solicitor_email" as const, type: "email" },
                    { id: "solicitor_phone", label: "Phone", field: "solicitor_phone" as const },
                    { id: "solicitor_mobile", label: "Mobile", field: "solicitor_mobile" as const },
                    { id: "solicitor_dx_number", label: "DX Number", field: "solicitor_dx_number" as const },
                    { id: "solicitor_reference", label: "Reference Number", field: "solicitor_reference" as const },
                    { id: "solicitor_account_number", label: "Account Number", field: "solicitor_account_number" as const },
                    { id: "solicitor_contact_person", label: "Contact Person", field: "solicitor_contact_person" as const },
                    { id: "solicitor_assistant", label: "Assistant", field: "solicitor_assistant" as const },
                  ].map(({ id, label, field, type }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        id={id}
                        type={type || "text"}
                        value={data[field]}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="solicitor_additional_info" className="text-xs text-muted-foreground">Additional Info</Label>
                    <Textarea
                      id="solicitor_additional_info"
                      value={data.solicitor_additional_info}
                      onChange={(e) => updateField("solicitor_additional_info", e.target.value)}
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
