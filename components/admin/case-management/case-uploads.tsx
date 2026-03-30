"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Upload, FileText, Download, Trash2, Eye } from "lucide-react"
import { format } from "date-fns"

interface Document {
  id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  description: string
  uploaded_by_name: string
  created_at: string
}

interface CaseUploadsProps {
  enquiryId?: string
  caseId?: string
}

export function CaseUploads({ enquiryId, caseId }: CaseUploadsProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchDocuments()
  }, [enquiryId, caseId])

  async function fetchDocuments() {
    try {
      const id = caseId || enquiryId
      const type = caseId ? "case" : "enquiry"
      const response = await fetch(`/api/admin/documents?${type}Id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (enquiryId) formData.append("enquiryId", enquiryId)
      if (caseId) formData.append("caseId", caseId)
      if (description) formData.append("description", description)

      const response = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        await fetchDocuments()
        setDescription("")
        e.target.value = ""
      }
    } catch (error) {
      console.error("Failed to upload document:", error)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(documentId: string) {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/admin/documents?id=${documentId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchDocuments()
      }
    } catch (error) {
      console.error("Failed to delete document:", error)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
              <Upload className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Uploads</h3>
              {documents.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({documents.length} files)
                </span>
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 space-y-5">
            {/* Upload Form */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="description" className="text-xs text-muted-foreground">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for the file"
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex items-end">
                <div className="relative">
                  <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleUpload}
                    disabled={uploading}
                  />
                  <Button disabled={uploading} size="sm" className="gap-2">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Upload File
                  </Button>
                </div>
              </div>
            </div>

            {/* Documents Table */}
            {documents.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-12"></th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">File Name</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Size</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Uploaded</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">By</th>
                      <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {doc.file_name}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {doc.description || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {format(new Date(doc.created_at), "dd/MM/yyyy")}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {doc.uploaded_by_name || "System"}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              asChild
                            >
                              <a href={doc.file_url} download={doc.file_name}>
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-border rounded-lg bg-muted/20">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Upload files using the form above
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
