// HomePanel Enquiry API - saves to database and sends emails
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

// Calculate fees (same logic as form)
function calculateFees(data: EnquiryFormData) {
  let baseFee = 595
  if (data.transactionType === "sale-purchase") baseFee = 995
  
  let supplements = 0
  if (data.newBuild) supplements += 150
  if (data.mortgage) supplements += 150
  if (data.companyPurchase) supplements += 250
  if (data.giftFunds) supplements += 100
  
  const legalFees = baseFee + supplements
  const vat = legalFees * 0.2
  const disbursements = 350 + (data.propertyValue ? Math.round(data.propertyValue * 0.002) : 0)
  const total = legalFees + vat + disbursements
  
  return { legalFees, vat, disbursements, total }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = submitSchema.parse(body) as EnquiryFormData
    const fees = calculateFees(validatedData)

    // Save to database using service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const { error: dbError } = await supabase
        .from("enquiries")
        .insert({
          transaction_type: validatedData.transactionType,
          property_address: validatedData.propertyAddress || null,
          postcode: validatedData.postcode || null,
          tenure: validatedData.tenure || null,
          property_value: validatedData.propertyValue || null,
          owner_count: validatedData.ownerCount || null,
          first_time_buyer: validatedData.firstTimeBuyer || false,
          property_count: validatedData.propertyCount || null,
          new_build: validatedData.newBuild || false,
          mortgage: validatedData.mortgage || false,
          company_purchase: validatedData.companyPurchase || false,
          gift_funds: validatedData.giftFunds || false,
          bank_funds_only: validatedData.bankFundsOnly || false,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone || null,
          quote_amount: fees.total,
          legal_fees: fees.legalFees,
          disbursements: fees.disbursements,
          status: "new"
        })
      
      if (dbError) {
        console.error("Database error:", dbError.message)
      }
    }

    // Send emails if RESEND_API_KEY is configured
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      const { Resend } = await import("resend")
      const resend = new Resend(apiKey)
      
      const customerEmail = getCustomerConfirmationEmail(validatedData)
      const internalEmail = getInternalAlertEmail(validatedData)

      // Send internal alert email
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: INTERNAL_EMAIL,
          subject: internalEmail.subject,
          html: internalEmail.html,
          text: internalEmail.text,
        })
      } catch (e) {
        console.error("Failed to send internal email:", e)
      }

      // Send customer confirmation email
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: validatedData.email,
          subject: customerEmail.subject,
          html: customerEmail.html,
          text: customerEmail.text,
        })
      } catch (e) {
        console.error("Failed to send customer email:", e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting enquiry:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 })
  }
}
