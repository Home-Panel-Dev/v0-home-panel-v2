// Server-side Supabase client
import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Home,
  Calendar,
  FileCheck,
  Clock,
  Building2,
  User,
  Banknote,
  Send,
  ChevronRight,
  UserPlus,
} from "lucide-react"
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
  // Add more columns once you run the ALTER TABLE SQL to add them
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "£0.00"
    return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "border-blue-200 bg-blue-50 text-blue-700"
      case "reviewing": return "border-amber-200 bg-amber-50 text-amber-700"
      case "accepted": return "border-emerald-200 bg-emerald-50 text-emerald-700"
      case "converted": return "border-purple-200 bg-purple-50 text-purple-700"
      default: return "border-slate-200 bg-slate-50 text-slate-700"
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "buying": return "Purchase"
      case "selling": return "Sale"
      case "buying-selling": return "Sale & Purchase"
      case "remortgage": return "Remortgage"
      case "transfer-equity": return "Transfer of Equity"
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {enquiry.first_name} {enquiry.last_name}
              </h1>
              <Badge variant="outline" className={`${getStatusColor(enquiry.status)} text-xs font-medium px-2.5 py-0.5`}>
                {enquiry.status === "new" ? "New Request" :
                 enquiry.status === "reviewing" ? "Under Review" :
                 enquiry.status === "accepted" ? "Accepted" :
                 enquiry.status === "converted" ? "Converted to Case" : enquiry.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Submitted {formatDate(enquiry.created_at)} at {formatTime(enquiry.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 font-medium">
            <Send className="h-4 w-4" />
            Send Quote
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-medium" size="sm">
            <UserPlus className="h-4 w-4" />
            Convert to Case
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quote Summary - Hero Card */}
          <Card className="border-0 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white  overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Total Quote</p>
                  <p className="text-4xl font-bold tracking-tight mt-1">{formatCurrency(enquiry.quote_amount)}</p>
                  <p className="text-emerald-100 text-sm mt-2">
                    {getTransactionLabel(enquiry.transaction_type)} • {enquiry.property_postcode || "Postcode TBC"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <Banknote className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="bg-white border-slate-200/60 ">
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
                  <p className="mt-1 text-slate-900 font-medium">{enquiry.first_name} {enquiry.last_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Transaction Type</label>
                  <div className="mt-1.5">
                    <Badge 
                      variant="outline"
                      className={`text-xs font-medium ${
                        enquiry.transaction_type === "selling" 
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : enquiry.transaction_type === "buying"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-purple-200 bg-purple-50 text-purple-700"
                      }`}
                    >
                      {getTransactionLabel(enquiry.transaction_type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${enquiry.email}`} className="text-emerald-600 hover:underline font-medium text-sm">
                      {enquiry.email}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${enquiry.phone}`} className="text-slate-900 font-medium text-sm">
                      {enquiry.phone || "Not provided"}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="bg-white border-slate-200/60 ">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Property Address</label>
                  <div className="mt-1 flex items-start gap-2">
                    <Home className="h-4 w-4 text-slate-400 mt-0.5" />
                    <p className="text-slate-900 font-medium text-sm">{enquiry.property_address || "Address not provided yet"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Postcode</label>
                  <p className="mt-1 text-slate-900 font-mono font-semibold">{enquiry.property_postcode || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Property Value</label>
                  <p className="mt-1 text-slate-900 font-semibold">
                    {enquiry.property_value ? `£${Number(enquiry.property_value).toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Quote & Actions */}
        <div className="space-y-6">
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
                  // Calculate fees based on property value
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
                  const disbursements = landRegistryFee + searchFees + bankTransferFee
                  
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
                  <Button variant="outline" className="w-full justify-between group h-10" size="sm">
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
          <Card className="bg-white border-slate-200/60 ">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileCheck className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Quote submitted</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(enquiry.created_at)} at {formatTime(enquiry.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Confirmation email sent</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(enquiry.created_at)} at {formatTime(enquiry.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
