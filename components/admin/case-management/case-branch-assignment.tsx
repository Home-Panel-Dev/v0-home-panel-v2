"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Loader2, Building2, User } from "lucide-react"

interface Branch {
  id: string
  name: string
  users: Array<{
    user_id: string
    user_name: string
    role: string
  }>
}

interface CaseBranchAssignmentProps {
  enquiryId?: string
  caseId?: string
}

export function CaseBranchAssignment({ enquiryId, caseId }: CaseBranchAssignmentProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedUser, setSelectedUser] = useState("")

  useEffect(() => {
    fetchBranches()
  }, [])

  async function fetchBranches() {
    try {
      const response = await fetch("/api/admin/case-management/branches")
      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign() {
    if (!selectedBranch) return
    
    setSaving(true)
    try {
      const response = await fetch("/api/admin/case-management/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId,
          caseId,
          branchId: selectedBranch,
          branchUserId: selectedUser || undefined,
        }),
      })

      if (response.ok) {
        // Success - optionally show toast
      }
    } catch (error) {
      console.error("Failed to assign branch:", error)
    } finally {
      setSaving(false)
    }
  }

  const selectedBranchUsers = branches.find(b => b.id === selectedBranch)?.users || []

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border">
            <div className="flex items-center gap-2">
              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Branch Assignment</h3>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="branch" className="text-xs text-muted-foreground">Branch / Office</Label>
                    <Select value={selectedBranch} onValueChange={(value) => {
                      setSelectedBranch(value)
                      setSelectedUser("")
                    }}>
                      <SelectTrigger id="branch" className="h-9 text-sm">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="user" className="text-xs text-muted-foreground">Assigned To</Label>
                    <Select 
                      value={selectedUser} 
                      onValueChange={setSelectedUser}
                      disabled={!selectedBranch || selectedBranchUsers.length === 0}
                    >
                      <SelectTrigger id="user" className="h-9 text-sm">
                        <SelectValue placeholder={selectedBranchUsers.length === 0 ? "No users available" : "Select user"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBranchUsers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              {user.user_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleAssign}
                    disabled={!selectedBranch || saving}
                    size="sm"
                  >
                    {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                    Assign
                  </Button>
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
