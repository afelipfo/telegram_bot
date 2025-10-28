import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const searchParams = request.nextUrl.searchParams
    const days = Number.parseInt(searchParams.get("days") || "7")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get event counts by type
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (eventsError) throw eventsError

    // Group events by date and type
    const eventsByDate: Record<string, Record<string, number>> = {}

    events?.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split("T")[0]
      if (!eventsByDate[date]) {
        eventsByDate[date] = {}
      }
      eventsByDate[date][event.event_type] = (eventsByDate[date][event.event_type] || 0) + 1
    })

    // Get PQRSD statistics
    const { data: pqrsdStats, error: pqrsdError } = await supabase
      .from("pqrsd_requests")
      .select("request_type, status, priority")
      .gte("created_at", startDate.toISOString())

    if (pqrsdError) throw pqrsdError

    const typeDistribution: Record<string, number> = {}
    const statusDistribution: Record<string, number> = {}
    const priorityDistribution: Record<string, number> = {}

    pqrsdStats?.forEach((req) => {
      typeDistribution[req.request_type] = (typeDistribution[req.request_type] || 0) + 1
      statusDistribution[req.status] = (statusDistribution[req.status] || 0) + 1
      priorityDistribution[req.priority] = (priorityDistribution[req.priority] || 0) + 1
    })

    return NextResponse.json({
      eventsByDate,
      pqrsdStats: {
        typeDistribution,
        statusDistribution,
        priorityDistribution,
        total: pqrsdStats?.length || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Analytics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
