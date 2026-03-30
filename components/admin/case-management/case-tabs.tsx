"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseHistory } from "./case-history"
import { CaseNotes } from "./case-notes"
import { CaseCorrespondence } from "./case-correspondence"
import { CasePropertyTransaction } from "./case-property-transaction"
import { CaseLenderDetails } from "./case-lender-details"
import { CaseOtherParty } from "./case-other-party"
import { CaseContacts } from "./case-contacts"
import { CaseUploads } from "./case-uploads"
import { CaseBranchAssignment } from "./case-branch-assignment"

interface CaseTabsProps {
  enquiryId?: string
  caseId?: string
  clientName: string
  clientEmail: string
  transactionType: string
  propertyAddress?: string
  currentStatus?: string
  initialTab?: string
}

export function CaseTabs({
  enquiryId,
  caseId,
  clientName,
  clientEmail,
  transactionType,
  propertyAddress,
  currentStatus,
  initialTab = "history",
}: CaseTabsProps) {
  return (
    <Tabs defaultValue={initialTab} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-muted/30 p-1 rounded-lg border border-border">
        <TabsTrigger 
          value="history" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          History
        </TabsTrigger>
        <TabsTrigger 
          value="notes" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Notes
        </TabsTrigger>
        <TabsTrigger 
          value="correspondence" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Correspondence Details
        </TabsTrigger>
        <TabsTrigger 
          value="property" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Property Transaction
        </TabsTrigger>
        <TabsTrigger 
          value="lender" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Lender Details
        </TabsTrigger>
        <TabsTrigger 
          value="other-party" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Other Party & Solicitor
        </TabsTrigger>
        <TabsTrigger 
          value="contacts" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Contacts
        </TabsTrigger>
        <TabsTrigger 
          value="uploads" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Uploads
        </TabsTrigger>
        <TabsTrigger 
          value="branch" 
          className="data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:shadow-sm text-sm px-3 py-1.5"
        >
          Branch Assignment
        </TabsTrigger>
      </TabsList>

      <div className="mt-5">
        <TabsContent value="history" className="m-0">
          <CaseHistory 
            enquiryId={enquiryId} 
            caseId={caseId} 
            currentStatus={currentStatus}
          />
        </TabsContent>

        <TabsContent value="notes" className="m-0">
          <CaseNotes 
            enquiryId={enquiryId} 
            caseId={caseId}
            clientName={clientName}
            clientEmail={clientEmail}
          />
        </TabsContent>

        <TabsContent value="correspondence" className="m-0">
          <CaseCorrespondence 
            enquiryId={enquiryId} 
            caseId={caseId}
          />
        </TabsContent>

        <TabsContent value="property" className="m-0">
          <CasePropertyTransaction 
            enquiryId={enquiryId} 
            caseId={caseId}
            transactionType={transactionType}
            propertyAddress={propertyAddress}
          />
        </TabsContent>

        <TabsContent value="lender" className="m-0">
          <CaseLenderDetails 
            enquiryId={enquiryId} 
            caseId={caseId}
          />
        </TabsContent>

        <TabsContent value="other-party" className="m-0">
          <CaseOtherParty 
            enquiryId={enquiryId} 
            caseId={caseId}
          />
        </TabsContent>

        <TabsContent value="contacts" className="m-0">
          <CaseContacts 
            enquiryId={enquiryId} 
            caseId={caseId}
          />
        </TabsContent>

        <TabsContent value="uploads" className="m-0">
          <CaseUploads 
            enquiryId={enquiryId} 
            caseId={caseId}
          />
        </TabsContent>

        <TabsContent value="branch" className="m-0">
          <CaseBranchAssignment 
            enquiryId={enquiryId} 
            caseId={caseId}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
