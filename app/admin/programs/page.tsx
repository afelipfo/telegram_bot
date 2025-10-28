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

interface SocialProgram {
  id: string
  name: string
  description: string
  entity_id: string
  eligibility_criteria: string[]
  benefits: string[]
  application_process: string
  contact_info: string
  website_url: string
  is_active: boolean
  entities?: { name: string }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<SocialProgram[]>([])
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<SocialProgram | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    entity_id: "",
    eligibility_criteria: "",
    benefits: "",
    application_process: "",
    contact_info: "",
    website_url: "",
  })

  useEffect(() => {
    fetchPrograms()
    fetchEntities()
  }, [])

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/admin/programs")
      const data = await response.json()
      setPrograms(data.programs || [])
    } catch (error) {
      console.error("[v0] Failed to fetch programs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEntities = async () => {
    try {
      const response = await fetch("/api/admin/entities")
      const data = await response.json()
      setEntities(data.entities || [])
    } catch (error) {
      console.error("[v0] Failed to fetch entities:", error)
    }
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        eligibility_criteria: formData.eligibility_criteria.split("\n").filter((l) => l.trim()),
        benefits: formData.benefits.split("\n").filter((l) => l.trim()),
      }

      const url = editingProgram ? `/api/admin/programs/${editingProgram.id}` : "/api/admin/programs"
      const method = editingProgram ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        fetchPrograms()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("[v0] Failed to save program:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      entity_id: "",
      eligibility_criteria: "",
      benefits: "",
      application_process: "",
      contact_info: "",
      website_url: "",
    })
    setEditingProgram(null)
  }

  const handleEdit = (program: SocialProgram) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      description: program.description,
      entity_id: program.entity_id,
      eligibility_criteria: program.eligibility_criteria.join("\n"),
      benefits: program.benefits.join("\n"),
      application_process: program.application_process,
      contact_info: program.contact_info,
      website_url: program.website_url,
    })
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Programas Sociales</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona los programas sociales disponibles</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setDialogOpen(true)}>Crear Programa</Button>
            <Button variant="outline" asChild>
              <Link href="/admin">Volver al Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando programas...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <Card key={program.id} className="p-4 border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{program.name}</h3>
                    <Badge variant={program.is_active ? "default" : "secondary"}>
                      {program.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{program.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Entidad:</span> {program.entities?.name}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Beneficios:</span> {program.benefits.length}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Requisitos:</span> {program.eligibility_criteria.length}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => handleEdit(program)}
                  >
                    Editar
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? "Editar Programa" : "Crear Programa"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Programa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Medellín Me Cuida"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del programa..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="entity">Entidad</Label>
              <Select
                value={formData.entity_id}
                onValueChange={(value) => setFormData({ ...formData, entity_id: value })}
              >
                <SelectTrigger id="entity">
                  <SelectValue placeholder="Selecciona una entidad" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="eligibility">Requisitos de Elegibilidad (uno por línea)</Label>
              <Textarea
                id="eligibility"
                value={formData.eligibility_criteria}
                onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
                placeholder="Residir en Medellín&#10;Estar en condición de vulnerabilidad"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="benefits">Beneficios (uno por línea)</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="Atención médica gratuita&#10;Medicamentos subsidiados"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="application">Proceso de Inscripción</Label>
              <Textarea
                id="application"
                value={formData.application_process}
                onChange={(e) => setFormData({ ...formData, application_process: e.target.value })}
                placeholder="Describe el proceso de inscripción..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="contact">Información de Contacto</Label>
              <Input
                id="contact"
                value={formData.contact_info}
                onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                placeholder="Teléfono, email, etc."
              />
            </div>

            <div>
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{editingProgram ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
