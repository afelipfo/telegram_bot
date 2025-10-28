import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    const { ids, updates } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 })
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ error: "updates object is required" }, { status: 400 })
    }

    const allowedFields = ["status", "priority", "entity_id"]
    const updateData: any = { updated_at: new Date().toISOString() }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    if (updates.status === "resolved") {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from("pqrsd_requests").update(updateData).in("id", ids).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log analytics
    await supabase.from("analytics_events").insert({
      event_type: "pqrsd_bulk_updated",
      metadata: { count: ids.length, updates: updateData },
    })

    return NextResponse.json({ updated: data.length, requests: data })
  } catch (error) {
    console.error("[v0] Bulk update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 })
    }

    const { error } = await supabase.from("pqrsd_requests").delete().in("id", ids)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ deleted: ids.length })
  } catch (error) {
    console.error("[v0] Bulk delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
