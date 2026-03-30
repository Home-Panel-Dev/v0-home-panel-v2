"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseTabs } from "@/components/admin/case-management"
import { FileText, FolderOpen } from "lucide-react"

interface CaseDetailTabsProps {
  caseId: string
  clientName: string
  clientEmail: string
  transactionType: string
  propertyAddress?: string
  currentStatus?: string
  children: React.ReactNode
}

export function CaseDetailTabs({
  caseId,
  clientName,
  clientEmail,
  transactionType,
  propertyAddress,
  currentStatus,
  children,
}: CaseDetailTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-lg h-auto gap-1">
        <TabsTrigger 
          value="overview" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
        >
          <FileText className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger 
          value="case-management" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
        >
          <FolderOpen className="h-4 w-4" />
          Case Management
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="overview" className="m-0">
          {children}
        </TabsContent>

        <TabsContent value="case-management" className="m-0">
          <CaseTabs
            caseId={caseId}
            clientName={clientName}
            clientEmail={clientEmail}
            transactionType={transactionType}
            propertyAddress={propertyAddress}
            currentStatus={currentStatus}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
