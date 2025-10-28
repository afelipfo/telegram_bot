import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 bg-card border-border">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">MedellínBot</h1>
            <p className="text-xl text-muted-foreground">Asistente Inteligente para Ciudadanos</p>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏙️</span>
              <div>
                <h3 className="font-semibold text-foreground">Información de Trámites</h3>
                <p className="text-sm text-muted-foreground">
                  Consulta requisitos, costos y pasos para trámites municipales
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="font-semibold text-foreground">PQRSD Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Crea y rastrea peticiones, quejas, reclamos, sugerencias y denuncias
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-foreground">Programas Sociales</h3>
                <p className="text-sm text-muted-foreground">Conoce los programas disponibles y cómo acceder a ellos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-foreground">Disponible 24/7</h3>
                <p className="text-sm text-muted-foreground">Atención automatizada en Telegram en cualquier momento</p>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <Button asChild className="w-full" size="lg">
              <a
                href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "MedellinBot"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en Telegram
              </a>
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
              <Link href="/admin">Panel de Administración</Link>
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Sistema de atención ciudadana para la ciudad de Medellín, Colombia
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
