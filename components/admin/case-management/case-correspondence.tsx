"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, MapPin } from "lucide-react"

interface CorrespondenceData {
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
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Correspondence Details</h3>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 space-y-5">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Primary Client Correspondence */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm border-b border-border pb-2">
                  Correspondence Address
                </h3>
                
                <div className="grid gap-3">
                  {[
                    { id: "organisation", label: "Organisation", field: "organisation" as const },
                    { id: "flat_building_no", label: "Flat/Plot/Building No.", field: "flat_building_no" as const },
                    { id: "building_name", label: "Development/Building Name", field: "building_name" as const },
                    { id: "street_no", label: "Street No.", field: "street_no" as const },
                    { id: "street", label: "Street", field: "street" as const },
                    { id: "locality", label: "Locality", field: "locality" as const },
                    { id: "post_town", label: "Post Town", field: "post_town" as const },
                    { id: "postcode", label: "Postcode", field: "postcode" as const },
                    { id: "county", label: "County", field: "county" as const },
                    { id: "email", label: "E-Mail", field: "email" as const, type: "email" },
                    { id: "phone", label: "Phone", field: "phone" as const },
                    { id: "mobile", label: "Mobile", field: "mobile" as const },
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
                  
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="sms_opt_in"
                      checked={data.sms_opt_in}
                      onCheckedChange={(checked) => updateField("sms_opt_in", checked as boolean)}
                    />
                    <Label htmlFor="sms_opt_in" className="text-sm font-normal cursor-pointer">
                      SMS
                    </Label>
                  </div>
                </div>
              </div>

              {/* Joint Client Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm border-b border-border pb-2">
                  Joint Client Details
                </h3>
                
                <div className="grid gap-3">
                  {[
                    { id: "joint_organisation", label: "Organisation", field: "joint_organisation" as const },
                    { id: "joint_flat_building_no", label: "Flat/Plot/Building No.", field: "joint_flat_building_no" as const },
                    { id: "joint_building_name", label: "Development/Building Name", field: "joint_building_name" as const },
                    { id: "joint_street_no", label: "Street No.", field: "joint_street_no" as const },
                    { id: "joint_street", label: "Street", field: "joint_street" as const },
                    { id: "joint_locality", label: "Locality", field: "joint_locality" as const },
                    { id: "joint_post_town", label: "Post Town", field: "joint_post_town" as const },
                    { id: "joint_postcode", label: "Postcode", field: "joint_postcode" as const },
                    { id: "joint_county", label: "County", field: "joint_county" as const },
                    { id: "joint_email", label: "E-Mail", field: "joint_email" as const, type: "email" },
                    { id: "joint_phone", label: "Phone", field: "joint_phone" as const },
                    { id: "joint_mobile", label: "Mobile", field: "joint_mobile" as const },
                  ].map(({ id, label, field, type }) => (
                    <div key={id} className="space-y-1.5">
                      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        id={id}
                        type={type || "text"}
                        value={data[field]}
                        onChange={(e) => updateField(field, e.target.value)}
                        disabled={data.joint_same_as_primary}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                  
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="joint_same_as_primary"
                      checked={data.joint_same_as_primary}
                      onCheckedChange={(checked) => updateField("joint_same_as_primary", checked as boolean)}
                    />
                    <Label htmlFor="joint_same_as_primary" className="text-sm font-normal cursor-pointer">
                      Same as primary
                    </Label>
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
