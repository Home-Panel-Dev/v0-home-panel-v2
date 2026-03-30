"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Home, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PropertyData {
  transaction_type: string
  organisation: string
  property_name: string
  property_number: string
  street_no: string
  street: string
  district: string
  town: string
  county: string
  postcode: string
  amount: string
  tenure: string
}

interface CasePropertyTransactionProps {
  enquiryId?: string
  caseId?: string
  transactionType: string
  propertyAddress?: string
}

const emptyData: PropertyData = {
  transaction_type: "",
  organisation: "",
  property_name: "",
  property_number: "",
  street_no: "",
  street: "",
  district: "",
  town: "",
  county: "",
  postcode: "",
  amount: "",
  tenure: "",
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
              <Building2 className="h-4 w-4" />
              <CardTitle className="text-base">Property Transaction</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {transactionLabel}
              </Badge>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-sm text-primary">
                {transactionLabel}
              </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="organisation">Organisation</Label>
                <Input
                  id="organisation"
                  value={data.organisation}
                  onChange={(e) => updateField("organisation", e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="property_name">Property Details</Label>
                <Input
                  id="property_name"
                  value={data.property_name}
                  onChange={(e) => updateField("property_name", e.target.value)}
                  placeholder={propertyAddress || "Enter property name"}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="property_number">Property Number</Label>
                <Input
                  id="property_number"
                  value={data.property_number}
                  onChange={(e) => updateField("property_number", e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={data.postcode}
                  onChange={(e) => updateField("postcode", e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="street_no">Street No.</Label>
                <Input
                  id="street_no"
                  value={data.street_no}
                  onChange={(e) => updateField("street_no", e.target.value)}
                />
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
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={data.district}
                  onChange={(e) => updateField("district", e.target.value)}
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
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="tenure">Hold type</Label>
                <Select value={data.tenure} onValueChange={(value) => updateField("tenure", value)}>
                  <SelectTrigger id="tenure">
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
