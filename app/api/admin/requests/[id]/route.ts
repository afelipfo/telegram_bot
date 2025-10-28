import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: pqrsdRequest, error } = await supabase
      .from("pqrsd_requests")
      .select(`
        *,
        entities (id, name, code, contact_email, contact_phone)
      `)
      .eq("id", params.id)
      .single()

    if (error || !pqrsdRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    return NextResponse.json({ request: pqrsdRequest })
  } catch (error) {
    console.error("[v0] Get request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const allowedFields = ["status", "response", "priority", "entity_id"]
    const updates: any = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (body.status === "resolved" && !updates.resolved_at) {
      updates.resolved_at = new Date().toISOString()
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("pqrsd_requests").update(updates).eq("id", params.id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      event_type: "pqrsd_updated",
      metadata: { request_id: params.id, updates },
    })

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("[v0] Update request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.from("pqrsd_requests").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
