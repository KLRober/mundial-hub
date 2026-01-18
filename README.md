# Mundial Hub 2026 🏆⚽

**La experiencia definitiva del Mundial 2026 en tu bolsillo.**

Mundial Hub es una PWA social y gamificada diseñada para vivir el Mundial 2026 de una forma única. Combina predicciones deportivas, minijuegos diarios y una comunidad activa, todo en una interfaz móvil optimizada.

## 🎯 ¿Qué es Mundial Hub?

Una plataforma donde los fanáticos del fútbol pueden:

- **🔮 Prode (Predicciones)** — Predice los resultados de cada partido y compite por puntos contra tus amigos y la comunidad global.

- **🎮 Minijuegos Diarios** — Desafíos rápidos como "El Impostor" para ganar puntos extra cada día.

- **📊 Leaderboards en Tiempo Real** — Rankings actualizados con rachas de victorias y estadísticas de aciertos.

- **📅 Feed de Partidos** — Seguimiento en vivo de todos los partidos del día con horarios, estadios y resultados.

- **🕵️‍♂️ El Impostor** — Minijuego social de deducción para jugar en grupo mientras esperas el partido.

- **👤 Perfil de Usuario** — Historial de puntos, login con Google y estadísticas personales.

## 🌎 Diseñado para LATAM

Mundial Hub está pensado específicamente para el mercado latinoamericano, con:

- Interfaz en español
- Horarios locales de partidos
- Integración nativa con e-commerce regional
- Experiencia móvil-first optimizada para conexiones variables

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js 15 | Framework React con App Router |
| TypeScript | Tipado estático |
| Tailwind CSS | Estilos utility-first |
| Shadcn/ui | Componentes UI |
| Framer Motion | Animaciones |
| SWR | Caching de datos |
| Zustand | Estado global |
| Supabase | Backend & Auth |

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Teal | `#71dbd2` | Primary |
| Mint Cream | `#eeffdb` | Background |
| Soft Green | `#ade4b5` | Secondary |
| Lime | `#d0eaa3` | Muted |
| Yellow | `#fff18c` | Accent |
| Yellow | `#fff18c` | Accent |

## 🚀 Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPO>
   cd mundial-hub
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Crea un archivo `.env.local` en la raíz del proyecto y agrega tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. **Base de Datos (Supabase):**
   - Ejecuta el script `supabase/schema.sql` en el Editor SQL de Supabase para crear las tablas.
   - Ejecuta `supabase/seed.sql` para cargar los partidos iniciales.

5. **Correr el servidor:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000).
---

**Mundial Hub 2026** — Donde cada partido es una oportunidad de ganar. 🏆
