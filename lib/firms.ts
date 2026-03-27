import { createAdminClient } from "./database"

// Types
export interface Firm {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  sra_number: string | null
  address: string | null
  phone: string | null
  email: string | null
  email_domain: string | null
  website: string | null
  is_active: boolean
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface FirmTemplate {
  id: string
  firm_id: string
  template_type: string
  name: string
  subject: string | null
  html_content: string | null
  text_content: string | null
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FirmDocumentPack {
  id: string
  firm_id: string
  transaction_type: string
  name: string
  documents: Array<{
    name: string
    type: string
    required: boolean
    url?: string
  }>
  is_active: boolean
  created_at: string
  updated_at: string
}

// Template types
export const TEMPLATE_TYPES = {
  ONBOARDING_INVITE: "onboarding_invite",
  CLIENT_CARE_PURCHASE: "client_care_purchase",
  CLIENT_CARE_SALE: "client_care_sale",
  NEXT_STEPS: "next_steps",
} as const

// Get all active firms
export async function getActiveFirms(): Promise<Firm[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("firms")
    .select("*")
    .eq("is_active", true)
    .order("name")
  
  if (error) {
    console.error("Error fetching firms:", error)
    return []
  }
  
  return data || []
}

// Get a single firm by ID
export async function getFirmById(firmId: string): Promise<Firm | null> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("firms")
    .select("*")
    .eq("id", firmId)
    .single()
  
  if (error) {
    console.error("Error fetching firm:", error)
    return null
  }
  
  return data
}

// Get a single firm by slug
export async function getFirmBySlug(slug: string): Promise<Firm | null> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("firms")
    .select("*")
    .eq("slug", slug)
    .single()
  
  if (error) {
    console.error("Error fetching firm:", error)
    return null
  }
  
  return data
}

// Get firm template
export async function getFirmTemplate(
  firmId: string, 
  templateType: string
): Promise<FirmTemplate | null> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("firm_templates")
    .select("*")
    .eq("firm_id", firmId)
    .eq("template_type", templateType)
    .eq("is_active", true)
    .single()
  
  if (error) {
    console.error("Error fetching firm template:", error)
    return null
  }
  
  return data
}

// Get firm document pack
export async function getFirmDocumentPack(
  firmId: string,
  transactionType: string
): Promise<FirmDocumentPack | null> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from("firm_document_packs")
    .select("*")
    .eq("firm_id", firmId)
    .eq("transaction_type", transactionType)
    .eq("is_active", true)
    .single()
  
  if (error) {
    console.error("Error fetching document pack:", error)
    return null
  }
  
  return data
}

// Render template with variables
export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let rendered = template
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`{{${key}}}`, "g"), value || "")
  }
  return rendered
}

// Get client care template type based on transaction
export function getClientCareTemplateType(transactionType: string): string {
  if (transactionType === "selling" || transactionType === "sale") {
    return TEMPLATE_TYPES.CLIENT_CARE_SALE
  }
  // Default to purchase for buying, remortgage, etc.
  return TEMPLATE_TYPES.CLIENT_CARE_PURCHASE
}

// Assign firm to enquiry
export async function assignFirmToEnquiry(
  enquiryId: string,
  firmId: string
): Promise<boolean> {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from("enquiries")
    .update({
      firm_id: firmId,
      firm_assigned_at: new Date().toISOString(),
    })
    .eq("id", enquiryId)
  
  if (error) {
    console.error("Error assigning firm:", error)
    return false
  }
  
  // Log activity
  await adminClient.from("activity_log").insert({
    enquiry_id: enquiryId,
    actor_type: "admin",
    action: "firm_assigned",
    description: `Firm assigned to enquiry`,
    metadata: { firm_id: firmId },
  })
  
  return true
}

// Get firm with all related data
export async function getFirmWithDetails(firmId: string) {
  const adminClient = createAdminClient()
  
  const [firmResult, templatesResult, packsResult] = await Promise.all([
    adminClient.from("firms").select("*").eq("id", firmId).single(),
    adminClient.from("firm_templates").select("*").eq("firm_id", firmId).eq("is_active", true),
    adminClient.from("firm_document_packs").select("*").eq("firm_id", firmId).eq("is_active", true),
  ])
  
  if (firmResult.error || !firmResult.data) {
    return null
  }
  
  return {
    firm: firmResult.data as Firm,
    templates: (templatesResult.data || []) as FirmTemplate[],
    documentPacks: (packsResult.data || []) as FirmDocumentPack[],
  }
}
