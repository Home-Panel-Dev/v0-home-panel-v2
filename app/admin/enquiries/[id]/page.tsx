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
  UserPlus,
  FileCheck,
  Clock,
  Building2,
  User,
  Banknote,
  FileText,
  Send,
  ChevronRight,
  Check,
  X,
} from "lucide-react"

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

  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .select("*")
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

  const getTenureLabel = (tenure: string | null) => {
    switch (tenure) {
      case "freehold": return "Freehold"
      case "leasehold": return "Leasehold"
      case "unsure": return "Not Sure"
      default: return tenure || "Not specified"
    }
  }

  const formatYesNo = (value: string | null) => {
    if (!value) return null
    return value === "yes"
  }

  const YesNoBadge = ({ value }: { value: boolean | null }) => {
    if (value === null) return <span className="text-sm text-slate-400">—</span>
    return value ? (
      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium gap-1">
        <Check className="h-3 w-3" /> Yes
      </Badge>
    ) : (
      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium gap-1">
        <X className="h-3 w-3" /> No
      </Badge>
    )
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
          <Card className="border-0 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg overflow-hidden">
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
          <Card className="bg-white border-slate-200/60 shadow-sm">
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
          <Card className="bg-white border-slate-200/60 shadow-sm">
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
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tenure</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{getTenureLabel(enquiry.tenure)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Number of Owners</label>
                  <p className="mt-1 text-slate-900 font-medium text-sm">{enquiry.owner_count || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Options */}
          <Card className="bg-white border-slate-200/60 shadow-sm">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Transaction Options
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">First-Time Buyer</label>
                  <div className="mt-2">
                    <YesNoBadge value={formatYesNo(enquiry.first_time_buyer)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">New Build</label>
                  <div className="mt-2">
                    <YesNoBadge value={formatYesNo(enquiry.is_new_build)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mortgage Required</label>
                  <div className="mt-2">
                    <YesNoBadge value={formatYesNo(enquiry.has_mortgage)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Company Purchase</label>
                  <div className="mt-2">
                    <YesNoBadge value={formatYesNo(enquiry.is_company_purchase)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Gift Funds</label>
                  <div className="mt-2">
                    <YesNoBadge value={formatYesNo(enquiry.has_gift_funds)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bank Funds Only</label>
                  <div className="mt-2">
                    <YesNoBadge value={formatYesNo(enquiry.bank_funds_only)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Quote & Actions */}
        <div className="space-y-6">
          {/* Fee Breakdown */}
          <Card className="bg-white border-slate-200/60 shadow-sm">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
                <Banknote className="h-4 w-4 text-slate-400" />
                Fee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-slate-600">Legal Fee</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.legal_fee)}</span>
                </div>
                {enquiry.leasehold_supplement > 0 && (
                  <div className="px-6 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600">Leasehold Supplement</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.leasehold_supplement)}</span>
                  </div>
                )}
                {enquiry.mortgage_fee > 0 && (
                  <div className="px-6 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600">Mortgage Work</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.mortgage_fee)}</span>
                  </div>
                )}
                {enquiry.new_build_fee > 0 && (
                  <div className="px-6 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600">New Build Supplement</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.new_build_fee)}</span>
                  </div>
                )}
                {enquiry.company_fee > 0 && (
                  <div className="px-6 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600">Company Purchase</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.company_fee)}</span>
                  </div>
                )}
                {enquiry.gift_funds_fee > 0 && (
                  <div className="px-6 py-3 flex justify-between items-center">
                    <span className="text-sm text-slate-600">Gift Funds Verification</span>
                    <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.gift_funds_fee)}</span>
                  </div>
                )}
                <div className="px-6 py-3 flex justify-between items-center bg-slate-50/50">
                  <span className="text-sm text-slate-600">Subtotal</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.subtotal)}</span>
                </div>
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-slate-600">VAT (20%)</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.vat)}</span>
                </div>
                <div className="px-6 py-3 flex justify-between items-center">
                  <span className="text-sm text-slate-600">Disbursements</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(enquiry.disbursements)}</span>
                </div>
                <div className="px-6 py-4 flex justify-between items-center bg-emerald-50">
                  <span className="text-sm font-semibold text-emerald-900">Total</span>
                  <span className="font-bold text-emerald-900">{formatCurrency(enquiry.quote_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border-slate-200/60 shadow-sm">
            <CardHeader className="border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-semibold tracking-tight">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-between group h-10" size="sm">
                <span className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Send Email
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button variant="outline" className="w-full justify-between group h-10" size="sm">
                <span className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-slate-400" />
                  Log Phone Call
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button variant="outline" className="w-full justify-between group h-10" size="sm">
                <span className="flex items-center gap-2 text-sm">
                  <FileCheck className="h-4 w-4 text-slate-400" />
                  Update Status
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <div className="pt-2">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 justify-center gap-2 h-10 font-medium" size="sm">
                  <UserPlus className="h-4 w-4" />
                  Invite to Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-white border-slate-200/60 shadow-sm">
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
