// Telegram Bot API types
export interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

export interface TelegramMessage {
  message_id: number
  from: TelegramUser
  chat: TelegramChat
  date: number
  text?: string
  contact?: TelegramContact
}

export interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramChat {
  id: number
  type: string
  first_name?: string
  last_name?: string
  username?: string
}

export interface TelegramContact {
  phone_number: string
  first_name: string
  last_name?: string
  user_id?: number
}

export interface TelegramCallbackQuery {
  id: string
  from: TelegramUser
  message?: TelegramMessage
  data?: string
}

export interface TelegramInlineKeyboard {
  inline_keyboard: TelegramInlineKeyboardButton[][]
}

export interface TelegramInlineKeyboardButton {
  text: string
  callback_data?: string
  url?: string
}

export interface TelegramReplyKeyboard {
  keyboard: TelegramKeyboardButton[][]
  resize_keyboard?: boolean
  one_time_keyboard?: boolean
}

export interface TelegramKeyboardButton {
  text: string
  request_contact?: boolean
  request_location?: boolean
}
