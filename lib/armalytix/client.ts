/**
 * HomePanel v2 - Armalytix API Client
 * Integration for Identity Verification and Source of Funds checks
 * 
 * Armalytix provides:
 * - Identity Service (ID verification via passport/driving licence)
 * - Source of Funds Check (Open Banking based fund verification)
 */

const ARMALYTIX_API_URL = process.env.ARMALYTIX_API_URL || "https://api.armalytix.com/v1"
const ARMALYTIX_API_KEY = process.env.ARMALYTIX_API_KEY

export interface ArmalytixClient {
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: {
    line1: string
    line2?: string
    city: string
    postcode: string
    country?: string
  }
}

export interface ArmalytixCaseRequest {
  client: ArmalytixClient
  transactionType: string
  propertyValue?: number
  propertyAddress?: string
  referenceId: string // Our internal enquiry/case ID
  callbackUrl?: string
  checkTypes: ("identity" | "source_of_funds")[]
}

export interface ArmalytixCaseResponse {
  success: boolean
  caseId?: string
  identityCheckUrl?: string
  sourceOfFundsUrl?: string
  status?: string
  error?: string
}

export interface ArmalytixWebhookPayload {
  eventType: "identity_complete" | "sof_complete" | "case_complete" | "case_failed"
  caseId: string
  referenceId: string
  status: "pending" | "approved" | "flagged" | "failed"
  checkType?: "identity" | "source_of_funds"
  riskLevel?: "low" | "medium" | "high"
  details?: Record<string, unknown>
  completedAt?: string
}

/**
 * Check if Armalytix is configured
 */
export function isArmalytixConfigured(): boolean {
  return Boolean(ARMALYTIX_API_KEY)
}

/**
 * Create a new Armalytix case for a client
 * This initiates both identity verification and source of funds checks
 */
export async function createArmalytixCase(
  request: ArmalytixCaseRequest
): Promise<ArmalytixCaseResponse> {
  if (!ARMALYTIX_API_KEY) {
    console.warn("[armalytix] API key not configured, using demo mode")
    return createDemoCase(request)
  }

  try {
    const response = await fetch(`${ARMALYTIX_API_URL}/cases`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ARMALYTIX_API_KEY}`,
        "X-Api-Version": "2024-01",
      },
      body: JSON.stringify({
        client: {
          first_name: request.client.firstName,
          last_name: request.client.lastName,
          email: request.client.email,
          phone: request.client.phone,
          date_of_birth: request.client.dateOfBirth,
          address: request.client.address ? {
            line1: request.client.address.line1,
            line2: request.client.address.line2,
            city: request.client.address.city,
            postcode: request.client.address.postcode,
            country: request.client.address.country || "GB",
          } : undefined,
        },
        transaction: {
          type: request.transactionType,
          property_value: request.propertyValue,
          property_address: request.propertyAddress,
        },
        reference_id: request.referenceId,
        callback_url: request.callbackUrl,
        check_types: request.checkTypes,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[armalytix] API error:", errorData)
      return {
        success: false,
        error: errorData.message || `API error: ${response.status}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      caseId: data.case_id,
      identityCheckUrl: data.identity_check_url,
      sourceOfFundsUrl: data.source_of_funds_url,
      status: data.status,
    }
  } catch (error) {
    console.error("[armalytix] Request failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Request failed",
    }
  }
}

/**
 * Get case status from Armalytix
 */
export async function getArmalytixCaseStatus(caseId: string): Promise<{
  success: boolean
  status?: string
  identityStatus?: string
  sourceOfFundsStatus?: string
  riskLevel?: string
  error?: string
}> {
  if (!ARMALYTIX_API_KEY) {
    return { success: true, status: "pending", identityStatus: "pending", sourceOfFundsStatus: "pending" }
  }

  try {
    const response = await fetch(`${ARMALYTIX_API_URL}/cases/${caseId}`, {
      headers: {
        "Authorization": `Bearer ${ARMALYTIX_API_KEY}`,
        "X-Api-Version": "2024-01",
      },
    })

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    return {
      success: true,
      status: data.status,
      identityStatus: data.identity_check?.status,
      sourceOfFundsStatus: data.source_of_funds_check?.status,
      riskLevel: data.risk_level,
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Request failed" }
  }
}

/**
 * Generate client portal URL for specific check
 */
export async function getArmalytixCheckUrl(
  caseId: string,
  checkType: "identity" | "source_of_funds"
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!ARMALYTIX_API_KEY) {
    // Demo mode - return placeholder URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://v0-home-panel-v2.vercel.app"
    return {
      success: true,
      url: checkType === "identity"
        ? `https://verify.armalytix.com/identity/demo?ref=${caseId}`
        : `https://verify.armalytix.com/sof/demo?ref=${caseId}`,
    }
  }

  try {
    const response = await fetch(`${ARMALYTIX_API_URL}/cases/${caseId}/check-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ARMALYTIX_API_KEY}`,
        "X-Api-Version": "2024-01",
      },
      body: JSON.stringify({ check_type: checkType }),
    })

    if (!response.ok) {
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, url: data.url }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Request failed" }
  }
}

/**
 * Demo mode case creation (when API key not configured)
 */
function createDemoCase(request: ArmalytixCaseRequest): ArmalytixCaseResponse {
  const demoId = `DEMO-${Date.now().toString(36).toUpperCase()}`
  return {
    success: true,
    caseId: demoId,
    identityCheckUrl: request.checkTypes.includes("identity")
      ? `https://verify.armalytix.com/identity/demo?ref=${demoId}`
      : undefined,
    sourceOfFundsUrl: request.checkTypes.includes("source_of_funds")
      ? `https://verify.armalytix.com/sof/demo?ref=${demoId}`
      : undefined,
    status: "pending",
  }
}

/**
 * Validate Armalytix webhook signature
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) return true // Skip validation if no secret configured
  
  const crypto = require("crypto")
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
