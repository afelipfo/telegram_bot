import { NextResponse } from "next/server"
import { sendScheduledNotifications, sendReminders } from "@/lib/notifications/telegram-notifier"

export async function GET() {
  try {
    await sendScheduledNotifications()
    await sendReminders()

    return NextResponse.json({ success: true, message: "Notifications processed" })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json({ error: "Failed to process notifications" }, { status: 500 })
  }
}
