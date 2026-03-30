"use client"

import { useState, useEffect } from "react"
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
              <Landmark className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Lender Details</h3>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 space-y-5">
            <div className="px-3 py-2 bg-muted/50 rounded-lg border border-border">
              <span className="font-medium text-sm">Lender Details</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Lender Address */}
              <div className="space-y-3">
                {[
                  { id: "lender", label: "Lender", field: "lender" as const },
                  { id: "building_name", label: "Building Name", field: "building_name" as const },
                  { id: "property_details", label: "Property Details", field: "property_details" as const },
                  { id: "street", label: "Street", field: "street" as const },
                  { id: "locality", label: "Locality", field: "locality" as const },
                  { id: "town", label: "Town", field: "town" as const },
                  { id: "county", label: "County", field: "county" as const },
                  { id: "lender_email", label: "E-Mail", field: "email" as const, type: "email" },
                  { id: "lender_phone", label: "Phone", field: "phone" as const },
                  { id: "lender_mobile", label: "Mobile", field: "mobile" as const },
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
                  <Label htmlFor="postcode" className="text-xs text-muted-foreground">Postcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="postcode"
                      value={data.postcode}
                      onChange={(e) => updateField("postcode", e.target.value)}
                      className="h-9 text-sm"
                    />
                    <Button variant="outline" size="sm" className="h-9 px-3">
                      <Search className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Account Details */}
              <div className="space-y-3">
                {[
                  { id: "reference_number", label: "Reference Number", field: "reference_number" as const },
                  { id: "account_number", label: "Account Number", field: "account_number" as const },
                  { id: "contact_person", label: "Contact Person", field: "contact_person" as const },
                  { id: "lender_amount", label: "Amount", field: "amount" as const, type: "number", placeholder: "0.00" },
                ].map(({ id, label, field, type, placeholder }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
                    <Input
                      id={id}
                      type={type || "text"}
                      step={type === "number" ? "0.01" : undefined}
                      value={data[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      placeholder={placeholder}
                      className="h-9 text-sm"
                    />
                  </div>
                ))}
                
                <div className="space-y-1.5">
                  <Label htmlFor="additional_info" className="text-xs text-muted-foreground">Additional Info</Label>
                  <Textarea
                    id="additional_info"
                    value={data.additional_info}
                    onChange={(e) => updateField("additional_info", e.target.value)}
                    rows={6}
                    className="text-sm"
                  />
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
