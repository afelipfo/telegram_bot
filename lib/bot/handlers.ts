import type { TelegramMessage, TelegramCallbackQuery } from "../telegram/types"
import { sendMessage, answerCallbackQuery, editMessageText } from "../telegram/api"
import { getSupabaseServerClient } from "../supabase/server"
import { classifyPQRSD, generateTrackingNumber } from "./classifier"

export async function handleStart(message: TelegramMessage) {
  const supabase = await getSupabaseServerClient()

  // Register or update user
  const { data: existingUser } = await supabase
    .from("bot_users")
    .select("*")
    .eq("telegram_user_id", message.from.id)
    .single()

  if (!existingUser) {
    await supabase.from("bot_users").insert({
      telegram_user_id: message.from.id,
      telegram_username: message.from.username,
      first_name: message.from.first_name,
      last_name: message.from.last_name,
      language_code: message.from.language_code || "es",
    })
  } else {
    await supabase
      .from("bot_users")
      .update({
        last_interaction: new Date().toISOString(),
        interaction_count: (existingUser.interaction_count || 0) + 1,
      })
      .eq("telegram_user_id", message.from.id)
  }

  // Log analytics
  await supabase.from("analytics_events").insert({
    event_type: "bot_started",
    telegram_user_id: message.from.id,
  })

  const welcomeText = `¡Bienvenido a MedellínBot! 🏙️

Soy tu asistente virtual para trámites y servicios de la ciudad de Medellín.

¿En qué puedo ayudarte hoy?`

  await sendMessage(message.chat.id, welcomeText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 Consultar Trámites", callback_data: "menu_procedures" }],
        [{ text: "📝 Crear PQRSD", callback_data: "menu_pqrsd" }],
        [{ text: "🔍 Rastrear Solicitud", callback_data: "menu_track" }],
        [{ text: "🎯 Programas Sociales", callback_data: "menu_programs" }],
        [{ text: "ℹ️ Ayuda", callback_data: "menu_help" }],
      ],
    },
  })
}

export async function handleProceduresMenu(callbackQuery: TelegramCallbackQuery) {
  const supabase = await getSupabaseServerClient()

  const { data: entities } = await supabase
    .from("entities")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name")

  const keyboard = entities?.map((entity) => [{ text: entity.name, callback_data: `entity_${entity.code}` }]) || []

  keyboard.push([{ text: "🔍 Buscar Trámite", callback_data: "search_procedure" }])
  keyboard.push([{ text: "🔙 Volver al Menú", callback_data: "menu_main" }])

  await editMessageText(
    callbackQuery.message!.chat.id,
    callbackQuery.message!.message_id,
    "📋 Selecciona la entidad para ver sus trámites disponibles o busca un trámite específico:",
    { reply_markup: { inline_keyboard: keyboard } },
  )

  await answerCallbackQuery(callbackQuery.id)
}

export async function handleEntityProcedures(callbackQuery: TelegramCallbackQuery, entityCode: string) {
  const supabase = await getSupabaseServerClient()

  const { data: entity } = await supabase.from("entities").select("id, name").eq("code", entityCode).single()

  if (!entity) {
    await answerCallbackQuery(callbackQuery.id, "Entidad no encontrada", true)
    return
  }

  const { data: procedures } = await supabase
    .from("procedures")
    .select("id, name, description, cost, estimated_time")
    .eq("entity_id", entity.id)
    .eq("is_active", true)
    .limit(10)

  if (!procedures || procedures.length === 0) {
    await editMessageText(
      callbackQuery.message!.chat.id,
      callbackQuery.message!.message_id,
      `No hay trámites disponibles para ${entity.name} en este momento.`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Volver", callback_data: "menu_procedures" }]],
        },
      },
    )
    await answerCallbackQuery(callbackQuery.id)
    return
  }

  const keyboard = procedures.map((proc) => [{ text: proc.name, callback_data: `proc_${proc.id}` }])

  keyboard.push([{ text: "🔙 Volver", callback_data: "menu_procedures" }])

  await editMessageText(
    callbackQuery.message!.chat.id,
    callbackQuery.message!.message_id,
    `📋 Trámites disponibles en ${entity.name}:`,
    { reply_markup: { inline_keyboard: keyboard } },
  )

  await answerCallbackQuery(callbackQuery.id)
}

export async function handleProcedureDetails(callbackQuery: TelegramCallbackQuery, procedureId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: procedure } = await supabase
    .from("procedures")
    .select(`
      *,
      entities (name, contact_phone, website_url)
    `)
    .eq("id", procedureId)
    .single()

  if (!procedure) {
    await answerCallbackQuery(callbackQuery.id, "Trámite no encontrado", true)
    return
  }

  let detailsText = `📋 *${procedure.name}*\n\n`
  detailsText += `📝 *Descripción:*\n${procedure.description}\n\n`

  if (procedure.requirements && procedure.requirements.length > 0) {
    detailsText += `📄 *Requisitos:*\n`
    procedure.requirements.forEach((req: string, idx: number) => {
      detailsText += `${idx + 1}. ${req}\n`
    })
    detailsText += "\n"
  }

  detailsText += `💰 *Costo:* $${procedure.cost?.toLocaleString("es-CO") || "0"}\n`
  detailsText += `⏱️ *Tiempo estimado:* ${procedure.estimated_time || "No especificado"}\n\n`

  if (procedure.process_steps && procedure.process_steps.length > 0) {
    detailsText += `📍 *Pasos del proceso:*\n`
    procedure.process_steps.forEach((step: string, idx: number) => {
      detailsText += `${idx + 1}. ${step}\n`
    })
    detailsText += "\n"
  }

  if (procedure.online_available && procedure.online_url) {
    detailsText += `🌐 *Disponible en línea:* Sí\n`
    detailsText += `🔗 ${procedure.online_url}\n\n`
  }

  detailsText += `📞 *Contacto:* ${procedure.entities.contact_phone || "No disponible"}\n`
  detailsText += `🌐 *Web:* ${procedure.entities.website_url || "No disponible"}`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, detailsText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Volver", callback_data: "menu_procedures" }]],
    },
  })

  await answerCallbackQuery(callbackQuery.id)

  // Log analytics
  await supabase.from("analytics_events").insert({
    event_type: "procedure_viewed",
    telegram_user_id: callbackQuery.from.id,
    procedure_id: procedureId,
  })
}

export async function handlePQRSDStart(callbackQuery: TelegramCallbackQuery) {
  const supabase = await getSupabaseServerClient()

  // Create or update conversation
  await supabase.from("conversations").insert({
    telegram_user_id: callbackQuery.from.id,
    conversation_type: "pqrsd_creation",
    current_step: "select_type",
    context: {},
  })

  const text = `📝 *Crear PQRSD*

Primero, selecciona el tipo de solicitud que deseas realizar:`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📄 Petición", callback_data: "pqrsd_type_peticion" }],
        [{ text: "😟 Queja", callback_data: "pqrsd_type_queja" }],
        [{ text: "⚠️ Reclamo", callback_data: "pqrsd_type_reclamo" }],
        [{ text: "💡 Sugerencia", callback_data: "pqrsd_type_sugerencia" }],
        [{ text: "🚨 Denuncia", callback_data: "pqrsd_type_denuncia" }],
        [{ text: "❌ Cancelar", callback_data: "menu_main" }],
      ],
    },
  })

  await answerCallbackQuery(callbackQuery.id)
}

export async function handlePQRSDTypeSelection(callbackQuery: TelegramCallbackQuery, type: string) {
  const supabase = await getSupabaseServerClient()

  // Update conversation with selected type
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("telegram_user_id", callbackQuery.from.id)
    .eq("conversation_type", "pqrsd_creation")
    .eq("is_active", true)
    .order("started_at", { ascending: false })
    .limit(1)
    .single()

  if (!conversation) {
    await answerCallbackQuery(callbackQuery.id, "Sesión expirada. Inicia de nuevo.", true)
    return
  }

  await supabase
    .from("conversations")
    .update({
      current_step: "awaiting_description",
      context: { selectedType: type },
    })
    .eq("id", conversation.id)

  const typeDescriptions = {
    peticion: "solicitar información, documentos o servicios",
    queja: "expresar inconformidad con un servicio",
    reclamo: "solicitar corrección de errores o compensación",
    sugerencia: "proponer mejoras o nuevas ideas",
    denuncia: "reportar irregularidades o incumplimientos",
  }

  const text = `📝 *${type.charAt(0).toUpperCase() + type.slice(1)}*

Una ${type} sirve para ${typeDescriptions[type as keyof typeof typeDescriptions]}.

Por favor, describe tu ${type} de manera detallada:
• ¿Qué sucedió?
• ¿Cuándo ocurrió?
• ¿Dónde ocurrió?
• ¿Qué entidad está involucrada?

Sé lo más específico posible para que tu solicitud sea procesada correctamente.`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "❌ Cancelar", callback_data: "cancel_pqrsd" }]],
    },
  })

  await answerCallbackQuery(callbackQuery.id)
}

export async function handlePQRSDDescription(message: TelegramMessage) {
  const supabase = await getSupabaseServerClient()

  // Get active conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("telegram_user_id", message.from.id)
    .eq("conversation_type", "pqrsd_creation")
    .eq("is_active", true)
    .order("started_at", { ascending: false })
    .limit(1)
    .single()

  if (!conversation || !message.text) {
    return
  }

  if (message.text.length < 20) {
    await sendMessage(
      message.chat.id,
      "❌ La descripción es muy corta. Por favor proporciona más detalles (mínimo 20 caracteres).",
    )
    return
  }

  const context = conversation.context as any
  const selectedType = context.selectedType

  // Classify the PQRSD or use selected type
  const classification = selectedType
    ? {
        type: selectedType,
        confidence: 1.0,
        suggestedEntity: classifyPQRSD(message.text).suggestedEntity,
        priority: classifyPQRSD(message.text).priority,
      }
    : classifyPQRSD(message.text)

  // Update conversation context
  await supabase
    .from("conversations")
    .update({
      current_step: "confirm_classification",
      context: {
        ...context,
        description: message.text,
        classification: classification,
      },
    })
    .eq("id", conversation.id)

  const typeLabels = {
    peticion: "Petición",
    queja: "Queja",
    reclamo: "Reclamo",
    sugerencia: "Sugerencia",
    denuncia: "Denuncia",
  }

  const priorityLabels = {
    low: "Baja",
    normal: "Normal",
    high: "Alta",
    urgent: "Urgente",
  }

  let responseText = `✅ Tipo de solicitud: *${typeLabels[classification.type]}*\n`
  responseText += `⚡ Prioridad: *${priorityLabels[classification.priority || "normal"]}*\n\n`

  if (classification.suggestedEntity) {
    const { data: entity } = await supabase
      .from("entities")
      .select("name")
      .eq("code", classification.suggestedEntity)
      .single()

    if (entity) {
      responseText += `📍 Entidad sugerida: *${entity.name}*\n\n`
    }
  }

  responseText += `¿Es correcta esta clasificación?`

  await sendMessage(message.chat.id, responseText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Sí, continuar", callback_data: "confirm_classification_yes" }],
        [{ text: "🔄 Cambiar tipo", callback_data: "confirm_classification_no" }],
        [{ text: "❌ Cancelar", callback_data: "cancel_pqrsd" }],
      ],
    },
  })
}

export async function handleConfirmClassification(callbackQuery: TelegramCallbackQuery, confirmed: boolean) {
  const supabase = await getSupabaseServerClient()

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("telegram_user_id", callbackQuery.from.id)
    .eq("conversation_type", "pqrsd_creation")
    .eq("is_active", true)
    .order("started_at", { ascending: false })
    .limit(1)
    .single()

  if (!conversation) {
    await answerCallbackQuery(callbackQuery.id, "Sesión expirada", true)
    return
  }

  if (!confirmed) {
    // Go back to type selection
    await supabase
      .from("conversations")
      .update({
        current_step: "select_type",
      })
      .eq("id", conversation.id)

    await handlePQRSDStart(callbackQuery)
    return
  }

  // Continue to personal info
  await supabase
    .from("conversations")
    .update({
      current_step: "awaiting_personal_info",
    })
    .eq("id", conversation.id)

  let responseText = `Para continuar, necesito tus datos personales:\n\n`
  responseText += `Por favor proporciona en este orden:\n`
  responseText += `• Nombre completo\n`
  responseText += `• Número de cédula\n`
  responseText += `• Correo electrónico\n`
  responseText += `• Teléfono de contacto\n`
  responseText += `• Dirección\n\n`
  responseText += `*Ejemplo:*\n`
  responseText += `Juan Pérez García\n`
  responseText += `1234567890\n`
  responseText += `juan.perez@email.com\n`
  responseText += `3001234567\n`
  responseText += `Calle 50 #45-30, Medellín`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, responseText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "❌ Cancelar", callback_data: "cancel_pqrsd" }]],
    },
  })

  await answerCallbackQuery(callbackQuery.id)
}

export async function handlePQRSDPersonalInfo(message: TelegramMessage) {
  const supabase = await getSupabaseServerClient()

  // Get active conversation
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("telegram_user_id", message.from.id)
    .eq("conversation_type", "pqrsd_creation")
    .eq("is_active", true)
    .eq("current_step", "awaiting_personal_info")
    .order("started_at", { ascending: false })
    .limit(1)
    .single()

  if (!conversation || !message.text) {
    return
  }

  // Parse personal info (simple line-by-line parsing)
  const lines = message.text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l)

  if (lines.length < 5) {
    await sendMessage(
      message.chat.id,
      "❌ Por favor proporciona todos los datos requeridos en líneas separadas:\n1. Nombre\n2. Cédula\n3. Email\n4. Teléfono\n5. Dirección",
    )
    return
  }

  const [name, citizenId, email, phone, ...addressParts] = lines
  const address = addressParts.join(" ")

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    await sendMessage(
      message.chat.id,
      "❌ El correo electrónico no tiene un formato válido. Por favor intenta de nuevo con todos los datos.",
    )
    return
  }

  // Validate phone format (Colombian)
  const phoneRegex = /^3\d{9}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    await sendMessage(
      message.chat.id,
      "❌ El teléfono debe ser un número celular colombiano válido (10 dígitos comenzando con 3).",
    )
    return
  }

  // Validate citizen ID (numeric)
  if (!/^\d{6,12}$/.test(citizenId)) {
    await sendMessage(message.chat.id, "❌ El número de cédula debe contener entre 6 y 12 dígitos.")
    return
  }

  const context = conversation.context as any
  const classification = context.classification

  // Get entity ID
  let entityId = null
  if (classification.suggestedEntity) {
    const { data: entity } = await supabase
      .from("entities")
      .select("id")
      .eq("code", classification.suggestedEntity)
      .single()

    if (entity) {
      entityId = entity.id
    }
  }

  // Create PQRSD request
  const trackingNumber = generateTrackingNumber()

  const { error } = await supabase.from("pqrsd_requests").insert({
    tracking_number: trackingNumber,
    telegram_user_id: message.from.id,
    entity_id: entityId,
    request_type: classification.type,
    subject: context.description.substring(0, 200),
    description: context.description,
    citizen_name: name,
    citizen_id: citizenId,
    citizen_email: email,
    citizen_phone: phone,
    citizen_address: address,
    classification_confidence: classification.confidence,
    priority: classification.priority || "normal",
    status: "pending",
  })

  if (error) {
    console.error("[v0] Error creating PQRSD:", error)
    await sendMessage(message.chat.id, "❌ Hubo un error al crear tu solicitud. Por favor intenta de nuevo más tarde.")
    return
  }

  // Mark conversation as completed
  await supabase
    .from("conversations")
    .update({
      is_active: false,
      completed_at: new Date().toISOString(),
    })
    .eq("id", conversation.id)

  // Log analytics
  await supabase.from("analytics_events").insert({
    event_type: "pqrsd_created",
    telegram_user_id: message.from.id,
    entity_id: entityId,
    metadata: { request_type: classification.type, priority: classification.priority },
  })

  const successText = `✅ *¡Solicitud creada exitosamente!*

📋 *Número de radicado:* \`${trackingNumber}\`

Tu solicitud ha sido registrada y será procesada por la entidad correspondiente.

Recibirás actualizaciones sobre el estado de tu solicitud. Puedes usar el número de radicado para hacer seguimiento en cualquier momento.

¿Deseas hacer algo más?`

  await sendMessage(message.chat.id, successText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔍 Rastrear Solicitud", callback_data: "menu_track" }],
        [{ text: "🏠 Menú Principal", callback_data: "menu_main" }],
      ],
    },
  })
}

export async function handleTrackingMenu(callbackQuery: TelegramCallbackQuery) {
  const text = `🔍 *Rastrear Solicitud*

Por favor, envía el número de radicado de tu solicitud.

Ejemplo: MED-ABC123-XYZ4`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Volver al Menú", callback_data: "menu_main" }]],
    },
  })

  await answerCallbackQuery(callbackQuery.id)
}

export async function handleTrackingNumber(message: TelegramMessage) {
  const supabase = await getSupabaseServerClient()

  if (!message.text) return

  const trackingNumber = message.text.trim().toUpperCase()

  const { data: request } = await supabase
    .from("pqrsd_requests")
    .select(`
      *,
      entities (name, contact_phone)
    `)
    .eq("tracking_number", trackingNumber)
    .single()

  if (!request) {
    await sendMessage(
      message.chat.id,
      "❌ No se encontró ninguna solicitud con ese número de radicado. Verifica e intenta de nuevo.",
    )
    return
  }

  const statusLabels = {
    pending: "⏳ Pendiente",
    in_progress: "🔄 En Proceso",
    resolved: "✅ Resuelta",
    rejected: "❌ Rechazada",
  }

  const typeLabels = {
    peticion: "Petición",
    queja: "Queja",
    reclamo: "Reclamo",
    sugerencia: "Sugerencia",
    denuncia: "Denuncia",
  }

  let trackingText = `📋 *Información de la Solicitud*\n\n`
  trackingText += `🔢 *Radicado:* \`${request.tracking_number}\`\n`
  trackingText += `📝 *Tipo:* ${typeLabels[request.request_type as keyof typeof typeLabels]}\n`
  trackingText += `📍 *Estado:* ${statusLabels[request.status as keyof typeof statusLabels]}\n`
  trackingText += `📅 *Fecha de creación:* ${new Date(request.created_at).toLocaleDateString("es-CO")}\n`

  if (request.entities) {
    trackingText += `🏢 *Entidad:* ${request.entities.name}\n`
  }

  trackingText += `\n📄 *Asunto:* ${request.subject}\n`

  if (request.response) {
    trackingText += `\n💬 *Respuesta:*\n${request.response}`
  }

  if (request.resolved_at) {
    trackingText += `\n\n✅ *Fecha de resolución:* ${new Date(request.resolved_at).toLocaleDateString("es-CO")}`
  }

  await sendMessage(message.chat.id, trackingText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "🏠 Menú Principal", callback_data: "menu_main" }]],
    },
  })

  // Log analytics
  await supabase.from("analytics_events").insert({
    event_type: "tracking_checked",
    telegram_user_id: message.from.id,
  })
}

export async function handleSocialPrograms(callbackQuery: TelegramCallbackQuery) {
  const supabase = await getSupabaseServerClient()

  const { data: programs } = await supabase
    .from("social_programs")
    .select("id, name, description")
    .eq("is_active", true)
    .limit(10)

  if (!programs || programs.length === 0) {
    await editMessageText(
      callbackQuery.message!.chat.id,
      callbackQuery.message!.message_id,
      "No hay programas sociales disponibles en este momento.",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Volver al Menú", callback_data: "menu_main" }]],
        },
      },
    )
    await answerCallbackQuery(callbackQuery.id)
    return
  }

  const keyboard = programs.map((prog) => [{ text: prog.name, callback_data: `program_${prog.id}` }])

  keyboard.push([{ text: "🔙 Volver al Menú", callback_data: "menu_main" }])

  await editMessageText(
    callbackQuery.message!.chat.id,
    callbackQuery.message!.message_id,
    "🎯 *Programas Sociales Disponibles*\n\nSelecciona un programa para ver más información:",
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard },
    },
  )

  await answerCallbackQuery(callbackQuery.id)
}

export async function handleProgramDetails(callbackQuery: TelegramCallbackQuery, programId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: program } = await supabase
    .from("social_programs")
    .select(`
      *,
      entities (name, contact_phone)
    `)
    .eq("id", programId)
    .single()

  if (!program) {
    await answerCallbackQuery(callbackQuery.id, "Programa no encontrado", true)
    return
  }

  let programText = `🎯 *${program.name}*\n\n`
  programText += `📝 *Descripción:*\n${program.description}\n\n`

  if (program.eligibility_criteria && program.eligibility_criteria.length > 0) {
    programText += `✅ *Requisitos de elegibilidad:*\n`
    program.eligibility_criteria.forEach((criteria: string, idx: number) => {
      programText += `${idx + 1}. ${criteria}\n`
    })
    programText += "\n"
  }

  if (program.benefits && program.benefits.length > 0) {
    programText += `🎁 *Beneficios:*\n`
    program.benefits.forEach((benefit: string, idx: number) => {
      programText += `${idx + 1}. ${benefit}\n`
    })
    programText += "\n"
  }

  if (program.application_process) {
    programText += `📋 *Proceso de inscripción:*\n${program.application_process}\n\n`
  }

  if (program.website_url) {
    programText += `🌐 *Más información:* ${program.website_url}\n`
  }

  if (program.entities) {
    programText += `📞 *Contacto:* ${program.entities.contact_phone || "No disponible"}`
  }

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, programText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Volver", callback_data: "menu_programs" }]],
    },
  })

  await answerCallbackQuery(callbackQuery.id)

  // Log analytics
  await supabase.from("analytics_events").insert({
    event_type: "program_viewed",
    telegram_user_id: callbackQuery.from.id,
  })
}

export async function handleHelp(callbackQuery: TelegramCallbackQuery) {
  const helpText = `ℹ️ *Ayuda - MedellínBot*

*¿Qué puedo hacer?*

📋 *Consultar Trámites*
Busca información sobre trámites y procedimientos de diferentes entidades de Medellín.

📝 *Crear PQRSD*
Registra peticiones, quejas, reclamos, sugerencias o denuncias. Recibirás un número de radicado para hacer seguimiento.

🔍 *Rastrear Solicitud*
Consulta el estado de tus solicitudes usando el número de radicado.

🎯 *Programas Sociales*
Conoce los programas sociales disponibles y sus requisitos.

*¿Necesitas más ayuda?*
Contacta con la línea de atención: (604) 385 5555`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, helpText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "🔙 Volver al Menú", callback_data: "menu_main" }]],
    },
  })

  await answerCallbackQuery(callbackQuery.id)
}

export async function handleMainMenu(callbackQuery: TelegramCallbackQuery) {
  const menuText = `🏙️ *MedellínBot - Menú Principal*

¿En qué puedo ayudarte hoy?`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, menuText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "📋 Consultar Trámites", callback_data: "menu_procedures" }],
        [{ text: "📝 Crear PQRSD", callback_data: "menu_pqrsd" }],
        [{ text: "🔍 Rastrear Solicitud", callback_data: "menu_track" }],
        [{ text: "🎯 Programas Sociales", callback_data: "menu_programs" }],
        [{ text: "ℹ️ Ayuda", callback_data: "menu_help" }],
      ],
    },
  })

  await answerCallbackQuery(callbackQuery.id)
}

export async function handleSearchProcedure(callbackQuery: TelegramCallbackQuery) {
  const supabase = await getSupabaseServerClient()

  // Create conversation for search
  await supabase.from("conversations").insert({
    telegram_user_id: callbackQuery.from.id,
    conversation_type: "procedure_search",
    current_step: "awaiting_search_query",
    context: {},
  })

  const text = `🔍 *Buscar Trámite*

Escribe palabras clave relacionadas con el trámite que buscas.

Ejemplos:
• "certificado residencia"
• "conexión agua"
• "tarjeta metro"
• "denuncia hurto"`

  await editMessageText(callbackQuery.message!.chat.id, callbackQuery.message!.message_id, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [[{ text: "❌ Cancelar", callback_data: "menu_procedures" }]],
    },
  })

  await answerCallbackQuery(callbackQuery.id)
}

export async function handleSearchQuery(message: TelegramMessage, query: string) {
  const supabase = await getSupabaseServerClient()

  // Search procedures by keywords
  const searchTerms = query
    .toLowerCase()
    .split(" ")
    .filter((t) => t.length > 2)

  const { data: procedures } = await supabase
    .from("procedures")
    .select(`
      id,
      name,
      description,
      cost,
      entities (name)
    `)
    .eq("is_active", true)

  if (!procedures || procedures.length === 0) {
    await sendMessage(message.chat.id, "No se encontraron trámites. Intenta con otras palabras clave.", {
      reply_markup: {
        inline_keyboard: [[{ text: "🔙 Volver", callback_data: "menu_procedures" }]],
      },
    })
    return
  }

  // Score procedures based on keyword matches
  const scoredProcedures = procedures
    .map((proc) => {
      const text = `${proc.name} ${proc.description}`.toLowerCase()
      const score = searchTerms.reduce((acc, term) => {
        return acc + (text.includes(term) ? 1 : 0)
      }, 0)
      return { ...proc, score }
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  if (scoredProcedures.length === 0) {
    await sendMessage(
      message.chat.id,
      "No se encontraron trámites con esas palabras clave. Intenta con otros términos.",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "🔙 Volver", callback_data: "menu_procedures" }]],
        },
      },
    )
    return
  }

  const keyboard = scoredProcedures.map((proc) => [
    { text: `${proc.name} - ${proc.entities.name}`, callback_data: `proc_${proc.id}` },
  ])

  keyboard.push([{ text: "🔙 Volver", callback_data: "menu_procedures" }])

  await sendMessage(message.chat.id, `🔍 Encontré ${scoredProcedures.length} trámite(s):`, {
    reply_markup: { inline_keyboard: keyboard },
  })

  // Mark conversation as completed
  await supabase
    .from("conversations")
    .update({ is_active: false, completed_at: new Date().toISOString() })
    .eq("telegram_user_id", message.from.id)
    .eq("conversation_type", "procedure_search")
    .eq("is_active", true)
}
