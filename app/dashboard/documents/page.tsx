"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Loader2,
  Trash2
} from "lucide-react"

interface Document {
  id: string
  document_type: string
  file_name: string
  file_url: string
  status: string
  created_at: string
}

const documentTypes = [
  { value: "passport", label: "Passport" },
  { value: "driving_licence", label: "Driving Licence" },
  { value: "utility_bill", label: "Utility Bill (within 3 months)" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "mortgage_offer", label: "Mortgage Offer" },
  { value: "property_info", label: "Property Information Form" },
  { value: "title_deeds", label: "Title Deeds" },
  { value: "other", label: "Other" },
]

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [caseId, setCaseId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Get active case
    const { data: cases } = await supabase
      .from("cases")
      .select("id")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (cases && cases.length > 0) {
      setCaseId(cases[0].id)
      
      // Get documents for this case
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", cases[0].id)
        .order("created_at", { ascending: false })

      setDocuments(docs || [])
    }
    setLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !caseId || !selectedType) return

    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // For demo purposes, we'll simulate the upload
      // In production, you'd upload to Supabase Storage or another provider
      const mockUrl = `https://example.com/documents/${Date.now()}-${file.name}`

      const { data, error } = await supabase
        .from("documents")
        .insert({
          case_id: caseId,
          uploaded_by: user.id,
          document_type: selectedType,
          file_name: file.name,
          file_url: mockUrl,
          file_size: file.size,
          status: "pending_review",
        })
        .select()
        .single()

      if (error) throw error

      setDocuments([data, ...documents])
      setSelectedType("")
      e.target.value = ""
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)

    if (!error) {
      setDocuments(documents.filter(d => d.id !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Pending Review
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!caseId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium mb-2">No active case</h3>
          <p className="text-slate-600 mb-4">
            Please start a quote to upload documents.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href="/start">Get a Quote</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="text-slate-600">
          Upload and manage your property transaction documents.
        </p>
      </div>

      {/* Upload section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Select a document type and upload your file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File</Label>
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={!selectedType || uploading}
                  className="cursor-pointer"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500">
                PDF, JPG, PNG, DOC up to 10MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents list */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-200">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-sm text-slate-600">
                        {documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-1">No documents yet</h3>
              <p className="text-sm text-slate-600">
                Upload your first document to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
