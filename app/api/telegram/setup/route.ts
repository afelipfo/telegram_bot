import { type NextRequest, NextResponse } from "next/server"
import { setWebhook, getWebhookInfo } from "@/lib/telegram/bot-setup"

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json()

    if (!webhookUrl) {
      return NextResponse.json({ error: "webhookUrl is required" }, { status: 400 })
    }

    const success = await setWebhook(webhookUrl)

    if (success) {
      return NextResponse.json({ success: true, message: "Webhook configured successfully" })
    } else {
      return NextResponse.json({ success: false, message: "Failed to configure webhook" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const info = await getWebhookInfo()
    return NextResponse.json({ webhookInfo: info })
  } catch (error) {
    console.error("[v0] Get webhook info error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
