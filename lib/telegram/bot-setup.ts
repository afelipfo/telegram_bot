import { sendMessage } from "./api"

interface WebhookInfo {
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  last_error_date?: number
  last_error_message?: string
}

export async function setWebhook(webhookUrl: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set")
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: webhookUrl,
      allowed_updates: ["message", "callback_query"],
      drop_pending_updates: false,
    }),
  })

  const data = await response.json()
  return data.ok
}

export async function getWebhookInfo(): Promise<WebhookInfo | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set")
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
  const data = await response.json()

  if (data.ok) {
    return data.result
  }

  return null
}

export async function deleteWebhook(): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set")
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`)
  const data = await response.json()
  return data.ok
}

export async function sendBroadcastMessage(userIds: number[], message: string): Promise<void> {
  for (const userId of userIds) {
    try {
      await sendMessage(userId, message)
      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`[v0] Failed to send message to user ${userId}:`, error)
    }
  }
}
