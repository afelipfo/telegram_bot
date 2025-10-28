"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface ActivityData {
  day: string
  count: number
}

export function ActivityChart() {
  const [data, setData] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const response = await fetch("/api/admin/stats")
        const stats = await response.json()

        const chartData = Object.entries(stats.activityByDay || {}).map(([day, count]) => ({
          day,
          count: count as number,
        }))

        setData(chartData)
      } catch (error) {
        console.error("[v0] Failed to fetch activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Cargando actividad...</div>
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Actividad (Últimos 7 días)</h3>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay datos de actividad disponibles</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const percentage = (item.count / maxCount) * 100
              return (
                <div key={item.day} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{item.day}</span>
                    <span className="text-foreground font-semibold">{item.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
