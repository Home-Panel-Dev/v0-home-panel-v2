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
  Loader2,
  Download,
  File,
  Image as ImageIcon,
} from "lucide-react"

interface UploadedDocument {
  id: string
  documentType: string
  filename: string
  pathname: string
  size: number
  status: "pending" | "approved" | "rejected"
  uploadedAt: string
}

const documentTypes = [
  { value: "passport", label: "Passport", description: "Photo page of your valid passport" },
  { value: "driving_licence", label: "Driving Licence", description: "Front and back of your licence" },
  { value: "utility_bill", label: "Utility Bill", description: "Within the last 3 months" },
  { value: "bank_statement", label: "Bank Statement", description: "Showing your name and address" },
  { value: "mortgage_offer", label: "Mortgage Offer", description: "If applicable" },
  { value: "proof_of_funds", label: "Proof of Funds", description: "Bank statements showing deposit" },
  { value: "property_info", label: "Property Information", description: "TA6/TA7/TA10 forms" },
  { value: "other", label: "Other Document", description: "Any other supporting documents" },
]

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    // Load documents from localStorage for now
    // In production, these would come from a database table
    const stored = localStorage.getItem(`documents_${user.id}`)
    if (stored) {
      setDocuments(JSON.parse(stored))
    }
    setLoading(false)
  }

  const saveDocuments = (docs: UploadedDocument[]) => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`documents_${user.id}`, JSON.stringify(docs))
      }
    })
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedType) {
      setError("Please select a document type first")
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", selectedType)

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      const newDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        documentType: selectedType,
        filename: result.filename,
        pathname: result.pathname,
        size: result.size,
        status: "pending",
        uploadedAt: result.uploadedAt,
      }

      const updatedDocs = [newDoc, ...documents]
      setDocuments(updatedDocs)
      saveDocuments(updatedDocs)
      setSelectedType("")
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
      e.target.value = ""
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "heic"].includes(ext || "")) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />
    }
    return <FileText className="h-5 w-5 text-slate-600" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
            Needs Resubmission
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            Under Review
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Documents</h1>
        <p className="text-slate-600 mt-1">
          Upload and manage your property transaction documents securely.
        </p>
      </div>

      {/* Upload section */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold tracking-tight">Upload Document</CardTitle>
          <CardDescription className="text-sm">
            Select a document type, then drag and drop or click to upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document type selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Document Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select document type..." />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-slate-500">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? "border-emerald-500 bg-emerald-50" 
                : selectedType 
                  ? "border-slate-300 hover:border-emerald-400 hover:bg-slate-50 cursor-pointer" 
                  : "border-slate-200 bg-slate-50 cursor-not-allowed"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
              onChange={handleInputChange}
              disabled={!selectedType || uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="text-sm font-medium text-slate-700">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-full ${selectedType ? "bg-emerald-100" : "bg-slate-200"}`}>
                  <Upload className={`h-6 w-6 ${selectedType ? "text-emerald-600" : "text-slate-400"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {selectedType ? "Drag and drop or click to upload" : "Select a document type first"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, JPG, PNG, HEIC, DOC up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Required documents checklist */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold tracking-tight">Required Documents</CardTitle>
          <CardDescription className="text-sm">
            Please ensure you upload all required documents to avoid delays
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {documentTypes.slice(0, 6).map((type) => {
              const uploaded = documents.find(d => d.documentType === type.value)
              return (
                <div 
                  key={type.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    uploaded 
                      ? "border-emerald-200 bg-emerald-50/50" 
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className={`p-1.5 rounded-full ${uploaded ? "bg-emerald-100" : "bg-slate-100"}`}>
                    {uploaded ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <File className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${uploaded ? "text-emerald-900" : "text-slate-700"}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{type.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded documents */}
      <Card className="border-slate-200/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold tracking-tight">Uploaded Documents</CardTitle>
          <CardDescription className="text-sm">
            {documents.length} document{documents.length !== 1 ? "s" : ""} uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      {getFileIcon(doc.filename)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-900 truncate">{doc.filename}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {documentTypes.find(t => t.value === doc.documentType)?.label} • {formatFileSize(doc.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {getStatusBadge(doc.status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <a 
                        href={`/api/documents/file?pathname=${encodeURIComponent(doc.pathname)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-slate-100 w-fit mx-auto mb-4">
                <Upload className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">No documents uploaded</h3>
              <p className="text-sm text-slate-600">
                Select a document type above and upload your first document
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
