"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export default function SetupAdminPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const createAdmin = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/setup-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: "create-homepanel-admin" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin")
      }

      setStatus("success")
      setMessage(data.message)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Unknown error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.svg" alt="HomePanel" className="h-12 w-12 mx-auto mb-4" />
          <CardTitle>Setup Admin Account</CardTitle>
          <CardDescription>
            Create the initial admin user for HomePanel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-100 p-4 text-sm">
            <p className="font-medium">Admin credentials:</p>
            <p className="text-muted-foreground">Email: joshua@madebymclean.com</p>
            <p className="text-muted-foreground">Password: admin</p>
          </div>

          {status === "success" && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-800">Success!</p>
                <p className="text-sm text-emerald-700">{message}</p>
                <a href="/auth/login" className="text-sm text-emerald-600 underline mt-2 inline-block">
                  Go to login
                </a>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{message}</p>
              </div>
            </div>
          )}

          <Button
            onClick={createAdmin}
            disabled={status === "loading" || status === "success"}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "success" ? "Admin Created" : "Create Admin Account"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Delete this page and /api/setup-admin after creating the admin account
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
