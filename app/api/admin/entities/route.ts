import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: entities, error } = await supabase.from("entities").select("*").eq("is_active", true).order("name")

    if (error) throw error

    return NextResponse.json({ entities })
  } catch (error) {
    console.error("[v0] Entities fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch entities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { name, code, description, contact_email, contact_phone, website_url, address, category } = body

    if (!name || !code) {
      return NextResponse.json({ error: "name and code are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("entities")
      .insert({
        name,
        code: code.toUpperCase(),
        description,
        contact_email,
        contact_phone,
        website_url,
        address,
        category,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ entity: data })
  } catch (error) {
    console.error("[v0] Entity creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
