"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PropertyData {
  transaction_type: string
  property_details: string
  property_number: string
  street_no: string
  street: string
  district: string
  town: string
  county: string
  postcode: string
  amount: string
  holding_type: string
}

interface CasePropertyTransactionProps {
  enquiryId?: string
  caseId?: string
  transactionType: string
  propertyAddress?: string
}

const emptyData: PropertyData = {
  transaction_type: "",
  property_details: "",
  property_number: "",
  street_no: "",
  street: "",
  district: "",
  town: "",
  county: "",
  postcode: "",
  amount: "",
  holding_type: "freehold",
}

export function CasePropertyTransaction({ 
  enquiryId, 
  caseId, 
  transactionType,
  propertyAddress 
}: CasePropertyTransactionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<PropertyData>({
    ...emptyData,
    transaction_type: transactionType,
  })

  useEffect(() => {
    fetchData()
  }, [enquiryId, caseId])

  async function fetchData() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(`/api/admin/case-management/property-transaction?${type}Id=${id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setData({ ...emptyData, ...result.data })
        }
      }
    } catch (error) {
      console.error("Failed to fetch property transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/property-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          ...data,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save property transaction")
      }
    } catch (error) {
      console.error("Failed to save property transaction:", error)
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof PropertyData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const transactionLabel = transactionType?.toLowerCase() === "sale" ? "Sale" :
                          transactionType?.toLowerCase() === "purchase" ? "Purchase" :
                          transactionType?.toLowerCase() === "remortgage" ? "Remortgage" :
                          transactionType || "Sale"

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
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Property Transaction</h3>
              <Badge variant="secondary" className="ml-2 text-xs">
                {transactionLabel}
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 space-y-5">
            <div className="px-3 py-2 bg-muted/50 rounded-lg border border-border">
              <span className="font-medium text-sm">{transactionLabel}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                { id: "property_details", label: "Property Details", field: "property_details" as const, placeholder: propertyAddress || "Enter property name" },
                { id: "property_number", label: "Property Number", field: "property_number" as const },
                { id: "postcode", label: "Postcode", field: "postcode" as const },
                { id: "street_no", label: "Street No.", field: "street_no" as const },
                { id: "street", label: "Street", field: "street" as const },
                { id: "district", label: "District", field: "district" as const },
                { id: "town", label: "Town", field: "town" as const },
                { id: "county", label: "County", field: "county" as const },
                { id: "amount", label: "Amount", field: "amount" as const, type: "number", placeholder: "0.00" },
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
                <Label htmlFor="holding_type" className="text-xs text-muted-foreground">Holding Type</Label>
                <Select value={data.holding_type} onValueChange={(value) => updateField("holding_type", value)}>
                  <SelectTrigger id="holding_type" className="h-9 text-sm">
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freehold">Freehold</SelectItem>
                    <SelectItem value="leasehold">Leasehold</SelectItem>
                    <SelectItem value="share_of_freehold">Share of Freehold</SelectItem>
                  </SelectContent>
                </Select>
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
