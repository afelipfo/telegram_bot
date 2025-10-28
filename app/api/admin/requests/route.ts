import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const searchParams = request.nextUrl.searchParams

    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = (page - 1) * limit

    let query = supabase
      .from("pqrsd_requests")
      .select(
        `
        *,
        entities (name, code)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    if (type) {
      query = query.eq("request_type", type)
    }

    const { data, count, error } = await query

    if (error) throw error

    return NextResponse.json({
      requests: data,
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("[v0] Requests fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    const { id, status, response, priority } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (response) updateData.response = response
    if (priority) updateData.priority = priority
    if (status === "resolved") updateData.resolved_at = new Date().toISOString()

    const { data, error } = await supabase.from("pqrsd_requests").update(updateData).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("[v0] Request update error:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}
