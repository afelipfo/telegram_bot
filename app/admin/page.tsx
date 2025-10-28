import { Suspense } from "react"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RequestsTable } from "@/components/admin/requests-table"
import { ActivityChart } from "@/components/admin/activity-chart"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">MedellínBot - Panel de Administración</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitoreo y gestión de solicitudes ciudadanas</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/entities">Entidades</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/programs">Programas</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/notifications">Notificaciones</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">Analíticas</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Suspense fallback={<div className="text-muted-foreground">Cargando estadísticas...</div>}>
            <DashboardStats />
          </Suspense>

          <Suspense fallback={<div className="text-muted-foreground">Cargando actividad...</div>}>
            <ActivityChart />
          </Suspense>

          <Suspense fallback={<div className="text-muted-foreground">Cargando solicitudes...</div>}>
            <RequestsTable />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
