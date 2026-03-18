"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  enquiryFormSchema,
  transactionTypes,
  tenureTypes,
  ownerCountOptions,
  propertyCountOptions,
  type EnquiryFormData,
} from "@/lib/form-schema"
import { cn } from "@/lib/utils"

type StepType = 
  | "transaction-type"
  | "property-address"
  | "tenure"
  | "property-value"
  | "owner-count"
  | "first-time-buyer"
  | "property-count"
  | "new-build"
  | "mortgage"
  | "company-purchase"
  | "gift-funds"
  | "bank-funds-only"
  | "personal-details"
  | "quote"

// Agent data for the quote step
const agents = [
  {
    name: "Sarah Mitchell",
    role: "Senior Conveyancer",
    image: "/agents/sarah-mitchell.jpg",
  },
  {
    name: "James Thompson",
    role: "Property Solicitor",
    image: "/agents/james-thompson.jpg",
  },
]

// Fee calculation logic
function calculateFees(data: Partial<EnquiryFormData>) {
  const propertyValue = parseFloat(data.propertyValue?.replace(/,/g, "") || "0")
  const transactionType = data.transactionType || "buying"
  
  // Base legal fee
  let legalFee = 595
  if (propertyValue > 250000) legalFee = 695
  if (propertyValue > 500000) legalFee = 895
  if (propertyValue > 1000000) legalFee = 1295
  
  // Additional fees based on transaction type
  const isLeasehold = data.tenure === "leasehold"
  const hasMortgage = data.hasMortgage === "yes"
  const isNewBuild = data.isNewBuild === "yes"
  const isCompanyPurchase = data.isCompanyPurchase === "yes"
  const hasGiftFunds = data.hasGiftFunds === "yes"
  
  const fees = {
    legalFee,
    leaseholdSupplement: isLeasehold ? 195 : 0,
    mortgageFee: hasMortgage ? 95 : 0,
    newBuildFee: isNewBuild ? 195 : 0,
    companyFee: isCompanyPurchase ? 295 : 0,
    giftFundsFee: hasGiftFunds ? 50 : 0,
    searchFees: 300,
    landRegistryFee: propertyValue > 500000 ? 295 : propertyValue > 250000 ? 150 : 100,
    bankTransferFee: 35,
  }
  
  const subtotal = fees.legalFee + fees.leaseholdSupplement + fees.mortgageFee + 
    fees.newBuildFee + fees.companyFee + fees.giftFundsFee
  const vat = Math.round(subtotal * 0.2)
  const disbursements = fees.searchFees + fees.landRegistryFee + fees.bankTransferFee
  const total = subtotal + vat + disbursements
  
  return {
    ...fees,
    subtotal,
    vat,
    disbursements,
    total,
    transactionLabel: transactionType === "buying" ? "purchase" : 
      transactionType === "selling" ? "sale" : 
      transactionType === "buying-selling" ? "purchase & sale" :
      transactionType === "remortgage" ? "remortgage" : "transfer of equity"
  }
}

function getStepsForTransaction(transactionType: string): StepType[] {
  const baseSteps: StepType[] = ["transaction-type"]
  
  if (transactionType === "buying" || transactionType === "buying-selling") {
    return [
      ...baseSteps,
      "property-address",
      "tenure",
      "property-value",
      "owner-count",
      "first-time-buyer",
      "property-count",
      "new-build",
      "mortgage",
      "company-purchase",
      "gift-funds",
      "bank-funds-only",
      "personal-details",
      "quote",
    ]
  }
  
  if (transactionType === "selling") {
    return [
      ...baseSteps,
      "property-address",
      "tenure",
      "property-value",
      "owner-count",
      "mortgage",
      "personal-details",
      "quote",
    ]
  }
  
  if (transactionType === "remortgage") {
    return [
      ...baseSteps,
      "property-address",
      "tenure",
      "property-value",
      "owner-count",
      "personal-details",
      "quote",
    ]
  }
  
  if (transactionType === "transfer-equity") {
    return [
      ...baseSteps,
      "property-address",
      "tenure",
      "property-value",
      "owner-count",
      "mortgage",
      "personal-details",
      "quote",
    ]
  }
  
  return baseSteps
}

export function MultiStepForm() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      transactionType: "",
      propertyAddressLine1: "",
      propertyAddressLine2: "",
      propertyCity: "",
      propertyPostcode: "",
      propertyAddressUnknown: false,
      tenure: "",
      propertyValue: "",
      ownerCount: "",
      firstTimeBuyer: "",
      propertyCount: "",
      isNewBuild: "",
      hasMortgage: "",
      isCompanyPurchase: "",
      hasGiftFunds: "",
      bankFundsOnly: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  })

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = form
  const watchedValues = watch()
  
  const steps = useMemo(() => 
    getStepsForTransaction(watchedValues.transactionType),
    [watchedValues.transactionType]
  )
  
  const currentStep = steps[currentStepIndex] || "transaction-type"
  const totalSteps = steps.length || 1
  const progressValue = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0
  const progress = Number.isNaN(progressValue) ? 0 : Math.round(progressValue)

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case "transaction-type":
        return !!watchedValues.transactionType
      case "property-address":
        return watchedValues.propertyAddressUnknown || (!!watchedValues.propertyPostcode && watchedValues.propertyPostcode.length >= 5)
      case "tenure":
        return !!watchedValues.tenure
      case "property-value":
        return !!watchedValues.propertyValue
      case "owner-count":
        return !!watchedValues.ownerCount
      case "first-time-buyer":
        return !!watchedValues.firstTimeBuyer
      case "property-count":
        return !!watchedValues.propertyCount
      case "new-build":
        return !!watchedValues.isNewBuild
      case "mortgage":
        return !!watchedValues.hasMortgage
      case "company-purchase":
        return !!watchedValues.isCompanyPurchase
      case "gift-funds":
        return !!watchedValues.hasGiftFunds
      case "bank-funds-only":
        return !!watchedValues.bankFundsOnly
      case "personal-details":
        const result = await trigger(["firstName", "lastName", "email", "phone"])
        return result
      case "quote":
        return true
      default:
        return true
    }
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  const onSubmit = async (data: EnquiryFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.")
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

// Handle radio selection without auto-advance
  const handleRadioSelect = (field: keyof EnquiryFormData, value: string) => {
    setValue(field, value)
  }
    }, 200)
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="h-16 w-16 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-semibold mb-3">Enquiry submitted</h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Thank you for your enquiry. A member of the HomePanel team will be in touch shortly to guide you through the next steps.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Form card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Back button and progress */}
        <div className="p-4 pb-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="rounded-lg border-border"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="px-4 pt-4">
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[320px]"
            >
              {currentStep === "transaction-type" && (
                <TransactionTypeStep
                  value={watchedValues.transactionType}
                  onChange={(value) => handleRadioSelect("transactionType", value)}
                />
              )}

              {currentStep === "property-address" && (
                <PropertyAddressStep
                  transactionType={watchedValues.transactionType}
                  values={watchedValues}
                  register={register}
                  setValue={setValue}
                  onNext={nextStep}
                />
              )}

              {currentStep === "tenure" && (
                <TenureStep
                  value={watchedValues.tenure || ""}
                  onChange={(value) => handleRadioSelect("tenure", value)}
                />
              )}

              {currentStep === "property-value" && (
                <PropertyValueStep
                  value={watchedValues.propertyValue || ""}
                  onChange={(value) => setValue("propertyValue", value)}
                  onNext={nextStep}
                />
              )}

              {currentStep === "owner-count" && (
                <OwnerCountStep
                  value={watchedValues.ownerCount || ""}
                  onChange={(value) => handleRadioSelect("ownerCount", value)}
                />
              )}

              {currentStep === "first-time-buyer" && (
                <FirstTimeBuyerStep
                  value={watchedValues.firstTimeBuyer || ""}
                  onChange={(value) => handleRadioSelect("firstTimeBuyer", value)}
                />
              )}

              {currentStep === "property-count" && (
                <PropertyCountStep
                  value={watchedValues.propertyCount || ""}
                  onChange={(value) => handleRadioSelect("propertyCount", value)}
                />
              )}

              {currentStep === "new-build" && (
                <NewBuildStep
                  value={watchedValues.isNewBuild || ""}
                  onChange={(value) => handleRadioSelect("isNewBuild", value)}
                />
              )}

              {currentStep === "mortgage" && (
                <MortgageStep
                  value={watchedValues.hasMortgage || ""}
                  onChange={(value) => handleRadioSelect("hasMortgage", value)}
                />
              )}

              {currentStep === "company-purchase" && (
                <CompanyPurchaseStep
                  value={watchedValues.isCompanyPurchase || ""}
                  onChange={(value) => handleRadioSelect("isCompanyPurchase", value)}
                />
              )}

              {currentStep === "gift-funds" && (
                <GiftFundsStep
                  value={watchedValues.hasGiftFunds || ""}
                  onChange={(value) => handleRadioSelect("hasGiftFunds", value)}
                />
              )}

              {currentStep === "bank-funds-only" && (
                <BankFundsOnlyStep
                  value={watchedValues.bankFundsOnly || ""}
                  onChange={(value) => handleRadioSelect("bankFundsOnly", value)}
                />
              )}

              {currentStep === "personal-details" && (
                <PersonalDetailsStep
                  register={register}
                  errors={errors}
                  isSubmitting={isSubmitting}
                />
              )}

              {currentStep === "quote" && (
                <QuoteStep
                  values={watchedValues}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-end mt-6">
            {currentStep === "quote" ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Proceed with HomePanel"
                )}
              </Button>
            ) : currentStep === "personal-details" ? (
              <Button
                type="button"
                onClick={nextStep}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Get My Quote
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// Pill button component for radio options
function PillButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-5 py-2.5 rounded-full border text-sm font-medium transition-all",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:border-foreground/40",
        className
      )}
    >
      <span className={cn(
        "w-4 h-4 rounded-full border-2 mr-2.5 flex items-center justify-center",
        selected ? "border-background" : "border-muted-foreground/50"
      )}>
        {selected && <span className="w-2 h-2 rounded-full bg-background" />}
      </span>
      {children}
    </button>
  )
}

// Info box component
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-slate-100 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  )
}

// Step: Transaction Type
function TransactionTypeStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="text-center">
      <p className="text-muted-foreground mb-2">
        Buying or selling a home can be both a <strong className="text-foreground">stressful</strong> and <strong className="text-foreground">exciting</strong> experience.
      </p>
      <p className="text-muted-foreground mb-2">
        Let us handle this <strong className="text-foreground">important moment</strong> for you.
      </p>
      <p className="text-muted-foreground mb-6">
        We are <strong className="text-foreground">HomePanel</strong>, a team which:
      </p>
      <ul className="text-sm text-muted-foreground mb-8 space-y-1">
        <li className="underline">is 2x faster than the national average,</li>
        <li className="underline">has learnt from 30,000+ transactions,</li>
        <li className="underline">offers the easiest client experience</li>
        <li className="underline">in the industry.</li>
      </ul>
      
      <Label className="text-base block mb-4">What would you like a quote for?</Label>
      <div className="flex flex-wrap justify-center gap-2">
        {transactionTypes.map((type) => (
          <PillButton
            key={type.value}
            selected={value === type.value}
            onClick={() => onChange(type.value)}
          >
            {type.label}
          </PillButton>
        ))}
      </div>
    </div>
  )
}

// Step: Property Address
function PropertyAddressStep({
  transactionType,
  values,
  register,
  setValue,
  onNext,
}: {
  transactionType: string
  values: EnquiryFormData
  register: ReturnType<typeof useForm<EnquiryFormData>>["register"]
  setValue: ReturnType<typeof useForm<EnquiryFormData>>["setValue"]
  onNext: () => void
}) {
  const action = transactionType === "selling" ? "selling" : "buying"
  
  return (
    <div className="space-y-4">
      <Label className="text-base">
        What is the address of the property you are <strong>{action}</strong>?
      </Label>
      
      <div className="space-y-3">
        <Input
          placeholder="No. or Name / Postcode"
          {...register("propertyPostcode")}
          className="h-12 rounded-xl"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="addressUnknown"
          checked={values.propertyAddressUnknown}
          onCheckedChange={(checked) => setValue("propertyAddressUnknown", checked as boolean)}
        />
        <label htmlFor="addressUnknown" className="text-sm text-muted-foreground cursor-pointer">
          I don&apos;t know it yet
        </label>
      </div>
    </div>
  )
}

// Step: Tenure
function TenureStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Is it a Freehold or Leasehold property?</Label>
      
      <InfoBox>
        Most houses are <strong className="text-foreground">Freehold</strong> and most flats are <strong className="text-foreground">Leasehold</strong>. If you are buying through an Estate Agent they should be able to make you aware.
      </InfoBox>
      
      <div className="flex flex-wrap gap-2">
        {tenureTypes.map((type) => (
          <PillButton
            key={type.value}
            selected={value === type.value}
            onClick={() => onChange(type.value)}
          >
            {type.label}
          </PillButton>
        ))}
      </div>
    </div>
  )
}

// Step: Property Value
function PropertyValueStep({
  value,
  onChange,
  onNext,
}: {
  value: string
  onChange: (value: string) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">How much will you be paying (approximately)?</Label>
      
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
        <Input
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 rounded-xl pl-8"
        />
      </div>
    </div>
  )
}

// Step: Owner Count
function OwnerCountStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Including you, how many people will own this property?</Label>
      
      <div className="flex flex-wrap gap-2">
        {ownerCountOptions.map((option) => (
          <PillButton
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </PillButton>
        ))}
      </div>
    </div>
  )
}

// Step: First Time Buyer
function FirstTimeBuyerStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">
        Will this be the first property you have <strong>all</strong> ever owned?
      </Label>
      
      <InfoBox>
        You could be considered a first time buyer if you have never owned or part owned a property anywhere in the world. <strong className="text-foreground">If any of the new owners have then you should answer &quot;No&quot;.</strong>
      </InfoBox>
      
      <div className="flex flex-col gap-2">
        <PillButton
          selected={value === "yes"}
          onClick={() => onChange("yes")}
        >
          Yes, we are all first time buyers
        </PillButton>
        <PillButton
          selected={value === "no"}
          onClick={() => onChange("no")}
        >
          No
        </PillButton>
      </div>
    </div>
  )
}

// Step: Property Count
function PropertyCountStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">When your purchase completes how many properties will you all own?</Label>
      
      <div className="flex flex-col gap-2">
        {propertyCountOptions.map((option) => (
          <PillButton
            key={option.value}
            selected={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </PillButton>
        ))}
      </div>
    </div>
  )
}

// Step: New Build
function NewBuildStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Is this a new build property?</Label>
      
      <div className="flex gap-2">
        <PillButton
          selected={value === "yes"}
          onClick={() => onChange("yes")}
        >
          Yes
        </PillButton>
        <PillButton
          selected={value === "no"}
          onClick={() => onChange("no")}
        >
          No
        </PillButton>
      </div>
    </div>
  )
}

// Step: Mortgage
function MortgageStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Will you be getting a mortgage?</Label>
      
      <div className="flex gap-2">
        <PillButton
          selected={value === "yes"}
          onClick={() => onChange("yes")}
        >
          Yes
        </PillButton>
        <PillButton
          selected={value === "no"}
          onClick={() => onChange("no")}
        >
          No
        </PillButton>
      </div>
    </div>
  )
}

// Step: Company Purchase
function CompanyPurchaseStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Are you buying under a company name?</Label>
      
      <InfoBox>
        This could be a limited company (LTD), partnership or any other company.
      </InfoBox>
      
      <div className="flex flex-col gap-2">
        <PillButton
          selected={value === "yes"}
          onClick={() => onChange("yes")}
        >
          Yes
        </PillButton>
        <PillButton
          selected={value === "no"}
          onClick={() => onChange("no")}
        >
          No / I don&apos;t know
        </PillButton>
      </div>
    </div>
  )
}

// Step: Gift Funds
function GiftFundsStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Will someone be giving you money to help with the purchase?</Label>
      
      <InfoBox>
        This could be a friend or relative who is helping with the deposit or the price of the property. But this does not include anyone who will also be an owner of the property.
      </InfoBox>
      
      <div className="flex flex-col gap-2">
        <PillButton
          selected={value === "yes"}
          onClick={() => onChange("yes")}
        >
          Yes
        </PillButton>
        <PillButton
          selected={value === "no"}
          onClick={() => onChange("no")}
        >
          No / I&apos;m not sure
        </PillButton>
      </div>
    </div>
  )
}

// Step: Bank Funds Only
function BankFundsOnlyStep({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Will you be paying for the property using only funds in your bank account?</Label>
      
      <InfoBox>
        You only need to answer &quot;Yes&quot; if 100% of the funds for this property are coming from cash that someone already has.
        <br /><br />
        <strong className="text-foreground">Answer &quot;No&quot; if:</strong>
        <ul className="list-disc list-inside mt-2">
          <li>You are getting a mortgage.</li>
          <li>You are selling another property that will pay for this one.</li>
        </ul>
      </InfoBox>
      
      <div className="flex flex-col gap-2">
        <PillButton
          selected={value === "yes"}
          onClick={() => onChange("yes")}
        >
          Yes
        </PillButton>
        <PillButton
          selected={value === "no"}
          onClick={() => onChange("no")}
        >
          No / I&apos;m not sure
        </PillButton>
      </div>
    </div>
  )
}

// Step: Personal Details
function PersonalDetailsStep({
  register,
  errors,
  isSubmitting,
}: {
  register: ReturnType<typeof useForm<EnquiryFormData>>["register"]
  errors: ReturnType<typeof useForm<EnquiryFormData>>["formState"]["errors"]
  isSubmitting: boolean
}) {
  return (
    <div className="space-y-4">
      <Label className="text-base">Tell us about yourself.</Label>
      
      <div className="space-y-3">
        <div>
          <Input
            placeholder="First name"
            {...register("firstName")}
            className="h-12 rounded-xl"
            disabled={isSubmitting}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <Input
            placeholder="Last name"
            {...register("lastName")}
            className="h-12 rounded-xl"
            disabled={isSubmitting}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
          )}
        </div>
        
        <div>
          <Input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="h-12 rounded-xl"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Input
            type="tel"
            placeholder="Phone number"
            {...register("phone")}
            className="h-12 rounded-xl"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Step: Quote
function QuoteStep({
  values,
  isSubmitting,
}: {
  values: EnquiryFormData
  isSubmitting: boolean
}) {
  const fees = calculateFees(values)
  
  return (
    <div className="text-center">
      {/* Logo/Brand mark */}
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-foreground flex items-center justify-center">
        <span className="text-background font-bold text-lg">HP</span>
      </div>
      
      <h2 className="text-xl font-semibold mb-1">
        If you let us handle this
      </h2>
      <p className="text-xl font-semibold mb-6">
        journey for you
      </p>
      
      {/* Main fee display */}
      <p className="text-muted-foreground mb-2">
        Our fee for your {fees.transactionLabel} would be:
      </p>
      <p className="text-4xl font-bold mb-8">
        £{fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      
      {/* Fee breakdown */}
      <div className="text-left bg-slate-50 rounded-xl p-4 mb-8">
        <h3 className="font-medium mb-3 text-sm">Fee breakdown</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Legal fee</span>
            <span>£{fees.legalFee}</span>
          </div>
          {fees.leaseholdSupplement > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Leasehold supplement</span>
              <span>£{fees.leaseholdSupplement}</span>
            </div>
          )}
          {fees.mortgageFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mortgage work</span>
              <span>£{fees.mortgageFee}</span>
            </div>
          )}
          {fees.newBuildFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">New build supplement</span>
              <span>£{fees.newBuildFee}</span>
            </div>
          )}
          {fees.companyFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company purchase</span>
              <span>£{fees.companyFee}</span>
            </div>
          )}
          {fees.giftFundsFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gift funds verification</span>
              <span>£{fees.giftFundsFee}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Subtotal</span>
            <span>£{fees.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">VAT (20%)</span>
            <span>£{fees.vat}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Disbursements (searches, Land Registry, etc.)</span>
            <span>£{fees.disbursements}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-medium">
            <span>Total</span>
            <span>£{fees.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
      
      {/* Agents section */}
      <p className="text-muted-foreground mb-4">
        Your case would directly be handled by
      </p>
      
      <div className="flex items-center justify-center gap-4 mb-4">
        {agents.map((agent, index) => (
          <div key={agent.name} className="flex items-center gap-4">
            {index > 0 && (
              <span className="text-sm text-muted-foreground">or</span>
            )}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto mb-2 overflow-hidden">
                <img 
                  src={agent.image} 
                  alt={agent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-medium text-sm">{agent.name}</p>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Experts in their field.
      </p>
    </div>
  )
}
