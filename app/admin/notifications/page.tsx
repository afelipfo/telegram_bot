"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  target_audience: string
  is_active: boolean
  scheduled_at: string
  sent_at?: string
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    notification_type: "info",
    scheduled_at: "",
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications")
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("[v0] Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchNotifications()
        setDialogOpen(false)
        setFormData({
          title: "",
          message: "",
          notification_type: "info",
          scheduled_at: "",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to create notification:", error)
    }
  }

  const typeLabels: Record<string, string> = {
    alert: "Alerta",
    info: "Información",
    emergency: "Emergencia",
    service_update: "Actualización de Servicio",
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Notificaciones</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona las notificaciones del sistema</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setDialogOpen(true)}>Crear Notificación</Button>
            <Button variant="outline" asChild>
              <Link href="/admin">Volver al Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando notificaciones...</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="p-4 border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        <Badge variant={notification.sent_at ? "outline" : "default"}>
                          {notification.sent_at ? "Enviada" : "Pendiente"}
                        </Badge>
                        <Badge variant="secondary">{typeLabels[notification.notification_type]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Programada: {new Date(notification.scheduled_at).toLocaleString("es-CO")}</span>
                        {notification.sent_at && (
                          <span>Enviada: {new Date(notification.sent_at).toLocaleString("es-CO")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Notificación</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título de la notificación"
              />
            </div>

            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Contenido de la notificación..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.notification_type}
                onValueChange={(value) => setFormData({ ...formData, notification_type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                  <SelectItem value="emergency">Emergencia</SelectItem>
                  <SelectItem value="service_update">Actualización de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="scheduled">Fecha y Hora de Envío</Label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
