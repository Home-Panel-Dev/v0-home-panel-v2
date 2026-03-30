"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Landmark, Search } from "lucide-react"

interface LenderData {
  lender: string
  building_name: string
  property_details: string
  postcode: string
  street: string
  locality: string
  town: string
  county: string
  email: string
  phone: string
  mobile: string
  reference_number: string
  account_number: string
  contact_person: string
  amount: string
  additional_info: string
}

interface CaseLenderDetailsProps {
  enquiryId?: string
  caseId?: string
}

const emptyData: LenderData = {
  lender: "",
  building_name: "",
  property_details: "",
  postcode: "",
  street: "",
  locality: "",
  town: "",
  county: "",
  email: "",
  phone: "",
  mobile: "",
  reference_number: "",
  account_number: "",
  contact_person: "",
  amount: "",
  additional_info: "",
}

export function CaseLenderDetails({ enquiryId, caseId }: CaseLenderDetailsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<LenderData>(emptyData)

  useEffect(() => {
    fetchData()
  }, [enquiryId, caseId])

  async function fetchData() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(`/api/admin/case-management/lender-details?${type}Id=${id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setData({ ...emptyData, ...result.data })
        }
      }
    } catch (error) {
      console.error("Failed to fetch lender details:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/lender-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          ...data,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save lender details")
      }
    } catch (error) {
      console.error("Failed to save lender details:", error)
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof LenderData, value: string) {
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
              <Landmark className="h-4 w-4" />
              <CardTitle className="text-base">Lender Details</CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-sm text-primary">Lender Details</h3>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Lender Address */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lender">Lender</Label>
                  <Input
                    id="lender"
                    value={data.lender}
                    onChange={(e) => updateField("lender", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="building_name">Building Name</Label>
                  <Input
                    id="building_name"
                    value={data.building_name}
                    onChange={(e) => updateField("building_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="property_details">Property Details</Label>
                  <Input
                    id="property_details"
                    value={data.property_details}
                    onChange={(e) => updateField("property_details", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="postcode">Postcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="postcode"
                      value={data.postcode}
                      onChange={(e) => updateField("postcode", e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={data.street}
                    onChange={(e) => updateField("street", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="locality">Locality</Label>
                  <Input
                    id="locality"
                    value={data.locality}
                    onChange={(e) => updateField("locality", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="town">Town</Label>
                  <Input
                    id="town"
                    value={data.town}
                    onChange={(e) => updateField("town", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={data.county}
                    onChange={(e) => updateField("county", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="lender_email">E-Mail</Label>
                  <Input
                    id="lender_email"
                    type="email"
                    value={data.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="lender_phone">Phone</Label>
                  <Input
                    id="lender_phone"
                    value={data.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="lender_mobile">Mobile</Label>
                  <Input
                    id="lender_mobile"
                    value={data.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                  />
                </div>
              </div>

              {/* Right Column - Account Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    value={data.reference_number}
                    onChange={(e) => updateField("reference_number", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={data.account_number}
                    onChange={(e) => updateField("account_number", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={data.contact_person}
                    onChange={(e) => updateField("contact_person", e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="lender_amount">Amount</Label>
                  <Input
                    id="lender_amount"
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="additional_info">Additional Info</Label>
                  <Textarea
                    id="additional_info"
                    value={data.additional_info}
                    onChange={(e) => updateField("additional_info", e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
