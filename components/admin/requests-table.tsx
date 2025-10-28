"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RequestDetailDialog } from "./request-detail-dialog"

interface Request {
  id: string
  tracking_number: string
  request_type: string
  subject: string
  description: string
  status: string
  priority: string
  citizen_name: string
  citizen_id: string
  citizen_email: string
  citizen_phone: string
  citizen_address: string
  response?: string
  created_at: string
  resolved_at?: string
  entities?: { name: string; code: string }
}

export function RequestsTable() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString() })
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (typeFilter !== "all") params.append("type", typeFilter)

      const response = await fetch(`/api/admin/requests?${params}`)
      const data = await response.json()

      setRequests(data.requests || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error("[v0] Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [page, statusFilter, typeFilter])

  const handleRowClick = async (request: Request) => {
    // Fetch full request details
    try {
      const response = await fetch(`/api/admin/requests/${request.id}`)
      const data = await response.json()
      setSelectedRequest(data.request)
      setDialogOpen(true)
    } catch (error) {
      console.error("[v0] Failed to fetch request details:", error)
    }
  }

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En Proceso",
    resolved: "Resuelta",
    rejected: "Rechazada",
  }

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    in_progress: "default",
    resolved: "outline",
    rejected: "destructive",
  }

  const typeLabels: Record<string, string> = {
    peticion: "Petición",
    queja: "Queja",
    reclamo: "Reclamo",
    sugerencia: "Sugerencia",
    denuncia: "Denuncia",
  }

  const priorityColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline",
    normal: "default",
    high: "secondary",
    urgent: "destructive",
  }

  return (
    <>
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Solicitudes PQRSD</h3>

          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Proceso</SelectItem>
                <SelectItem value="resolved">Resuelta</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="peticion">Petición</SelectItem>
                <SelectItem value="queja">Queja</SelectItem>
                <SelectItem value="reclamo">Reclamo</SelectItem>
                <SelectItem value="sugerencia">Sugerencia</SelectItem>
                <SelectItem value="denuncia">Denuncia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando solicitudes...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay solicitudes</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Radicado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Asunto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ciudadano</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Entidad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Prioridad</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleRowClick(request)}
                    >
                      <td className="py-3 px-4 text-sm font-mono text-foreground">{request.tracking_number}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{typeLabels[request.request_type]}</td>
                      <td className="py-3 px-4 text-sm text-foreground max-w-xs truncate">{request.subject}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{request.citizen_name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {request.entities?.name || "Sin asignar"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={statusColors[request.status]}>{statusLabels[request.status]}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={priorityColors[request.priority]}>{request.priority}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <RequestDetailDialog
        request={selectedRequest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdate={fetchRequests}
      />
    </>
  )
}
