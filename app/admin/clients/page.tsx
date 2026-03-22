import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, Mail, Phone, FileText } from "lucide-react"

export default async function AdminClientsPage() {
  const supabase = await createClient()

  // Get all clients with their case counts
  const { data: clients } = await supabase
    .from("profiles")
    .select(`
      *,
      cases (id, status)
    `)
    .eq("role", "client")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-slate-600">
          Manage all registered clients
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search clients by name or email..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients && clients.length > 0 ? (
          clients.map((client) => {
            const activeCases = client.cases?.filter((c: any) => c.status !== "completed").length || 0
            const totalCases = client.cases?.length || 0

            return (
              <Card key={client.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 font-semibold text-lg">
                        {client.first_name?.charAt(0) || client.email?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {client.first_name} {client.last_name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-1 text-sm text-slate-600 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {activeCases} active / {totalCases} total
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/cases?client=${client.id}`}>
                        View Cases
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500">No clients found</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
