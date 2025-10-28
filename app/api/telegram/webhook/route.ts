import { type NextRequest, NextResponse } from "next/server"
import type { TelegramUpdate } from "@/lib/telegram/types"
import {
  handleStart,
  handleProceduresMenu,
  handleEntityProcedures,
  handleProcedureDetails,
  handlePQRSDStart,
  handlePQRSDDescription,
  handlePQRSDPersonalInfo,
  handlePQRSDTypeSelection,
  handleConfirmClassification,
  handleSearchProcedure,
  handleSearchQuery,
  handleTrackingMenu,
  handleTrackingNumber,
  handleSocialPrograms,
  handleProgramDetails,
  handleHelp,
  handleMainMenu,
} from "@/lib/bot/handlers"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const callbackData = update.callback_query.data

      if (callbackData === "menu_main") {
        await handleMainMenu(update.callback_query)
      } else if (callbackData === "menu_procedures") {
        await handleProceduresMenu(update.callback_query)
      } else if (callbackData === "search_procedure") {
        await handleSearchProcedure(update.callback_query)
      } else if (callbackData?.startsWith("entity_")) {
        const entityCode = callbackData.replace("entity_", "")
        await handleEntityProcedures(update.callback_query, entityCode)
      } else if (callbackData?.startsWith("proc_")) {
        const procedureId = callbackData.replace("proc_", "")
        await handleProcedureDetails(update.callback_query, procedureId)
      } else if (callbackData === "menu_pqrsd") {
        await handlePQRSDStart(update.callback_query)
      } else if (callbackData?.startsWith("pqrsd_type_")) {
        const type = callbackData.replace("pqrsd_type_", "")
        await handlePQRSDTypeSelection(update.callback_query, type)
      } else if (callbackData === "confirm_classification_yes") {
        await handleConfirmClassification(update.callback_query, true)
      } else if (callbackData === "confirm_classification_no") {
        await handleConfirmClassification(update.callback_query, false)
      } else if (callbackData === "menu_track") {
        await handleTrackingMenu(update.callback_query)
      } else if (callbackData === "menu_programs") {
        await handleSocialPrograms(update.callback_query)
      } else if (callbackData?.startsWith("program_")) {
        const programId = callbackData.replace("program_", "")
        await handleProgramDetails(update.callback_query, programId)
      } else if (callbackData === "menu_help") {
        await handleHelp(update.callback_query)
      } else if (callbackData === "cancel_pqrsd") {
        // Cancel active PQRSD conversation
        const supabase = await getSupabaseServerClient()
        await supabase
          .from("conversations")
          .update({ is_active: false })
          .eq("telegram_user_id", update.callback_query.from.id)
          .eq("conversation_type", "pqrsd_creation")
          .eq("is_active", true)

        await handleMainMenu(update.callback_query)
      }

      return NextResponse.json({ ok: true })
    }

    // Handle text messages
    if (update.message?.text) {
      const text = update.message.text

      // Check for commands
      if (text === "/start") {
        await handleStart(update.message)
        return NextResponse.json({ ok: true })
      }

      // Check if user is in an active conversation
      const supabase = await getSupabaseServerClient()
      const { data: conversation } = await supabase
        .from("conversations")
        .select("*")
        .eq("telegram_user_id", update.message.from.id)
        .eq("is_active", true)
        .order("started_at", { ascending: false })
        .limit(1)
        .single()

      if (conversation) {
        if (conversation.conversation_type === "pqrsd_creation") {
          if (conversation.current_step === "awaiting_description") {
            await handlePQRSDDescription(update.message)
          } else if (conversation.current_step === "awaiting_personal_info") {
            await handlePQRSDPersonalInfo(update.message)
          }
        } else if (conversation.conversation_type === "procedure_search") {
          if (conversation.current_step === "awaiting_search_query") {
            await handleSearchQuery(update.message, text)
          }
        }
      } else {
        // Check if it's a tracking number
        if (text.match(/^MED-[A-Z0-9]+-[A-Z0-9]+$/i)) {
          await handleTrackingNumber(update.message)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "MedellínBot webhook is running" })
}
