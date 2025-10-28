// PQRSD Classification Logic using keyword matching and pattern recognition
export type PQRSDType = "peticion" | "queja" | "reclamo" | "sugerencia" | "denuncia"
export type PriorityType = "low" | "normal" | "high" | "urgent"

interface ClassificationResult {
  type: PQRSDType
  confidence: number
  suggestedEntity?: string
  priority?: PriorityType
}

const CLASSIFICATION_PATTERNS = {
  peticion: [
    "solicito",
    "solicitud",
    "requiero",
    "necesito",
    "pido",
    "petición",
    "información",
    "certificado",
    "permiso",
    "autorización",
    "trámite",
  ],
  queja: [
    "queja",
    "molesto",
    "inconformidad",
    "mal servicio",
    "mala atención",
    "insatisfecho",
    "problema",
    "deficiente",
    "pésimo",
    "terrible",
  ],
  reclamo: [
    "reclamo",
    "cobro",
    "factura",
    "pago",
    "indebido",
    "error",
    "equivocación",
    "devolver",
    "reembolso",
    "compensación",
    "daño",
    "perjuicio",
  ],
  sugerencia: [
    "sugerencia",
    "propongo",
    "recomiendo",
    "sería bueno",
    "podrían",
    "mejorar",
    "implementar",
    "considerar",
    "idea",
    "propuesta",
  ],
  denuncia: [
    "denuncia",
    "denuncio",
    "irregularidad",
    "corrupción",
    "ilegal",
    "fraude",
    "abuso",
    "violación",
    "incumplimiento",
    "delito",
  ],
}

const PRIORITY_KEYWORDS = {
  urgent: ["urgente", "emergencia", "inmediato", "crítico", "grave", "peligro", "riesgo"],
  high: ["importante", "prioridad", "necesario", "cuanto antes", "rápido"],
  low: ["cuando puedan", "sin prisa", "eventual", "futuro"],
}

const ENTITY_KEYWORDS = {
  ALCALDIA: [
    "alcaldía",
    "municipio",
    "gobierno",
    "certificado",
    "impuesto predial",
    "licencia",
    "permiso construcción",
    "valorización",
    "catastro",
  ],
  EPM: [
    "epm",
    "agua",
    "luz",
    "energía",
    "gas",
    "factura",
    "servicio público",
    "acueducto",
    "alcantarillado",
    "corte",
    "reconexión",
  ],
  METRO: ["metro", "metrocable", "tranvía", "transporte", "tarjeta cívica", "estación", "cable"],
  POLICIA: ["policía", "seguridad", "hurto", "robo", "denuncia", "delito", "patrulla", "violencia", "inseguridad"],
  SALUD: ["salud", "hospital", "médico", "cita", "medicina", "eps", "atención médica", "centro de salud", "urgencias"],
  EDUCACION: [
    "educación",
    "colegio",
    "escuela",
    "matrícula",
    "cupo",
    "estudiante",
    "profesor",
    "jardín",
    "universidad",
  ],
}

export function classifyPQRSD(text: string): ClassificationResult {
  const normalizedText = text.toLowerCase()
  const scores: Record<PQRSDType, number> = {
    peticion: 0,
    queja: 0,
    reclamo: 0,
    sugerencia: 0,
    denuncia: 0,
  }

  // Calculate scores based on keyword matches
  for (const [type, keywords] of Object.entries(CLASSIFICATION_PATTERNS)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        scores[type as PQRSDType] += 1
      }
    }
  }

  // Find the type with highest score
  let maxScore = 0
  let classifiedType: PQRSDType = "peticion"

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      classifiedType = type as PQRSDType
    }
  }

  // Calculate confidence (0-1 scale)
  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0)
  const confidence = totalMatches > 0 ? maxScore / totalMatches : 0.5

  // Suggest entity based on keywords
  let suggestedEntity: string | undefined
  let maxEntityScore = 0

  for (const [entity, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    let entityScore = 0
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        entityScore += 1
      }
    }
    if (entityScore > maxEntityScore) {
      maxEntityScore = entityScore
      suggestedEntity = entity
    }
  }

  // Classify priority
  const priority = classifyPriority(text)

  return {
    type: classifiedType,
    confidence: Math.min(confidence, 1),
    suggestedEntity,
    priority,
  }
}

function classifyPriority(text: string): PriorityType {
  const normalizedText = text.toLowerCase()

  // Check for urgent keywords
  for (const keyword of PRIORITY_KEYWORDS.urgent) {
    if (normalizedText.includes(keyword)) {
      return "urgent"
    }
  }

  // Check for high priority keywords
  for (const keyword of PRIORITY_KEYWORDS.high) {
    if (normalizedText.includes(keyword)) {
      return "high"
    }
  }

  // Check for low priority keywords
  for (const keyword of PRIORITY_KEYWORDS.low) {
    if (normalizedText.includes(keyword)) {
      return "low"
    }
  }

  return "normal"
}

export function generateTrackingNumber(): string {
  const prefix = "MED"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}
