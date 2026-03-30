"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, MapPin } from "lucide-react"

interface CorrespondenceData {
  // Primary Client
  organisation: string
  flat_building_no: string
  building_name: string
  street_no: string
  street: string
  locality: string
  post_town: string
  postcode: string
  county: string
  email: string
  phone: string
  mobile: string
  sms_opt_in: boolean
  // Joint Client
  joint_organisation: string
  joint_flat_building_no: string
  joint_building_name: string
  joint_street_no: string
  joint_street: string
  joint_locality: string
  joint_post_town: string
  joint_postcode: string
  joint_county: string
  joint_email: string
  joint_phone: string
  joint_mobile: string
  joint_same_as_primary: boolean
}

interface CaseCorrespondenceProps {
  enquiryId?: string
  caseId?: string
}

const emptyData: CorrespondenceData = {
  organisation: "",
  flat_building_no: "",
  building_name: "",
  street_no: "",
  street: "",
  locality: "",
  post_town: "",
  postcode: "",
  county: "",
  email: "",
  phone: "",
  mobile: "",
  sms_opt_in: false,
  joint_organisation: "",
  joint_flat_building_no: "",
  joint_building_name: "",
  joint_street_no: "",
  joint_street: "",
  joint_locality: "",
  joint_post_town: "",
  joint_postcode: "",
  joint_county: "",
  joint_email: "",
  joint_phone: "",
  joint_mobile: "",
  joint_same_as_primary: false,
}

export function CaseCorrespondence({ enquiryId, caseId }: CaseCorrespondenceProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<CorrespondenceData>(emptyData)

  useEffect(() => {
    fetchData()
  }, [enquiryId, caseId])

  async function fetchData() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(`/api/admin/case-management/correspondence?${type}Id=${id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setData({ ...emptyData, ...result.data })
        }
      }
    } catch (error) {
      console.error("Failed to fetch correspondence:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/correspondence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          ...data,
        }),
      })

      if (!response.ok) {
        console.error("Failed to save correspondence")
      }
    } catch (error) {
      console.error("Failed to save correspondence:", error)
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof CorrespondenceData, value: string | boolean) {
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
              <MapPin className="h-4 w-4" />
              <CardTitle className="text-base">Correspondence Details</CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Primary Client Correspondence */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary border-b pb-2">
                  Correspondence Address
                </h3>
                
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="organisation">Organisation</Label>
                    <Input
                      id="organisation"
                      value={data.organisation}
                      onChange={(e) => updateField("organisation", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="flat_building_no">Flat/Plot/Building No.</Label>
                    <Input
                      id="flat_building_no"
                      value={data.flat_building_no}
                      onChange={(e) => updateField("flat_building_no", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="building_name">Development/Building Name</Label>
                    <Input
                      id="building_name"
                      value={data.building_name}
                      onChange={(e) => updateField("building_name", e.target.value)}
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
                    <Label htmlFor="locality">Locality</Label>
                    <Input
                      id="locality"
                      value={data.locality}
                      onChange={(e) => updateField("locality", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="post_town">Post Town</Label>
                    <Input
                      id="post_town"
                      value={data.post_town}
                      onChange={(e) => updateField("post_town", e.target.value)}
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
                    <Label htmlFor="county">County</Label>
                    <Input
                      id="county"
                      value={data.county}
                      onChange={(e) => updateField("county", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={data.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={data.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="sms_opt_in"
                      checked={data.sms_opt_in}
                      onCheckedChange={(checked) => updateField("sms_opt_in", checked as boolean)}
                    />
                    <Label htmlFor="sms_opt_in" className="text-sm font-normal">
                      SMS
                    </Label>
                  </div>
                </div>
              </div>

              {/* Joint Client Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-primary border-b pb-2">
                  Joint Client Details
                </h3>
                
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_organisation">Organisation</Label>
                    <Input
                      id="joint_organisation"
                      value={data.joint_organisation}
                      onChange={(e) => updateField("joint_organisation", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_flat_building_no">Flat/Plot/Building No.</Label>
                    <Input
                      id="joint_flat_building_no"
                      value={data.joint_flat_building_no}
                      onChange={(e) => updateField("joint_flat_building_no", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_building_name">Development/Building Name</Label>
                    <Input
                      id="joint_building_name"
                      value={data.joint_building_name}
                      onChange={(e) => updateField("joint_building_name", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_street_no">Street No.</Label>
                    <Input
                      id="joint_street_no"
                      value={data.joint_street_no}
                      onChange={(e) => updateField("joint_street_no", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_street">Street</Label>
                    <Input
                      id="joint_street"
                      value={data.joint_street}
                      onChange={(e) => updateField("joint_street", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_locality">Locality</Label>
                    <Input
                      id="joint_locality"
                      value={data.joint_locality}
                      onChange={(e) => updateField("joint_locality", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_post_town">Post Town</Label>
                    <Input
                      id="joint_post_town"
                      value={data.joint_post_town}
                      onChange={(e) => updateField("joint_post_town", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_postcode">Postcode</Label>
                    <Input
                      id="joint_postcode"
                      value={data.joint_postcode}
                      onChange={(e) => updateField("joint_postcode", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_county">County</Label>
                    <Input
                      id="joint_county"
                      value={data.joint_county}
                      onChange={(e) => updateField("joint_county", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_email">E-Mail</Label>
                    <Input
                      id="joint_email"
                      type="email"
                      value={data.joint_email}
                      onChange={(e) => updateField("joint_email", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_phone">Phone</Label>
                    <Input
                      id="joint_phone"
                      value={data.joint_phone}
                      onChange={(e) => updateField("joint_phone", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="joint_mobile">Mobile</Label>
                    <Input
                      id="joint_mobile"
                      value={data.joint_mobile}
                      onChange={(e) => updateField("joint_mobile", e.target.value)}
                      disabled={data.joint_same_as_primary}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="joint_same_as_primary"
                      checked={data.joint_same_as_primary}
                      onCheckedChange={(checked) => updateField("joint_same_as_primary", checked as boolean)}
                    />
                    <Label htmlFor="joint_same_as_primary" className="text-sm font-normal">
                      Same as primary
                    </Label>
                  </div>
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
