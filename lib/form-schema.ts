import { z } from "zod"

export const transactionTypes = [
  { value: "buying", label: "Buying" },
  { value: "selling", label: "Selling" },
  { value: "buying-selling", label: "Buying & Selling" },
  { value: "remortgage", label: "Remortgaging" },
  { value: "transfer-equity", label: "To transfer ownership" },
] as const

export const tenureTypes = [
  { value: "freehold", label: "Freehold" },
  { value: "leasehold", label: "Leasehold" },
  { value: "unsure", label: "I'm not sure" },
] as const

export const ownerCountOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5+", label: "5+" },
] as const

export const propertyCountOptions = [
  { value: "one-or-less", label: "Just one or less" },
  { value: "more-than-one", label: "More than one" },
] as const

export const enquiryFormSchema = z.object({
  // Terms and Conditions (required)
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions to continue",
  }),
  marketingConsent: z.boolean().optional(),
  
  // Product Interests (optional)
  interestSolar: z.boolean().optional(),
  interestBoiler: z.boolean().optional(),

  // Step 1: Transaction Type
  transactionType: z.string().min(1, "Please select a transaction type"),

  // Property Address
  propertyAddressLine1: z.string().optional(),
  propertyAddressLine2: z.string().optional(),
  propertyCity: z.string().optional(),
  propertyPostcode: z.string().optional(),
  propertyAddressUnknown: z.boolean().optional(),

  // Property Details
  tenure: z.string().optional(),
  propertyValue: z.string().optional(),
  ownerCount: z.string().optional(),
  
  // First time buyer and property count
  firstTimeBuyer: z.string().optional(),
  propertyCount: z.string().optional(),
  
  // New build
  isNewBuild: z.string().optional(),
  
  // Mortgage
  hasMortgage: z.string().optional(),
  
  // Company purchase
  isCompanyPurchase: z.string().optional(),
  
  // Gift funds
  hasGiftFunds: z.string().optional(),
  
  // Bank funds only
  bankFundsOnly: z.string().optional(),

  // Personal Details
  firstName: z.string().min(1, "Please enter your first name"),
  lastName: z.string().min(1, "Please enter your last name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
})

export type EnquiryFormData = z.infer<typeof enquiryFormSchema>

// Partial schemas for step validation
export const transactionTypeSchema = enquiryFormSchema.pick({ transactionType: true })
export const propertyAddressSchema = z.object({
  propertyAddressLine1: z.string().optional(),
  propertyPostcode: z.string().optional(),
  propertyAddressUnknown: z.boolean().optional(),
}).refine(
  (data) => data.propertyAddressUnknown || (data.propertyPostcode && data.propertyPostcode.length >= 5),
  { message: "Please enter a postcode or check 'I don't know it yet'" }
)
export const tenureSchema = z.object({ tenure: z.string().min(1, "Please select an option") })
export const propertyValueSchema = z.object({ propertyValue: z.string().min(1, "Please enter a value") })
export const ownerCountSchema = z.object({ ownerCount: z.string().min(1, "Please select an option") })
export const firstTimeBuyerSchema = z.object({ firstTimeBuyer: z.string().min(1, "Please select an option") })
export const propertyCountSchema = z.object({ propertyCount: z.string().min(1, "Please select an option") })
export const isNewBuildSchema = z.object({ isNewBuild: z.string().min(1, "Please select an option") })
export const hasMortgageSchema = z.object({ hasMortgage: z.string().min(1, "Please select an option") })
export const isCompanyPurchaseSchema = z.object({ isCompanyPurchase: z.string().min(1, "Please select an option") })
export const hasGiftFundsSchema = z.object({ hasGiftFunds: z.string().min(1, "Please select an option") })
export const bankFundsOnlySchema = z.object({ bankFundsOnly: z.string().min(1, "Please select an option") })
export const personalDetailsSchema = enquiryFormSchema.pick({ firstName: true, lastName: true, email: true, phone: true })
