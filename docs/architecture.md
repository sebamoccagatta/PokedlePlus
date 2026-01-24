# Arquitectura de Pokedle+

Este documento describe la arquitectura general del sistema, flujo de datos, y componentes principales.

---

## 📋 Tabla de contenidos

- [Visión general](#-visión-general)
- [Arquitectura en capas](#-arquitectura-en-capas)
- [Flujo de datos](#-flujo-de-datos)
- [Componentes del sistema](#-componentes-del-sistema)
- [Base de datos](#-base-de-datos)
- [Netlify Functions (Backend)](#-netlify-functions-backend)
- [Frontend](#-frontend)
- [Seguridad](#-seguridad)
- [Performance](#-performance)
- [Despliegue](#-despliegue)

---

## 👁 Visión general

```
┌─────────────┐          ┌──────────────────┐          ┌──────────────┐
│   Browser  │  HTTPS  │  Netlify Edge   │          │    Neon DB   │
│  (React)   │ ◄────► │  Functions/API   │ ◄───────► │ PostgreSQL   │
└─────────────┘          └──────────────────┘          └──────────────┘
      ▲                       ▲                           ▲
      │                       │                           │
      │  JS/TS               │  Node.js                  │  SQL
      │                       │                           │
      └───────────────────────┴───────────────────────────┘
                    Frontend → Backend → Database
```

---

## 🏗️ Arquitectura en capas

### 1. Frontend Layer

- **Tecnología**: React 18 + Vite + TailwindCSS
- **Responsabilidades**:
  - UI del juego
  - Gestión de estado local (localStorage)
  - Validación de usuario
  - Animaciones y efectos visuales

### 2. Backend Layer (Netlify Functions)

- **Tecnología**: Node.js (Serverless)
- **Responsabilidades**:
  - Lógica de juego (comparación de guess vs target)
  - Selección del Pokémon del día (seeded)
  - Búsqueda de Pokémon
  - Rate limiting
  - Autenticación (via `SECRET` env var)

### 3. Database Layer

- **Tecnología**: PostgreSQL (Neon / Netlify DB)
- **Responsabilidades**:
  - Almacenamiento persistente de Pokémon
  - Índices para búsquedas rápidas
  - Datos de configuración de modos

---

## 🌊 Flujo de datos

### Flujo típico del juego

```
1. Usuario abre app (React)
   ↓
2. GET /api/meta?mode=classic
   → Devuelve: dayKey, dexMax, timezone
   ↓
3. Usuario busca Pokémon (autocomplete)
   ↓
4. GET /api/search?q=pika&mode=classic
   → Devuelve: lista de Pokémon coincidentes
   ↓
5. Usuario selecciona Pokémon y envía guess
   ↓
6. POST /api/guess { guessId, dayKey, mode }
   → Backend:
     - Valida SECRET
     - Calcula Pokémon del día (seeded)
     - Compara guess vs target
     - Retorna: comparación por atributo
   ↓
7. Frontend muestra pistas (verde/amarillo/rojo)
```

### Diagrama de secuencia

```
Browser          Netlify Functions        Neon DB
   │                   │                    │
   │  GET /api/meta    │                    │
   ├──────────────────► │                    │
   │                   │  SELECT dayKey      │
   │                   ├───────────────────► │
   │                   │                    │
   │◄─────────────────│                    │
   │   {dayKey,mode}  │                    │
   │                   │                    │
   │  GET /api/search   │                    │
   ├──────────────────► │                    │
   │                   │  SELECT * FROM      │
   │                   │  pokemon WHERE name  │
   │                   │  LIKE %q%          │
   │                   ├───────────────────► │
   │◄─────────────────│                    │
   │   {items}         │                    │
   │                   │                    │
   │  POST /api/guess  │                    │
   ├──────────────────► │                    │
   │   {guessId,dayKey}│                    │
   │                   │  SELECT target FROM   │
   │                   │  pokemon (seeded)   │
   │                   ├───────────────────► │
   │                   │                    │
   │                   │  SELECT guess FROM   │
   │                   │  pokemon WHERE id=  │
   │                   ├───────────────────► │
   │                   │                    │
   │◄─────────────────│                    │
   │   {comparison}     │                    │
   │                   │                    │
```

---

## 🧩 Componentes del sistema

### 1. Frontend Components

#### Componentes UI (`frontend/src/components/`)

| Componente    | Responsabilidad                                         |
| ------------- | ------------------------------------------------------- |
| `Game`        | Lógica principal del juego (intentos, animaciones)      |
| `Header`      | Logo, selector de modo, stats                           |
| `GridRow`     | Fila de la tabla de pistas (celdas verde/amarillo/rojo) |
| `GuessInput`  | Input de búsqueda con autocomplete                      |
| `Toast`       | Notificaciones (error, info, éxito)                     |
| `ThemeToggle` | Toggle dark/light mode                                  |
| `Confetti`    | Efecto de celebración al ganar                          |

#### Hooks (`frontend/src/hooks/`)

| Hook        | Responsabilidad                        |
| ----------- | -------------------------------------- |
| `useGame`   | Estado del juego (intentos, won, lost) |
| `useTheme`  | Tema (dark/light) con persistencia     |
| `useToast`  | Gestión de notificaciones              |
| `useSearch` | Búsqueda de Pokémon con debounce       |

---

### 2. Backend Functions (`netlify/functions/`)

#### `meta.js`

- **Endpoint**: `GET /api/meta`
- **Propósito**: Devolver metadatos del juego (día actual, dexMax, timezone)
- **Lógica**:
  - Usa IANA timezone para calcular `dayKey`
  - Devuelve config según `mode` (clásico o por generación)

#### `search.js`

- **Endpoint**: `GET /api/search`
- **Propósito**: Búsqueda de Pokémon para autocomplete
- **Lógica**:
  - Filtro por `mode` (clásico = todas las gens, modo específico = solo esa gen)
  - Búsqueda `LIKE %query%` en nombre
  - Cache en memoria para consultas frecuentes

#### `pokemon.js`

- **Endpoint**: `GET /api/pokemon/:id`
- **Propósito**: Obtener datos completos de un Pokémon
- **Lógica**:
  - Busca por ID
  - Parsea tipos y normaliza datos
  - Cache HTTP (max-age=86400)

#### `guess.js`

- **Endpoint**: `POST /api/guess`
- **Propósito**: Comparar guess vs target
- **Lógica**:
  - Valida `SECRET` env var (security)
  - Aplica rate limiting (30 req/min por IP)
  - Calcula target usando seed: `fnv1a(SECRET + dayKey + mode)`
  - Compara guess vs target por atributo
  - Retorna array de objetos comparación
- **Comparación por atributo**:
  - Exact match → verde
  - Parcial match (tipo, color) → amarillo
  - No match → rojo

#### `_lib/rateLimitRedis.js`

- **Propósito**: Proteger endpoint de abuso
- **Lógica**:
  - Store en memoria (Map)
  - Ventana de 1 minuto
  - Máximo 30 requests por IP
  - Headers `X-RateLimit-*` en respuestas

---

## 🗄️ Base de datos

### Tablas

#### `pokemon`

| Columna           | Tipo         | Descripción                                       |
| ----------------- | ------------ | ------------------------------------------------- |
| `id`              | INT          | ID numérico del Pokémon                           |
| `name`            | VARCHAR(100) | Nombre en minúsculas                              |
| `gen`             | INT          | Generación (1-9)                                  |
| `height_dm`       | INT          | Altura en decímetros                              |
| `weight_hg`       | INT          | Peso en hectogramos                               |
| `types`           | TEXT[]       | Array de tipos (tipo1, tipo2)                     |
| `habitat`         | VARCHAR(50)  | Hábitat                                           |
| `color`           | VARCHAR(50)  | Color predominante                                |
| `evolution_stage` | INT          | Nivel de evolución (1=básico, 2=etapa1, 3=etapa2) |

### Índices recomendados

```sql
CREATE INDEX idx_pokemon_name ON pokemon(name);
CREATE INDEX idx_pokemon_gen ON pokemon(gen);
CREATE INDEX idx_pokemon_id ON pokemon(id);
-- Para full-text search (opcional):
-- CREATE INDEX idx_pokemon_name_fts ON pokemon USING gin(to_tsvector('english', name));
```

---

## 🔒 Seguridad

### Autenticación

- **No hay usuarios registrados** (juego anónimo)
- **SECRET env var**: Se usa para generar el Pokémon del día de forma determinista
  - Debe ser diferente en local vs producción
  - Se valida en cada request a `/guess`

### Rate Limiting

- **Endpoint**: `/guess`
- **Configuración**:
  - 30 requests por minuto por IP
  - Ventana deslizante (sliding window)
  - Headers de respuesta:
    - `X-RateLimit-Limit`: máximo permitido
    - `X-RateLimit-Remaining`: restantes
    - `X-RateLimit-Reset`: timestamp del reset
    - `Retry-After`: segundos hasta reset (en 429)

### Headers de seguridad (en `netlify.toml`)

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## ⚡ Performance

### Frontend

- **Vite**: Dev server rápido, HMR optimizado
- **Debounce en búsqueda**: 150ms para evitar llamadas excesivas
- **LocalStorage**: Persistencia instantánea, sin latencia de red
- **Code splitting**: React lazy loading para rutas

### Backend

- **Cold starts**: Warm-up en `/meta` (llamado al cargar app)
- **Cache HTTP**: `/pokemon` cachea por 24h (max-age=86400)
- **Índices DB**: Búsquedas rápidas en name, gen, id
- **Rate limiting**: Previene abuso que puede degradar performance

### Optimizaciones futuras

- [ ] Full-text search con GIN + to_tsvector
- [ ] Edge cache para `/search`
- [ ] Pool de conexiones configurado en Neon

---

## 🚀 Despliegue

### Netlify

**Frontend**:

- Build: `npm run build` en `frontend/`
- Output: `frontend/dist/`
- CDN automático para assets estáticos

**Netlify Functions**:

- Carpeta: `netlify/functions/`
- Runtime: Node.js 18+
- Auto-deploy en push a `main/master`

### Variables de entorno en producción

En Netlify Dashboard → Site configuration → Environment variables:

- `DATABASE_URL`: Cadena de conexión a Neon DB
- `SECRET`: Semilla para target (obligatoria)

---

## 📊 Monitoreo y logging

### Actual

- `console.error` en functions (capturado por Netlify logs)
- Logs disponibles en Netlify Dashboard → Functions

### Recomendado

- [ ] Structured logging (pino/winston)
- [ ] Error tracking (Sentry/LogRocket)
- [ ] Analytics (Vercel Analytics o similar)

---

## 🔗 Referencias

- [Documentación de Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Documentación de Neon/PostgreSQL](https://neon.tech/docs)
- [Documentación de Vite](https://vitejs.dev/)

---

¿Dudas o sugerencias? Abre un issue en el repo. 🎮
