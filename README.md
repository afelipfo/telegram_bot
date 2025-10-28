# MedellínBot - Asistente Ciudadano Inteligente

Bot de Telegram para la ciudad de Medellín que centraliza información sobre trámites, servicios, programas sociales y gestión de PQRSD (Peticiones, Quejas, Reclamos, Sugerencias y Denuncias).

## Características

### Para Ciudadanos (Telegram Bot)
- 📋 **Consulta de Trámites**: Información detallada sobre procedimientos gubernamentales
- 📝 **Creación de PQRSD**: Sistema inteligente de clasificación y enrutamiento
- 🔍 **Rastreo de Solicitudes**: Seguimiento en tiempo real con número de radicado
- 🎯 **Programas Sociales**: Información sobre beneficios y requisitos
- 🤖 **Disponible 24/7**: Atención automatizada sin horarios

### Para Administradores (Dashboard Web)
- 📊 **Estadísticas en Tiempo Real**: Métricas de uso y solicitudes
- 📈 **Gráficos de Actividad**: Visualización de tendencias
- 📋 **Gestión de Solicitudes**: Filtrado, búsqueda y actualización de PQRSD
- 🏢 **Multi-entidad**: Soporte para múltiples organizaciones gubernamentales

## Tecnologías

- **Frontend**: Next.js 16, React 19, TailwindCSS v4
- **Backend**: Next.js API Routes, Server Actions
- **Base de Datos**: Supabase (PostgreSQL)
- **Bot**: Telegram Bot API
- **Gráficos**: Recharts
- **Tipado**: TypeScript

## Configuración

### Variables de Entorno Requeridas

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
\`\`\`

### Instalación

1. Instalar dependencias:
\`\`\`bash
npm install
\`\`\`

2. Configurar Supabase:
   - Conectar la integración de Supabase desde el panel de v0
   - Ejecutar los scripts SQL en orden:
     - `scripts/001-create-database-schema.sql`
     - `scripts/002-seed-initial-data.sql`

3. Crear un bot de Telegram:
   - Hablar con [@BotFather](https://t.me/botfather) en Telegram
   - Crear un nuevo bot con `/newbot`
   - Copiar el token y agregarlo a las variables de entorno

4. Configurar el webhook:
\`\`\`bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook"
\`\`\`

5. Iniciar el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/
│   │   ├── telegram/webhook/    # Webhook del bot
│   │   └── admin/               # APIs del dashboard
│   ├── admin/                   # Dashboard de administración
│   └── page.tsx                 # Página de inicio
├── components/
│   └── admin/                   # Componentes del dashboard
├── lib/
│   ├── bot/                     # Lógica del bot
│   ├── telegram/                # API de Telegram
│   └── supabase/                # Clientes de Supabase
└── scripts/                     # Scripts SQL
\`\`\`

## Uso del Bot

### Comandos Principales
- `/start` - Iniciar el bot y ver el menú principal

### Flujos de Usuario

**Consultar Trámites:**
1. Seleccionar "Consultar Trámites"
2. Elegir la entidad
3. Ver lista de trámites disponibles
4. Seleccionar un trámite para ver detalles completos

**Crear PQRSD:**
1. Seleccionar "Crear PQRSD"
2. Describir la situación detalladamente
3. El bot clasifica automáticamente el tipo
4. Proporcionar datos personales
5. Recibir número de radicado

**Rastrear Solicitud:**
1. Seleccionar "Rastrear Solicitud"
2. Enviar el número de radicado
3. Ver estado y detalles actualizados

## Clasificación Inteligente de PQRSD

El sistema utiliza análisis de palabras clave para clasificar automáticamente las solicitudes en:

- **Petición**: Solicitudes de información, certificados, permisos
- **Queja**: Inconformidades con servicios o atención
- **Reclamo**: Problemas con cobros, facturas o daños
- **Sugerencia**: Propuestas de mejora
- **Denuncia**: Irregularidades, corrupción o delitos

También sugiere la entidad responsable basándose en el contenido.

## Entidades Soportadas

- Alcaldía de Medellín
- EPM (Empresas Públicas de Medellín)
- Metro de Medellín
- Policía Nacional
- Secretaría de Salud
- Secretaría de Educación

## Seguridad

- ✅ Validación de entrada en todos los formularios
- ✅ Sanitización de datos antes de almacenar
- ✅ Row Level Security (RLS) en Supabase
- ✅ Tokens de bot protegidos en variables de entorno
- ✅ Rate limiting en webhooks
- ✅ Logs de auditoría en analytics_events

## Escalabilidad

- Base de datos PostgreSQL optimizada con índices
- Paginación en todas las consultas grandes
- Caché de estadísticas (actualización cada 30s)
- Arquitectura serverless con Next.js
- Webhooks asíncronos para el bot

## Monitoreo

El dashboard incluye:
- Total de usuarios registrados
- Total de solicitudes creadas
- Distribución por estado y tipo
- Gráfico de actividad de los últimos 7 días
- Tabla de solicitudes con filtros

## Próximas Mejoras

- [ ] Integración con IA para respuestas más inteligentes
- [ ] Notificaciones proactivas a usuarios
- [ ] Sistema de recordatorios automáticos
- [ ] Búsqueda de trámites por texto libre
- [ ] Exportación de reportes en PDF
- [ ] Autenticación para administradores
- [ ] Multi-idioma (inglés, portugués)

## Licencia

Este proyecto es de código abierto para uso gubernamental y educativo.
