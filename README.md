# Pokedle+ 🟩🟨🟥

Juego estilo **Pokedle / Wordle** donde tenés que adivinar el **Pokémon del día** usando pistas por columnas (Tipo, Hábitat, Color, Evolución, Altura, Peso, etc).

✅ Incluye **todas las generaciones (1–9)**  
✅ Incluye **modos por generación** (Gen 1, Gen 2, …)  
✅ Guarda intentos por día y por modo (no se pierde el progreso al recargar)  
✅ UI moderna + revelado progresivo de pistas (como el Pokedle original)  
✅ Backend serverless con Netlify Functions + PostgreSQL usando **Netlify DB (Neon)**

---

## 🌐 Demo / Producción

- **Sitio:** `https://pokedle-plus.netlify.app/`

---

## 🖼️ Screenshots

- Home (selección de modo)

  ![Home](docs/screenshots/home.png)

- Juego (tabla de pistas)

  ![Home](docs/screenshots/game.png)

- Ganaste

  ![Home](docs/screenshots/win.png)

---

## ✨ Features

### 🎮 Modos de juego

- **Clásico**: todas las generaciones
- **Generación I – IX**: juega solo Pokémon de esa generación

### 🧩 Sistema de pistas (como Pokedle)

Cada intento genera pistas por columnas:

- **Tipo 1**
- **Tipo 2**
- **Gen** _(solo en modo clásico)_
- **Hábitat**
- **Color**
- **Evolución** (nivel/etapa)
- **Altura**
- **Peso**

### 🎞️ Revelado progresivo

Las pistas se pintan una por una con animación (efecto original).

### 💾 Persistencia

El juego guarda:

- intentos del día
- estado ganado/perdido
- progreso por modo
- último modo jugado

Todo vía `localStorage`.

### ⚡ Performance

- debounce en búsqueda
- cache interno de resultados
- warm-up de endpoints para reducir cold starts
- DB optimizada con índices

### 🌍 Internacionalización (i18n)

- Soporte para **inglés y español**
- Selector de idioma en la UI
- Detección automática del idioma del navegador
- Persistencia de idioma seleccionado en localStorage
- Archivos de traducción en `frontend/src/locales/`

---

## 🧱 Tech Stack

### Frontend

- **React**
- **Vite**
- **TailwindCSS**
- **lucide-react** (iconos)

### Backend

- **Netlify Functions** (Node.js)
- **PostgreSQL** (Neon) vía **Netlify DB**

---

## 📁 Estructura del proyecto

```
pokedle-plus/
├─ frontend/
│  ├─ src/
│  │  ├─ components/   # Componentes React (Toast, ThemeToggle, LanguageSelector, etc.)
│  │  ├─ hooks/        # Custom hooks (useTheme, useToast, useI18n, etc.)
│  │  ├─ locales/       # Archivos de traducción (es.json, en.json)
│  │  └── utils/        # Utilidades (cn, etc.)
│  ├─ index.html
│  ├─ vite.config.js
│  └─ package.json
│
├─ netlify/
│  └─ functions/
│     ├─ _lib/
│     │  ├─ db.js
│     │  ├─ utils.js
│     │  ├─ rateLimit.js
│     │  └─ ...
│     ├─ meta.js
│     ├─ search.js
│     ├─ pokemon.js
│     └─ guess.js
│
├─ scripts/
│  ├─ apply-schema.js
│  ├─ seed-postgres.js
│  └─ db-indexes.js
│
├─ docs/
│  └─ architecture.md
│
├─ netlify.toml
├─ package.json
├─ README.md
├─ CONTRIBUTING.md
└─ .env (NO se commitea)
```

---

## 🌍 Internacionalización (i18n)

El proyecto soporta **inglés y español** con cambio dinámico de idioma.

### Selector de idioma

- Ubicado en el header de la aplicación
- Cambia entre English/Español
- Guarda preferencia en localStorage

### Detección automática

Al primer acceso, el sistema detecta el idioma del navegador:

- Si `navigator.language` empieza con `es-` → Español
- Cualquier otro idioma → Inglés

### Archivos de traducción

Los textos están en `frontend/src/locales/`:

- `es.json` – Traducciones en español
- `en.json` – Traducciones en inglés

### Cómo agregar nuevas traducciones

1. Abrí `frontend/src/locales/es.json` (o `en.json`)
2. Agrega tu clave con la notación de puntos:
   ```json
   "section": {
     "key": "Tu texto aquí"
   }
   ```
3. En tu componente, usá el hook `useI18n`:

   ```jsx
   import { useI18n } from "../hooks/useI18n";

   function MiComponente() {
     const { t } = useI18n();
     return <div>{t("section.key")}</div>;
   }
   ```

### Ejemplo de uso

```jsx
import { LanguageSelector } from "./components/LanguageSelector";
import { useI18n } from "../hooks/useI18n";

function Header() {
  const { t } = useI18n();

  return (
    <header>
      <h1>{t("title")}</h1>
      <LanguageSelector />
      <nav>{t("modes.classic")}</nav>
    </header>
  );
}
```

---

## ✅ Requisitos

- **Node.js 18+** (recomendado 20)
- **Netlify CLI**
- Cuenta de **Netlify** con **Netlify DB (Neon)** habilitado

---

## ⚙️ Instalación local

### 1) Clonar repo

```bash
git clone https://github.com/sebamoccagatta/PokedlePlus.git
cd PokedlePlus
```

### 2) Instalar dependencias

```bash
npm install
cd frontend
npm install
cd ..
```

---

## 🗄️ Configurar Base de Datos (Netlify DB / Neon)

Este proyecto usa PostgreSQL mediante Netlify DB (Neon).

### 1) Crear la base

En Netlify Dashboard:

- Site configuration → **Integrations / Extensions**
- Agregar **Neon** (Netlify DB)
- Crear database

Netlify va a crear variables automáticamente en el site:

- `NETLIFY_DATABASE_URL`
- `NETLIFY_DATABASE_URL_UNPOOLED`

---

## 🔑 Variables de entorno

### Paso 1: Copiar plantilla de variables

El proyecto incluye una plantilla de variables de entorno en `.env.example`. Copiala a un archivo `.env` en la raíz:

```bash
cp .env.example .env
```

### Variables requeridas

#### `.env` local

Editá tu `.env` con los siguientes valores:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
SECRET=tu-valor-seguro-aleatorio-aqui
```

| Variable       | Descripción                                                         | Ejemplo                                            |
| -------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (Neon / Netlify DB)                 | `postgresql://user:pass@host/db?sslmode=require`   |
| `SECRET`       | Semilla para generar el Pokémon del día (obligatorio en producción) | Generá una cadena aleatoria (mínimo 32 caracteres) |

> **NOTA IMPORTANTE**: El archivo `.env` está en `.gitignore`. **NUNCA** lo comitees o subas al repositorio.

### Cómo obtener los valores

#### 1. `DATABASE_URL`

1. Ve al panel de **Neon** o al dashboard de **Netlify DB**
2. Copia la cadena de conexión (Connection String)
3. Pegala en tu `.env`

#### 2. `SECRET`

Generá una cadena aleatoria segura usando uno de estos métodos:

```bash
# Usar openssl
openssl rand -base64 32

# O en PowerShell
[Convert]::ToBase64String((1..32|%{[char](Get-Random -Minimum 65 -Maximum 90)}))-replace '/',''
```

### Variables en Netlify (producción)

Para que el sitio funcione en Netlify, también debés configurar estas variables en el dashboard:

1. Ve a tu sitio en Netlify → **Site configuration** → **Environment variables**
2. Agrega:
   - `DATABASE_URL` → (la misma que usas local)
   - `SECRET` → (otra cadena aleatoria, diferente a la local)
3. Guarda y redespliega

### Verificar que se están leyendo

```bash
# Verificar DATABASE_URL
node -e "require('dotenv').config(); console.log('DB:', process.env.DATABASE_URL?.slice(0,50)+'...')"

# Verificar SECRET
node -e "require('dotenv').config(); console.log('SECRET:', process.env.SECRET?.slice(0,10)+'...')"
```

---

## 🧪 Crear Schema + Seed

### 1) Aplicar schema

```bash
npm run db:schema
```

### 2) Seed de Pokémon

```bash
npm run db:seed
```

### 3) Índices (RECOMENDADO)

Esto mejora muchísimo performance en `search`.

```bash
node scripts/db-indexes.js
```

---

## ▶️ Desarrollo local

### Ejecutar con Netlify Dev (RECOMENDADO)

```bash
npx netlify dev
```

Esto levanta:

- Frontend Vite
- Netlify Functions
- Redirects `/api/*` → `/.netlify/functions/*`

Abrí:

- http://localhost:8888

---

## 🔌 API Endpoints

El frontend consume endpoints usando `/api/*`.

### Meta

Devuelve día actual, dexMax, zona horaria, etc.

```http
GET /api/meta?mode=classic
```

Respuesta:

```json
{
  "dayKey": "2026-01-10",
  "dexMax": 1025,
  "tz": "America/Argentina/Buenos_Aires"
}
```

---

### Buscar Pokémon (autocomplete)

```http
GET /api/search?q=pika&offset=0&mode=classic
```

Respuesta:

```json
{
  "items": [{ "id": 25, "name": "pikachu", "sprite": "..." }],
  "nextOffset": 20,
  "hasMore": true
}
```

---

### Obtener datos de Pokémon

```http
GET /api/pokemon/25
```

---

### Guess (comparación)

```http
POST /api/guess
Content-Type: application/json

{
  "guessId": 25,
  "dayKey": "2026-01-10",
  "mode": "gen1"
}
```

---

## 🏗️ Scripts útiles

En raíz:

- Build frontend:

```bash
npm run build
```

- Schema:

```bash
npm run db:schema
```

- Seed:

```bash
npm run db:seed
```

---

## 🚀 Deploy a Netlify

### Deploy con CLI

Primero linkear:

```bash
netlify link
```

Deploy producción:

```bash
netlify deploy --prod
```

### Deploy automático con GitHub

> **NOTA**: Cuando tu Pull Request sea aceptada y mergeada a `main`/`master`, Netlify hace el deploy automático. No necesitas ejecutar `netlify deploy` manualmente.

1. Linkea tu repositorio de GitHub con Netlify en el dashboard
2. Cada push a `main`/`master` desencadena un nuevo deploy
3. Los logs de deploy están disponibles en Netlify Dashboard

---

## 🧠 Cómo funciona el Pokémon del día

- El backend usa un `dayKey` (YYYY-MM-DD)
- Según el modo elegido, genera un Pokémon del día determinístico
- Cada modo tiene su Pokémon distinto

---

## 🧊 Persistencia y Storage

Se guarda en `localStorage` usando keys por día y modo.

Ejemplo:

- `pokedleplus:v1:2026-01-10:classic`
- `pokedleplus:v1:2026-01-10:gen1`
- `pokedleplus:lastMode`

---

## 🧯 Troubleshooting

### ❌ “DATABASE_URL is missing (Netlify DB not configured)”

✅ Solución:

- Verificar `.env` local contiene:

```env
DATABASE_URL=postgresql://...
```

- En Netlify producción:
  - asegurarse de que Neon extension está instalada
  - variables creadas (`NETLIFY_DATABASE_URL*`)

---

### ❌ Search falla con 500

Puede pasar si:

- el schema no fue aplicado
- no se corrió seed
- faltan índices

✅ Solución:

```bash
npm run db:schema
npm run db:seed
node scripts/db-indexes.js
```

---

### ❌ Error: `Cannot use import statement outside a module`

Esto ocurre si la function se interpreta como CommonJS.

✅ Solución:

- Functions deben estar configuradas correctamente para ESM (ya incluido en este repo)
- Evitar requerir archivos ESM con require()

---

### ❌ “Rendered more hooks than during the previous render”

Esto pasa cuando se ponen Hooks dentro de condiciones.

✅ Solución:

- Hooks siempre arriba del componente
- Render condicional debe ser solo en `return`, no en hooks

---

## 🛣️ Roadmap / Ideas futuras

- 📊 Estadísticas por modo (winrate, intentos promedio)
- 🔥 Streaks por modo
- 📤 Share estilo Wordle (copiar emojis)
- 🧠 Hard Mode
- 🌍 Multi idioma (ES/EN)
- 🗓️ Archivo histórico de días anteriores

---

## 🙌 Créditos

Inspirado en **Pokedle**.

---

## 🧑‍💻 Autor

Hecho por **Sebastian Moccagatta**

---

## 📜 Licencia

MIT
