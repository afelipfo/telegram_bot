"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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

interface RequestDetailDialogProps {
  request: Request | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function RequestDetailDialog({ request, open, onOpenChange, onUpdate }: RequestDetailDialogProps) {
  const [status, setStatus] = useState(request?.status || "pending")
  const [priority, setPriority] = useState(request?.priority || "normal")
  const [response, setResponse] = useState(request?.response || "")
  const [saving, setSaving] = useState(false)

  if (!request) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, response }),
      })

      if (res.ok) {
        onUpdate()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("[v0] Failed to update request:", error)
    } finally {
      setSaving(false)
    }
  }

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En Proceso",
    resolved: "Resuelta",
    rejected: "Rechazada",
  }

  const typeLabels: Record<string, string> = {
    peticion: "Petición",
    queja: "Queja",
    reclamo: "Reclamo",
    sugerencia: "Sugerencia",
    denuncia: "Denuncia",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de Solicitud</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Radicado</Label>
              <p className="text-sm font-mono mt-1">{request.tracking_number}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
              <p className="text-sm mt-1">{typeLabels[request.request_type]}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Fecha de creación</Label>
              <p className="text-sm mt-1">{new Date(request.created_at).toLocaleString("es-CO")}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Entidad</Label>
              <p className="text-sm mt-1">{request.entities?.name || "Sin asignar"}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Asunto</Label>
            <p className="text-sm mt-1">{request.subject}</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
            <p className="text-sm mt-1 whitespace-pre-wrap">{request.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Ciudadano</Label>
              <p className="text-sm mt-1">{request.citizen_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Cédula</Label>
              <p className="text-sm mt-1">{request.citizen_id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm mt-1">{request.citizen_email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
              <p className="text-sm mt-1">{request.citizen_phone}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
            <p className="text-sm mt-1">{request.citizen_address}</p>
          </div>

          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-semibold mb-4">Gestión de Solicitud</h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En Proceso</SelectItem>
                    <SelectItem value="resolved">Resuelta</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="response">Respuesta</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Escribe la respuesta a la solicitud..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
