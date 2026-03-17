import { z } from "zod"

export const transactionTypes = [
  { value: "buying", label: "Buying" },
  { value: "selling", label: "Selling" },
  { value: "buying-selling", label: "Buying and Selling" },
  { value: "remortgage", label: "Remortgage" },
  { value: "transfer-equity", label: "Transfer of Equity" },
] as const

export const referralSources = [
  { value: "direct", label: "Direct" },
  { value: "estate-agent", label: "Estate Agent" },
  { value: "broker", label: "Mortgage Broker" },
] as const

export const enquiryFormSchema = z.object({
  // Step 1: Transaction Type
  transactionType: z.string().refine(
    (val): val is "buying" | "selling" | "buying-selling" | "remortgage" | "transfer-equity" =>
      ["buying", "selling", "buying-selling", "remortgage", "transfer-equity"].includes(val),
    { message: "Please select a transaction type" }
  ),

  // Step 2: Basic Details
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  postcode: z.string().min(5, "Please enter a valid postcode"),

  // Step 3: Property Details
  propertyPostcode: z.string().min(5, "Please enter a valid postcode"),
  estimatedValue: z.string().min(1, "Please enter an estimated value"),
  mortgageRequired: z.string().refine(
    (val): val is "yes" | "no" => ["yes", "no"].includes(val),
    { message: "Please select an option" }
  ),
  firstTimeBuyer: z.string().refine(
    (val): val is "yes" | "no" => ["yes", "no"].includes(val),
    { message: "Please select an option" }
  ),

  // Step 4: Referral Source
  referralSource: z.string().refine(
    (val): val is "direct" | "estate-agent" | "broker" =>
      ["direct", "estate-agent", "broker"].includes(val),
    { message: "Please select how you heard about us" }
  ),
})

export type EnquiryFormData = z.infer<typeof enquiryFormSchema>

// Partial schemas for step validation
export const step1Schema = enquiryFormSchema.pick({ transactionType: true })
export const step2Schema = enquiryFormSchema.pick({ fullName: true, email: true, phone: true, postcode: true })
export const step3Schema = enquiryFormSchema.pick({ propertyPostcode: true, estimatedValue: true, mortgageRequired: true, firstTimeBuyer: true })
export const step4Schema = enquiryFormSchema.pick({ referralSource: true })
