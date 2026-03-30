"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
        // Reset the file input
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

  function getFileIcon(fileType: string) {
    // Simplified icon selection
    return <FileText className="h-4 w-4" />
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
              <Upload className="h-4 w-4" />
              <CardTitle className="text-base">Uploads</CardTitle>
              {documents.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  ({documents.length} files)
                </span>
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Upload Form */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="flex-1 space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a description for the file"
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
                  <Button disabled={uploading} className="gap-2">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload File
                  </Button>
                </div>
              </div>
            </div>

            {/* Documents Table */}
            {documents.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead className="w-28">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          {getFileIcon(doc.file_type)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {doc.file_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.description || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(doc.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.uploaded_by_name || "System"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={doc.file_url} download={doc.file_name}>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Upload files using the form above
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
