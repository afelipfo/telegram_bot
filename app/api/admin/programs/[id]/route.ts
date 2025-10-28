import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const allowedFields = [
      "name",
      "description",
      "entity_id",
      "eligibility_criteria",
      "benefits",
      "application_process",
      "contact_info",
      "website_url",
      "is_active",
    ]
    const updates: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("social_programs").update(updates).eq("id", params.id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ program: data })
  } catch (error) {
    console.error("[v0] Program update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
