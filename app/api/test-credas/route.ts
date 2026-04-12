import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.CREDAS_API_KEY
  const baseUrl = process.env.CREDAS_BASE_URL || "https://portal.credasdemo.com/api"

  // Try with raw key (no Bearer)
  const response = await fetch(`${baseUrl}/v2/ci/journeys`, {
    headers: {
      "Authorization": apiKey || "",
      "Content-Type": "application/json",
    },
  })

  const data = await response.json()
  return NextResponse.json({ status: response.status, data })
}
