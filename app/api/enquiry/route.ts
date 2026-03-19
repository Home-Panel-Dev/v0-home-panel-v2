import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"
import type { EnquiryFormData } from "@/lib/form-schema"
import { getCustomerConfirmationEmail, getInternalAlertEmail } from "@/lib/email-templates"

const INTERNAL_EMAIL = process.env.INTERNAL_EMAIL || "joshua@madebymclean.com"
const FROM_EMAIL = process.env.FROM_EMAIL || "HomePanel <onboarding@resend.dev>"

const submitSchema = z.object({
  transactionType: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
}).passthrough()

// Fee calculation matching the form exactly
function calculateFees(data: EnquiryFormData) {
  const propertyValue = parseFloat(data.propertyValue?.replace(/,/g, "") || "0")
  
  // Base legal fee based on property value
  let legalFee = 595
  if (propertyValue > 250000) legalFee = 695
  if (propertyValue > 500000) legalFee = 895
  if (propertyValue > 1000000) legalFee = 1295
  
  // Additional fees
  const isLeasehold = data.tenure === "leasehold"
  const hasMortgage = data.hasMortgage === "yes"
  const isNewBuild = data.isNewBuild === "yes"
  const isCompanyPurchase = data.isCompanyPurchase === "yes"
  const hasGiftFunds = data.hasGiftFunds === "yes"
  
  const leaseholdFee = isLeasehold ? 195 : 0
  const mortgageFee = hasMortgage ? 95 : 0
  const newBuildFee = isNewBuild ? 195 : 0
  const companyPurchaseFee = isCompanyPurchase ? 295 : 0
  const giftFundsFee = hasGiftFunds ? 50 : 0
  
  const subtotal = legalFee + leaseholdFee + mortgageFee + newBuildFee + companyPurchaseFee + giftFundsFee
  const vat = Math.round(subtotal * 0.2)
  
  // Disbursements
  const searchFees = 300
  const landRegistryFee = propertyValue > 500000 ? 295 : propertyValue > 250000 ? 150 : 100
  const bankTransferFee = 35
  const disbursements = searchFees + landRegistryFee + bankTransferFee
  
  const total = subtotal + vat + disbursements
  
  return {
    legalFee,
    mortgageFee,
    newBuildFee,
    companyPurchaseFee,
    giftFundsFee,
    subtotal,
    vat,
    disbursements,
    total
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = submitSchema.parse(body) as EnquiryFormData
    const fees = calculateFees(validatedData)
    
    // Parse property value to number
    const propertyValue = parseFloat(validatedData.propertyValue?.replace(/,/g, "") || "0")

    // Save to Supabase with ALL fields
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const insertData = {
        // Contact details
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        
        // Property details
        property_address: validatedData.propertyAddressLine1 || null,
        property_postcode: validatedData.propertyPostcode || null,
        transaction_type: validatedData.transactionType,
        tenure: validatedData.tenure || null,
        property_value: propertyValue || null,
        owner_count: validatedData.ownerCount ? parseInt(validatedData.ownerCount) : null,
        
        // Boolean flags (convert "yes"/"no" to boolean)
        first_time_buyer: validatedData.firstTimeBuyer === "yes",
        new_build: validatedData.isNewBuild === "yes",
        mortgage: validatedData.hasMortgage === "yes",
        company_purchase: validatedData.isCompanyPurchase === "yes",
        gift_funds: validatedData.hasGiftFunds === "yes",
        bank_funds_only: validatedData.bankFundsOnly === "yes",
        
        // Quote breakdown
        legal_fees: fees.legalFee,
        mortgage_work_fee: fees.mortgageFee,
        new_build_fee: fees.newBuildFee,
        company_purchase_fee: fees.companyPurchaseFee,
        gift_funds_fee: fees.giftFundsFee,
        subtotal: fees.subtotal,
        vat: fees.vat,
        disbursements: fees.disbursements,
        quote_amount: fees.total,
        
        // Status
        status: "new"
      }
      
      const { error: dbError } = await supabase
        .from("enquiries")
        .insert(insertData)
      
      if (dbError) {
        console.error("Database insert error:", dbError.message)
      }
    }

    // Send emails
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const customerEmail = getCustomerConfirmationEmail(validatedData)
      const internalEmail = getInternalAlertEmail(validatedData)

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: INTERNAL_EMAIL,
          subject: internalEmail.subject,
          html: internalEmail.html,
          text: internalEmail.text,
        })
      } catch (e) {
        console.error("Internal email failed:", e)
      }

      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: validatedData.email,
          subject: customerEmail.subject,
          html: customerEmail.html,
          text: customerEmail.text,
        })
      } catch (e) {
        console.error("Customer email failed:", e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Enquiry submission error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 })
  }
}
