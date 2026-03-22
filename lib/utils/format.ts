// Shared formatting utilities for consistent display across the app

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-"
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function getTransactionLabel(type: string | null | undefined): string {
  if (!type) return "-"
  const labels: Record<string, string> = {
    purchase: "Purchase",
    buying: "Purchase",
    sale: "Sale",
    selling: "Sale",
    both: "Sale & Purchase",
    "buying-selling": "Sale & Purchase",
    "buying-and-selling": "Sale & Purchase",
    remortgage: "Remortgage",
    "transfer-of-equity": "Transfer of Equity",
  }
  return labels[type.toLowerCase()] || type
}

export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.[0]?.toUpperCase() || ""
  const last = lastName?.[0]?.toUpperCase() || ""
  return first + last || "?"
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}
