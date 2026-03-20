// Enquiry Detail Page - Last updated: March 2026
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, Home, Calendar, FileCheck, Clock, Building2, User, Banknote, Send, ChevronRight, UserPlus } from "lucide-react"
import { InviteClientButton } from "@/components/admin/invite-client-button"

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Select only columns that exist in the database
  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      property_address,
      property_postcode,
      transaction_type,
      property_value,
      quote_amount,
      status,
      created_at
    `)
    .eq("id", id)
    .single()

  if (error || !enquiry) {
    notFound()
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—"
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: "bg-blue-50 text-blue-700 border-blue-200",
      under_review: "bg-amber-50 text-amber-700 border-amber-200",
      accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      onboarding: "bg-purple-50 text-purple-700 border-purple-200",
      active: "bg-green-50 text-green-700 border-green-200",
      completed: "bg-slate-50 text-slate-700 border-slate-200",
      rejected: "bg-red-50 text-red-700 border-red-200"
    }
    const labels: Record<string, string> = {
      new: "New",
      under_review: "Under Review",
      accepted: "Accepted",
      onboarding: "Onboarding",
      active: "Active",
      completed: "Completed",
      rejected: "Rejected"
    }
    return (
      <Badge variant="outline" className={`${styles[status] || styles.new} font-medium`}>
        {labels[status] || status}
      </Badge>
    )
  }

  const getTransactionLabel = (type: string) => {
    const labels: Record<string, string> = {
      buying: "Buying",
      selling: "Selling",
      "buying-and-selling": "Buying & Selling",
      remortgage: "Remortgage",
      "transfer-of-equity": "Transfer of Equity"
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                {enquiry.first_name} {enquiry.last_name}
              </h1>
              {getStatusBadge(enquiry.status)}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Enquiry #{enquiry.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Message
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-medium" size="sm">
            <UserPlus className="h-4 w-4" />
            Convert to Case
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Hero Card */}
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">Quote Amount</p>
                  <p className="text-3xl font-bold">{formatCurrency(enquiry.quote_amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm mb-1">{getTransactionLabel(enquiry.transaction_type)}</p>
                  <p className="text-emerald-100 text-sm flex items-center justify-end gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(enquiry.created_at).split(",")[0]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{enquiry.first_name} {enquiry.last_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
                  <a href={`mailto:${enquiry.email}`} className="mt-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {enquiry.email}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</label>
                  {enquiry.phone ? (
                    <a href={`tel:${enquiry.phone}`} className="mt-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {enquiry.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-slate-400 text-sm">Not provided</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction Type</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{getTransactionLabel(enquiry.transaction_type)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Property Address</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm flex items-start gap-2">
                    <Home className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    {enquiry.property_address || "Not yet provided"}
                    {enquiry.property_postcode && `, ${enquiry.property_postcode}`}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Property Value</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{formatCurrency(enquiry.property_value)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Banknote className="h-4 w-4 text-slate-400" />
                Fee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {(() => {
                  const propertyValue = Number(enquiry.property_value) || 0
                  let legalFee = 595
                  if (propertyValue > 250000) legalFee = 695
                  if (propertyValue > 500000) legalFee = 895
                  if (propertyValue > 1000000) legalFee = 1295
                  
                  const subtotal = legalFee
                  const vat = Math.round(subtotal * 0.2)
                  const landRegistryFee = propertyValue > 500000 ? 295 : propertyValue > 250000 ? 150 : 100
                  const searchFees = 300
                  const bankTransferFee = 35
                  
                  return (
                    <>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Legal Fee</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(legalFee)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center bg-slate-50/50">
                        <span className="text-sm text-slate-600">Subtotal</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">VAT (20%)</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(vat)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Search Fees</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(searchFees)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Land Registry Fee</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(landRegistryFee)}</span>
                      </div>
                      <div className="px-6 py-3 flex justify-between items-center">
                        <span className="text-sm text-slate-600">Bank Transfer Fee</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(bankTransferFee)}</span>
                      </div>
                      <div className="px-6 py-4 flex justify-between items-center bg-emerald-50">
                        <span className="text-sm font-semibold text-emerald-900">Total</span>
                        <span className="font-bold text-emerald-900">{formatCurrency(enquiry.quote_amount)}</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Timeline */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <a href={`mailto:${enquiry.email}?subject=Your HomePanel Quote Request`}>
                <Button variant="outline" className="w-full justify-between group h-10" size="sm">
                  <span className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Send Email
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </a>
              {enquiry.phone && (
                <a href={`tel:${enquiry.phone}`}>
                  <Button variant="outline" className="w-full justify-between group h-10 mt-2" size="sm">
                    <span className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      Call {enquiry.phone}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </a>
              )}
              <div className="pt-2">
                <InviteClientButton 
                  enquiryId={enquiry.id}
                  clientName={`${enquiry.first_name} ${enquiry.last_name}`}
                  currentStatus={enquiry.status}
                />
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-white border-slate-200/60">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Quote submitted</p>
                    <p className="text-xs text-slate-500">{formatDate(enquiry.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Confirmation email sent</p>
                    <p className="text-xs text-slate-500">Automated</p>
                  </div>
                </div>
                {enquiry.status === "onboarding" && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Onboarding invite sent</p>
                      <p className="text-xs text-slate-500">Magic link email</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
