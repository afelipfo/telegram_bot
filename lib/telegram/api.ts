import type { TelegramInlineKeyboard, TelegramReplyKeyboard } from "./types"

const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendMessage(
  chatId: number,
  text: string,
  options?: {
    reply_markup?: TelegramInlineKeyboard | TelegramReplyKeyboard
    parse_mode?: "Markdown" | "HTML"
  },
) {
  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...options,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Telegram API error: ${error}`)
  }

  return response.json()
}

export async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  options?: {
    reply_markup?: TelegramInlineKeyboard
    parse_mode?: "Markdown" | "HTML"
  },
) {
  const response = await fetch(`${TELEGRAM_API_URL}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      ...options,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Telegram API error: ${error}`)
  }

  return response.json()
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string, showAlert?: boolean) {
  const response = await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Telegram API error: ${error}`)
  }

  return response.json()
}

export async function setWebhook(url: string) {
  const response = await fetch(`${TELEGRAM_API_URL}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to set webhook: ${error}`)
  }

  return response.json()
}
