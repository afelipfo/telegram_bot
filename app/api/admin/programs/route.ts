import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: programs, error } = await supabase
      .from("social_programs")
      .select(`
        *,
        entities (name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ programs })
  } catch (error) {
    console.error("[v0] Programs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const {
      name,
      description,
      entity_id,
      eligibility_criteria,
      benefits,
      application_process,
      contact_info,
      website_url,
    } = body

    if (!name || !description || !entity_id) {
      return NextResponse.json({ error: "name, description, and entity_id are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("social_programs")
      .insert({
        name,
        description,
        entity_id,
        eligibility_criteria,
        benefits,
        application_process,
        contact_info,
        website_url,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ program: data })
  } catch (error) {
    console.error("[v0] Program creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
