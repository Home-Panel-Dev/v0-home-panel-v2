/**
 * HomePanel v2 - Error Handling System
 * Provides consistent error handling across the application
 * SOC2 Ready: Structured logging, safe client messages
 */

// Error codes for categorization
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  
  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  
  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",
  
  // Operations
  OPERATION_FAILED: "OPERATION_FAILED",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  
  // File operations
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  
  // Business logic
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  COMPLIANCE_CHECK_REQUIRED: "COMPLIANCE_CHECK_REQUIRED",
  DOCUMENT_REQUIRED: "DOCUMENT_REQUIRED",
  
  // Generic
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// HTTP status code mapping
const statusCodeMap: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SESSION_EXPIRED: 401,
  INVALID_TOKEN: 401,
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  MISSING_REQUIRED_FIELD: 400,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  CONFLICT: 409,
  OPERATION_FAILED: 500,
  DATABASE_ERROR: 500,
  EXTERNAL_SERVICE_ERROR: 502,
  RATE_LIMITED: 429,
  FILE_TOO_LARGE: 413,
  INVALID_FILE_TYPE: 415,
  UPLOAD_FAILED: 500,
  INVALID_STATUS_TRANSITION: 422,
  COMPLIANCE_CHECK_REQUIRED: 422,
  DOCUMENT_REQUIRED: 422,
  INTERNAL_ERROR: 500,
  UNKNOWN_ERROR: 500,
}

// Safe client-facing messages (no internal details exposed)
const safeMessages: Record<ErrorCode, string> = {
  UNAUTHORIZED: "Please sign in to continue",
  FORBIDDEN: "You don't have permission to perform this action",
  SESSION_EXPIRED: "Your session has expired. Please sign in again",
  INVALID_TOKEN: "Invalid authentication token",
  VALIDATION_ERROR: "Please check your input and try again",
  INVALID_INPUT: "The provided input is invalid",
  MISSING_REQUIRED_FIELD: "Required information is missing",
  NOT_FOUND: "The requested resource was not found",
  ALREADY_EXISTS: "This resource already exists",
  CONFLICT: "This action conflicts with the current state",
  OPERATION_FAILED: "The operation could not be completed. Please try again",
  DATABASE_ERROR: "A database error occurred. Please try again",
  EXTERNAL_SERVICE_ERROR: "An external service is temporarily unavailable",
  RATE_LIMITED: "Too many requests. Please wait and try again",
  FILE_TOO_LARGE: "The file is too large",
  INVALID_FILE_TYPE: "This file type is not supported",
  UPLOAD_FAILED: "File upload failed. Please try again",
  INVALID_STATUS_TRANSITION: "This status change is not allowed",
  COMPLIANCE_CHECK_REQUIRED: "Compliance verification is required",
  DOCUMENT_REQUIRED: "Required documents are missing",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again",
  UNKNOWN_ERROR: "Something went wrong. Please try again",
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>
  public readonly isOperational: boolean
  public readonly timestamp: string

  constructor(
    code: ErrorCode,
    message?: string,
    details?: Record<string, unknown>
  ) {
    super(message || safeMessages[code])
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCodeMap[code]
    this.details = details
    this.isOperational = true
    this.timestamp = new Date().toISOString()

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Get safe message for client response
   */
  getSafeMessage(): string {
    return safeMessages[this.code]
  }

  /**
   * Convert to API response format
   */
  toResponse(): ApiErrorResponse {
    return {
      ok: false,
      error: {
        code: this.code,
        message: this.getSafeMessage(),
      },
    }
  }

  /**
   * Convert to log format (includes internal details)
   */
  toLogFormat(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

/**
 * Standard API response types
 */
export interface ApiSuccessResponse<T = unknown> {
  ok: true
  data: T
}

export interface ApiErrorResponse {
  ok: false
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Create success response
 */
export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { ok: true, data }
}

/**
 * Create error response from AppError
 */
export function errorResponse(error: AppError): ApiErrorResponse {
  return error.toResponse()
}

/**
 * Create error response from unknown error
 */
export function handleError(error: unknown): {
  response: ApiErrorResponse
  statusCode: number
  logData: Record<string, unknown>
} {
  // Already an AppError
  if (error instanceof AppError) {
    return {
      response: error.toResponse(),
      statusCode: error.statusCode,
      logData: error.toLogFormat(),
    }
  }

  // Standard Error
  if (error instanceof Error) {
    const appError = new AppError(
      ErrorCodes.INTERNAL_ERROR,
      error.message,
      { originalError: error.name }
    )
    return {
      response: appError.toResponse(),
      statusCode: appError.statusCode,
      logData: {
        ...appError.toLogFormat(),
        originalStack: error.stack,
      },
    }
  }

  // Unknown error type
  const appError = new AppError(ErrorCodes.UNKNOWN_ERROR)
  return {
    response: appError.toResponse(),
    statusCode: appError.statusCode,
    logData: {
      ...appError.toLogFormat(),
      originalError: String(error),
    },
  }
}

/**
 * Validation helper - throws AppError if validation fails
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): asserts value {
  if (value === undefined || value === null || value === "") {
    throw new AppError(
      ErrorCodes.MISSING_REQUIRED_FIELD,
      `${fieldName} is required`,
      { field: fieldName }
    )
  }
}

/**
 * Assert condition or throw AppError
 */
export function assertCondition(
  condition: boolean,
  code: ErrorCode,
  message?: string,
  details?: Record<string, unknown>
): asserts condition {
  if (!condition) {
    throw new AppError(code, message, details)
  }
}
