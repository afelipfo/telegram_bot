"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Entity {
  id: string
  name: string
  code: string
  description: string
  contact_email: string
  contact_phone: string
  website_url: string
  category: string
  is_active: boolean
}

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEntities() {
      try {
        const response = await fetch("/api/admin/entities")
        const data = await response.json()
        setEntities(data.entities || [])
      } catch (error) {
        console.error("[v0] Failed to fetch entities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntities()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestión de Entidades</h1>
            <p className="text-sm text-muted-foreground mt-1">Administra las entidades del sistema</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin">Volver al Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando entidades...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entities.map((entity) => (
                <Card key={entity.id} className="p-4 border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{entity.name}</h3>
                    <Badge variant={entity.is_active ? "default" : "secondary"}>
                      {entity.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{entity.description}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Código:</span> {entity.code}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Categoría:</span> {entity.category}
                    </p>
                    {entity.contact_phone && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Teléfono:</span> {entity.contact_phone}
                      </p>
                    )}
                    {entity.contact_email && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Email:</span> {entity.contact_email}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
