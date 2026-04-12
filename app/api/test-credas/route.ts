import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://portal.credasdemo.com/api/v2/ci/journeys", {
      headers: {
        "Authorization": `Bearer ${process.env.CREDAS_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
