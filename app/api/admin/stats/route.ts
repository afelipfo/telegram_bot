import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    // Get total users
    const { count: totalUsers } = await supabase.from("bot_users").select("*", { count: "exact", head: true })

    // Get total PQRSD requests
    const { count: totalRequests } = await supabase.from("pqrsd_requests").select("*", { count: "exact", head: true })

    // Get requests by status
    const { data: requestsByStatus } = await supabase.from("pqrsd_requests").select("status")

    const statusCounts =
      requestsByStatus?.reduce((acc: any, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1
        return acc
      }, {}) || {}

    // Get requests by type
    const { data: requestsByType } = await supabase.from("pqrsd_requests").select("request_type")

    const typeCounts =
      requestsByType?.reduce((acc: any, req) => {
        acc[req.request_type] = (acc[req.request_type] || 0) + 1
        return acc
      }, {}) || {}

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentActivity } = await supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    // Group by day
    const activityByDay =
      recentActivity?.reduce((acc: any, event) => {
        const day = new Date(event.created_at).toLocaleDateString("es-CO")
        acc[day] = (acc[day] || 0) + 1
        return acc
      }, {}) || {}

    // Get top entities by request count
    const { data: topEntities } = await supabase
      .from("pqrsd_requests")
      .select(`
        entity_id,
        entities (name)
      `)
      .not("entity_id", "is", null)

    const entityCounts =
      topEntities?.reduce((acc: any, req) => {
        const entityName = (req.entities as any)?.name || "Unknown"
        acc[entityName] = (acc[entityName] || 0) + 1
        return acc
      }, {}) || {}

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalRequests: totalRequests || 0,
      statusCounts,
      typeCounts,
      activityByDay,
      entityCounts,
    })
  } catch (error) {
    console.error("[v0] Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
