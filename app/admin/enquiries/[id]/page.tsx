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
  PoundSterling,
  Calendar,
  UserPlus,
  FileCheck,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Building2,
  User,
} from "lucide-react"

interface EnquiryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EnquiryDetailPage({ params }: EnquiryDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get enquiry details
  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !enquiry) {
    notFound()
  }

  // Format helpers
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
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
      case "sale": return "Sale"
      case "purchase": return "Purchase"
      case "both": return "Sale & Purchase"
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                {enquiry.first_name} {enquiry.last_name}
              </h1>
              <Badge variant="outline" className={getStatusColor(enquiry.status)}>
                {enquiry.status === "new" ? "New" :
                 enquiry.status === "reviewing" ? "Under Review" :
                 enquiry.status === "accepted" ? "Accepted" :
                 enquiry.status === "converted" ? "Converted to Case" : enquiry.status}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">
              Quote Request • {formatDate(enquiry.created_at)} at {formatTime(enquiry.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Convert to Case
          </Button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
                  <p className="mt-1 text-slate-900 font-medium">{enquiry.first_name} {enquiry.last_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <a href={`mailto:${enquiry.email}`} className="text-emerald-600 hover:underline">
                      {enquiry.email}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <a href={`tel:${enquiry.phone}`} className="text-slate-900">
                      {enquiry.phone || "Not provided"}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Transaction Type</label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline"
                      className={
                        enquiry.transaction_type === "sale" 
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : enquiry.transaction_type === "purchase"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-purple-200 bg-purple-50 text-purple-700"
                      }
                    >
                      {getTransactionLabel(enquiry.transaction_type)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Property Address</label>
                  <div className="mt-1 flex items-start gap-2">
                    <Home className="h-4 w-4 text-slate-400 mt-0.5" />
                    <p className="text-slate-900">{enquiry.property_address || "Address not provided"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Postcode</label>
                  <p className="mt-1 text-slate-900 font-mono">{enquiry.property_postcode || "—"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Property Value</label>
                  <p className="mt-1 text-slate-900 font-semibold">
                    {enquiry.property_value ? `£${enquiry.property_value.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
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
                    <p className="text-sm text-slate-900">Quote request submitted</p>
                    <p className="text-xs text-slate-500">{formatDate(enquiry.created_at)} at {formatTime(enquiry.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Quote & Actions */}
        <div className="space-y-6">
          {/* Quote Summary Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-emerald-50 py-4">
              <CardTitle className="text-base font-medium flex items-center gap-2 text-emerald-900">
                <PoundSterling className="h-4 w-4" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-slate-900">
                  £{enquiry.quote_amount?.toLocaleString() || "0"}
                </p>
                <p className="text-sm text-slate-500 mt-1">Total Quote Amount</p>
              </div>
              
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Property Value</span>
                  <span className="text-slate-900 font-medium">
                    £{enquiry.property_value?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction</span>
                  <span className="text-slate-900 font-medium">
                    {getTransactionLabel(enquiry.transaction_type)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Mail className="h-4 w-4 mr-2 text-slate-500" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Phone className="h-4 w-4 mr-2 text-slate-500" />
                Log Phone Call
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <CheckCircle2 className="h-4 w-4 mr-2 text-slate-500" />
                Update Status
              </Button>
              <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite to Onboarding
              </Button>
            </CardContent>
          </Card>

          {/* Submission Info */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>Submitted {formatDate(enquiry.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
