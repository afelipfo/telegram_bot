"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface Stats {
  totalUsers: number
  totalRequests: number
  statusCounts: Record<string, number>
  typeCounts: Record<string, number>
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("[v0] Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Cargando estadísticas...</div>
  }

  if (!stats) {
    return <div className="text-destructive">Error al cargar estadísticas</div>
  }

  const statusLabels: Record<string, string> = {
    pending: "Pendientes",
    in_progress: "En Proceso",
    resolved: "Resueltas",
    rejected: "Rechazadas",
  }

  const typeLabels: Record<string, string> = {
    peticion: "Peticiones",
    queja: "Quejas",
    reclamo: "Reclamos",
    sugerencia: "Sugerencias",
    denuncia: "Denuncias",
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Solicitudes</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.totalRequests}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
              <p className="text-3xl font-bold text-warning mt-2">{stats.statusCounts.pending || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resueltas</p>
              <p className="text-3xl font-bold text-success mt-2">{stats.statusCounts.resolved || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Por Estado</h3>
          <div className="space-y-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{statusLabels[status] || status}</span>
                <span className="text-sm font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(stats.typeCounts).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{typeLabels[type] || type}</span>
                <span className="text-sm font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
