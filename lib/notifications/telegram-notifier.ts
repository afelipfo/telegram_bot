import { sendMessage } from "../telegram/api"
import { getSupabaseServerClient } from "../supabase/server"

export async function notifyUserStatusChange(
  telegramUserId: number,
  trackingNumber: string,
  oldStatus: string,
  newStatus: string,
  response?: string,
) {
  const statusLabels: Record<string, string> = {
    pending: "⏳ Pendiente",
    in_progress: "🔄 En Proceso",
    resolved: "✅ Resuelta",
    rejected: "❌ Rechazada",
  }

  let message = `📢 *Actualización de Solicitud*\n\n`
  message += `🔢 Radicado: \`${trackingNumber}\`\n`
  message += `📍 Estado anterior: ${statusLabels[oldStatus]}\n`
  message += `📍 Estado nuevo: ${statusLabels[newStatus]}\n`

  if (response) {
    message += `\n💬 *Respuesta:*\n${response}`
  }

  try {
    await sendMessage(telegramUserId, message, { parse_mode: "Markdown" })
  } catch (error) {
    console.error("[v0] Failed to send notification:", error)
  }
}

export async function sendScheduledNotifications() {
  const supabase = await getSupabaseServerClient()

  // Get pending notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_active", true)
    .lte("scheduled_at", new Date().toISOString())
    .is("sent_at", null)

  if (!notifications || notifications.length === 0) {
    return
  }

  for (const notification of notifications) {
    try {
      // Get all active users or specific target
      const { data: users } = await supabase.from("bot_users").select("telegram_user_id").eq("is_active", true)

      if (users) {
        for (const user of users) {
          await sendMessage(user.telegram_user_id, `📢 *${notification.title}*\n\n${notification.message}`, {
            parse_mode: "Markdown",
          })
          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      // Mark as sent
      await supabase.from("notifications").update({ sent_at: new Date().toISOString() }).eq("id", notification.id)
    } catch (error) {
      console.error(`[v0] Failed to send notification ${notification.id}:`, error)
    }
  }
}

export async function sendReminders() {
  const supabase = await getSupabaseServerClient()

  // Get pending reminders
  const { data: reminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("sent", false)
    .lte("scheduled_for", new Date().toISOString())

  if (!reminders || reminders.length === 0) {
    return
  }

  for (const reminder of reminders) {
    try {
      await sendMessage(reminder.telegram_user_id, reminder.message, { parse_mode: "Markdown" })

      // Mark as sent
      await supabase.from("reminders").update({ sent: true, sent_at: new Date().toISOString() }).eq("id", reminder.id)
    } catch (error) {
      console.error(`[v0] Failed to send reminder ${reminder.id}:`, error)
    }
  }
}
