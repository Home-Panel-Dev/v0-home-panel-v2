"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Users } from "lucide-react"

interface OtherPartyData {
  // Other Party
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
  // Their Solicitor
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
              <Users className="h-4 w-4" />
              <CardTitle className="text-base">Other Party Details & Solicitor</CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Other Party */}
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold text-sm text-primary">Other Party</h3>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_company">Company</Label>
                  <Input
                    id="party_company"
                    value={data.party_company}
                    onChange={(e) => updateField("party_company", e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="party_is_company"
                    checked={data.party_is_company}
                    onCheckedChange={(checked) => updateField("party_is_company", checked as boolean)}
                  />
                  <Label htmlFor="party_is_company" className="text-sm font-normal">
                    Is Company
                  </Label>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_title">Title</Label>
                  <Input
                    id="party_title"
                    value={data.party_title}
                    onChange={(e) => updateField("party_title", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_first_name">First Name</Label>
                  <Input
                    id="party_first_name"
                    value={data.party_first_name}
                    onChange={(e) => updateField("party_first_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_last_name">Last Name</Label>
                  <Input
                    id="party_last_name"
                    value={data.party_last_name}
                    onChange={(e) => updateField("party_last_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_building_name">Building Name</Label>
                  <Input
                    id="party_building_name"
                    value={data.party_building_name}
                    onChange={(e) => updateField("party_building_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_property_details">Property Details</Label>
                  <Input
                    id="party_property_details"
                    value={data.party_property_details}
                    onChange={(e) => updateField("party_property_details", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_postcode">Postcode</Label>
                  <Input
                    id="party_postcode"
                    value={data.party_postcode}
                    onChange={(e) => updateField("party_postcode", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_street">Street</Label>
                  <Input
                    id="party_street"
                    value={data.party_street}
                    onChange={(e) => updateField("party_street", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_district">District</Label>
                  <Input
                    id="party_district"
                    value={data.party_district}
                    onChange={(e) => updateField("party_district", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_town">Town</Label>
                  <Input
                    id="party_town"
                    value={data.party_town}
                    onChange={(e) => updateField("party_town", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_county">County</Label>
                  <Input
                    id="party_county"
                    value={data.party_county}
                    onChange={(e) => updateField("party_county", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_email">E-Mail</Label>
                  <Input
                    id="party_email"
                    type="email"
                    value={data.party_email}
                    onChange={(e) => updateField("party_email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_phone">Phone No.</Label>
                  <Input
                    id="party_phone"
                    value={data.party_phone}
                    onChange={(e) => updateField("party_phone", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="party_mobile">Mobile</Label>
                  <Input
                    id="party_mobile"
                    value={data.party_mobile}
                    onChange={(e) => updateField("party_mobile", e.target.value)}
                  />
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>

              {/* Their Solicitor */}
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold text-sm text-primary">Their Solicitor</h3>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_name">Other Solicitor</Label>
                  <Input
                    id="solicitor_name"
                    value={data.solicitor_name}
                    onChange={(e) => updateField("solicitor_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_building_name">Building Name</Label>
                  <Input
                    id="solicitor_building_name"
                    value={data.solicitor_building_name}
                    onChange={(e) => updateField("solicitor_building_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_property_details">Property Details</Label>
                  <Input
                    id="solicitor_property_details"
                    value={data.solicitor_property_details}
                    onChange={(e) => updateField("solicitor_property_details", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_postcode">Postcode</Label>
                  <Input
                    id="solicitor_postcode"
                    value={data.solicitor_postcode}
                    onChange={(e) => updateField("solicitor_postcode", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_street">Street</Label>
                  <Input
                    id="solicitor_street"
                    value={data.solicitor_street}
                    onChange={(e) => updateField("solicitor_street", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_district">District</Label>
                  <Input
                    id="solicitor_district"
                    value={data.solicitor_district}
                    onChange={(e) => updateField("solicitor_district", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_town">Town</Label>
                  <Input
                    id="solicitor_town"
                    value={data.solicitor_town}
                    onChange={(e) => updateField("solicitor_town", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_county">County</Label>
                  <Input
                    id="solicitor_county"
                    value={data.solicitor_county}
                    onChange={(e) => updateField("solicitor_county", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_email">E-Mail</Label>
                  <Input
                    id="solicitor_email"
                    type="email"
                    value={data.solicitor_email}
                    onChange={(e) => updateField("solicitor_email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_phone">Phone</Label>
                  <Input
                    id="solicitor_phone"
                    value={data.solicitor_phone}
                    onChange={(e) => updateField("solicitor_phone", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_mobile">Mobile</Label>
                  <Input
                    id="solicitor_mobile"
                    value={data.solicitor_mobile}
                    onChange={(e) => updateField("solicitor_mobile", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_dx_number">DX Number</Label>
                  <Input
                    id="solicitor_dx_number"
                    value={data.solicitor_dx_number}
                    onChange={(e) => updateField("solicitor_dx_number", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_reference">Reference Number</Label>
                  <Input
                    id="solicitor_reference"
                    value={data.solicitor_reference}
                    onChange={(e) => updateField("solicitor_reference", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_account_number">Account Number</Label>
                  <Input
                    id="solicitor_account_number"
                    value={data.solicitor_account_number}
                    onChange={(e) => updateField("solicitor_account_number", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_contact_person">Contact Person</Label>
                  <Input
                    id="solicitor_contact_person"
                    value={data.solicitor_contact_person}
                    onChange={(e) => updateField("solicitor_contact_person", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_assistant">Assistant</Label>
                  <Input
                    id="solicitor_assistant"
                    value={data.solicitor_assistant}
                    onChange={(e) => updateField("solicitor_assistant", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="solicitor_additional_info">Additional Info</Label>
                  <Textarea
                    id="solicitor_additional_info"
                    value={data.solicitor_additional_info}
                    onChange={(e) => updateField("solicitor_additional_info", e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
