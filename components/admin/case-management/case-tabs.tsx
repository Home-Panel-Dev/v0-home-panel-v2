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
      <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
        <TabsTrigger 
          value="history" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          History
        </TabsTrigger>
        <TabsTrigger 
          value="notes" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          Notes
        </TabsTrigger>
        <TabsTrigger 
          value="correspondence" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          Correspondence Details
        </TabsTrigger>
        <TabsTrigger 
          value="property" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          Property Transaction
        </TabsTrigger>
        <TabsTrigger 
          value="lender" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          Lender Details
        </TabsTrigger>
        <TabsTrigger 
          value="other-party" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          Other Party & Solicitor
        </TabsTrigger>
        <TabsTrigger 
          value="contacts" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          Contacts
        </TabsTrigger>
        <TabsTrigger 
          value="uploads" 
          className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm"
        >
          Uploads
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
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
      </div>
    </Tabs>
  )
}
