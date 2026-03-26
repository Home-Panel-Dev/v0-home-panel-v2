"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  Building2,
  Loader2,
  Save,
  Mail,
  Phone,
  Globe,
  MapPin,
  Shield,
  FileText,
  Palette,
  Check,
  X,
  Upload,
  Eye,
  Pencil,
  Trash2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getStatusLabel, getStatusStyle } from "@/lib/database"

interface Firm {
  id: string
  name: string
  slug: string
  logo_url: string | null
  brand_color: string
  primary_color: string
  secondary_color: string
  sra_number: string | null
  address: string | null
  phone: string | null
  email: string | null
  contact_email: string | null
  contact_phone: string | null
  email_domain: string | null
  website: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Template {
  id: string
  firm_id: string
  template_type: string
  name: string
  subject: string | null
  html_content: string | null
  text_content: string | null
  is_active: boolean
}

interface DocumentPack {
  id: string
  firm_id: string
  transaction_type: string
  name: string
  documents: Array<{ name: string; type: string; required: boolean; url?: string }>
  is_active: boolean
}

interface Enquiry {
  id: string
  first_name: string
  last_name: string
  status: string
  created_at: string
}

const TEMPLATE_TYPES = [
  { type: "onboarding_invite", name: "Onboarding Invitation", description: "Sent when inviting client to onboard" },
  { type: "client_care_purchase", name: "Client Care (Purchase)", description: "Initial engagement letter for purchases" },
  { type: "client_care_sale", name: "Client Care (Sale)", description: "Initial engagement letter for sales" },
]

export default function FirmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [firm, setFirm] = useState<Firm | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [documentPacks, setDocumentPacks] = useState<DocumentPack[]>([])
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([])
  const [activeTab, setActiveTab] = useState<"profile" | "templates" | "documents">("profile")
  
  // Edit states
  const [editData, setEditData] = useState<Partial<Firm>>({})
  const [hasChanges, setHasChanges] = useState(false)
  
  // Template edit
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [templateData, setTemplateData] = useState<{
    name: string
    subject: string
    html_content: string
    text_content: string
  }>({ name: "", subject: "", html_content: "", text_content: "" })
  const [savingTemplate, setSavingTemplate] = useState(false)

  const fetchFirm = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/firms/${resolvedParams.id}`)
      if (!res.ok) throw new Error("Firm not found")
      const data = await res.json()
      setFirm(data.firm)
      setTemplates(data.templates || [])
      setDocumentPacks(data.documentPacks || [])
      setRecentEnquiries(data.recentEnquiries || [])
      setEditData(data.firm)
    } catch (err) {
      console.error("Failed to fetch firm:", err)
      router.push("/admin/firms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFirm()
  }, [resolvedParams.id])

  const handleFieldChange = (field: keyof Firm, value: string | boolean) => {
    setEditData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!hasChanges) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/firms/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      })
      
      if (!res.ok) throw new Error("Failed to save")
      
      const updated = await res.json()
      setFirm(updated)
      setHasChanges(false)
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFirm = async () => {
    try {
      const res = await fetch(`/api/admin/firms/${resolvedParams.id}`, {
        method: "DELETE"
      })
      
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Failed to delete firm")
        return
      }
      
      router.push("/admin/firms")
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleEditTemplate = (templateType: string) => {
    const existing = templates.find(t => t.template_type === templateType)
    if (existing) {
      setTemplateData({
        name: existing.name,
        subject: existing.subject || "",
        html_content: existing.html_content || "",
        text_content: existing.text_content || ""
      })
    } else {
      const typeConfig = TEMPLATE_TYPES.find(t => t.type === templateType)
      setTemplateData({
        name: typeConfig?.name || templateType,
        subject: "",
        html_content: "",
        text_content: ""
      })
    }
    setEditingTemplate(templateType)
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return
    
    setSavingTemplate(true)
    try {
      const res = await fetch(`/api/admin/firms/${resolvedParams.id}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: editingTemplate,
          ...templateData
        })
      })
      
      if (!res.ok) throw new Error("Failed to save template")
      
      setEditingTemplate(null)
      fetchFirm()
    } catch (err) {
      console.error("Template save error:", err)
    } finally {
      setSavingTemplate(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!firm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Firm not found</p>
        <Button variant="outline" onClick={() => router.push("/admin/firms")}>
          Back to Firms
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link 
            href="/admin/firms"
            className="mt-1 p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: firm.brand_color }}
            >
              {firm.logo_url ? (
                <img src={firm.logo_url} alt={firm.name} className="w-8 h-8 object-contain" />
              ) : (
                <Building2 className="h-7 w-7 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{firm.name}</h1>
                {firm.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                    <Check className="h-3 w-3" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                    <X className="h-3 w-3" />
                    Inactive
                  </span>
                )}
              </div>
              {firm.sra_number && (
                <p className="text-muted-foreground mt-0.5">SRA {firm.sra_number}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Firm</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {firm.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteFirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          {[
            { id: "profile" as const, label: "Profile", icon: Building2 },
            { id: "templates" as const, label: "Email Templates", icon: Mail },
            { id: "documents" as const, label: "Document Packs", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-medium">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Firm Name</Label>
                  <Input
                    id="name"
                    value={editData.name || ""}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sra">SRA Number</Label>
                  <Input
                    id="sra"
                    value={editData.sra_number || ""}
                    onChange={(e) => handleFieldChange("sra_number", e.target.value)}
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editData.address || ""}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  placeholder="Full office address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editData.phone || ""}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="020 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="enquiries@firm.co.uk"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editData.website || ""}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    placeholder="https://www.firm.co.uk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Email Domain</Label>
                  <Input
                    id="domain"
                    value={editData.email_domain || ""}
                    onChange={(e) => handleFieldChange("email_domain", e.target.value)}
                    placeholder="firm.co.uk"
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                Branding
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_color">Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editData.brand_color || "#1a1a1a"}
                      onChange={(e) => handleFieldChange("brand_color", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={editData.brand_color || "#1a1a1a"}
                      onChange={(e) => handleFieldChange("brand_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editData.secondary_color || "#f8f8f6"}
                      onChange={(e) => handleFieldChange("secondary_color", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={editData.secondary_color || "#f8f8f6"}
                      onChange={(e) => handleFieldChange("secondary_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={editData.logo_url || ""}
                  onChange={(e) => handleFieldChange("logo_url", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                {editData.logo_url && (
                  <div className="mt-2 p-4 bg-muted rounded-lg inline-block">
                    <img src={editData.logo_url} alt="Logo preview" className="max-h-12 object-contain" />
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div 
                  className="p-6 rounded-xl"
                  style={{ backgroundColor: editData.secondary_color || "#f8f8f6" }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: editData.brand_color || "#1a1a1a" }}
                    >
                      {editData.logo_url ? (
                        <img src={editData.logo_url} alt="Logo" className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-white font-semibold">
                          {(editData.name || "F").charAt(0)}
                        </span>
                      )}
                    </div>
                    <span 
                      className="font-semibold"
                      style={{ color: editData.brand_color || "#1a1a1a" }}
                    >
                      {editData.name || "Firm Name"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-medium">Settings</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-muted-foreground">Accept new assignments</p>
                </div>
                <Switch
                  checked={editData.is_active !== false}
                  onCheckedChange={(checked) => handleFieldChange("is_active", checked)}
                />
              </div>
            </div>

            {/* Recent Activity */}
            {recentEnquiries.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-medium">Recent Enquiries</h2>
                <div className="space-y-3">
                  {recentEnquiries.slice(0, 5).map((enquiry) => (
                    <Link
                      key={enquiry.id}
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="flex items-center justify-between py-2 hover:bg-muted -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {enquiry.first_name} {enquiry.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(enquiry.created_at).toLocaleDateString("en-GB")}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusStyle(enquiry.status)}`}>
                        {getStatusLabel(enquiry.status)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Configure email templates that will be used when communicating with clients assigned to this firm.
          </p>
          
          <div className="grid gap-4">
            {TEMPLATE_TYPES.map((templateType) => {
              const existing = templates.find(t => t.template_type === templateType.type)
              return (
                <div 
                  key={templateType.type}
                  className="bg-card border border-border rounded-xl p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium">{templateType.name}</h3>
                    <p className="text-sm text-muted-foreground">{templateType.description}</p>
                    {existing && (
                      <p className="text-xs text-accent mt-1">Configured</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {existing && (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditTemplate(templateType.type)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      {existing ? "Edit" : "Create"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Upload document packs for different transaction types. These will be sent to clients during onboarding.
          </p>
          
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Document pack management coming soon</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ll be able to upload client care letters, terms of business, and other documents here.
            </p>
          </div>
        </div>
      )}

      {/* Template Edit Dialog */}
      <Dialog open={editingTemplate !== null} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Template: {TEMPLATE_TYPES.find(t => t.type === editingTemplate)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name</Label>
              <Input
                id="template_name"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_subject">Email Subject</Label>
              <Input
                id="template_subject"
                value={templateData.subject}
                onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
                placeholder="Welcome to {{firm_name}}"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_text">Email Content (Plain Text)</Label>
              <Textarea
                id="template_text"
                value={templateData.text_content}
                onChange={(e) => setTemplateData({ ...templateData, text_content: e.target.value })}
                placeholder="Available variables: {{client_name}}, {{firm_name}}, {{case_reference}}"
                rows={8}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Available variables: {"{{client_name}}"}, {"{{firm_name}}"}, {"{{case_reference}}"}, {"{{property_address}}"}, {"{{transaction_type}}"}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
              {savingTemplate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
