# Contribuyendo a Pokedle+ 🟩🟨🟥

Gracias por tu interés en contribuir a Pokedle+! Este documento te guiará para configurar el proyecto y entender cómo funcionan las contribuciones.

---

## 📋 Tabla de contenidos

- [Prerequisitos](#-prerequisitos)
- [Configuración local](#-configuración-local)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Scripts disponibles](#-scripts-disponibles)
- [Convenciones de código](#-convenciones-de-código)
- [Flujo de trabajo](#-flujo-de-trabajo)
- [Reportando bugs](#-reportando-bugs)
- [Solicitando features](#-solicitando-features)

---

## 📦 Prerequisitos

Asegurate de tener instalado:

- **Node.js 18+** (recomendado 20)
- **npm** (viene con Node.js)
- **Git**
- **Netlify CLI** (opcional, para desarrollo local)
  ```bash
  npm install -g netlify-cli
  ```

---

## ⚙️ Configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/sebamoccagatta/PokedlePlus.git
cd PokedlePlus
```

### 2. Instalar dependencias

```bash
# Dependencias del backend (raíz)
npm install

# Dependencias del frontend
cd frontend
npm install
cd ..
```

### 3. Configurar variables de entorno

El proyecto usa variables de entorno para conexión a la base de datos y configuración de seguridad.

1. **Copiar la plantilla**:

```bash
cp .env.example .env
```

2. **Editar `.env`** con tus valores:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
SECRET=tu-valor-seguro-aleatorio-aqui
```

> **IMPORTANTE**: No comitees el archivo `.env`. Está incluido en `.gitignore`.

Para obtener `DATABASE_URL`:

- Crea una base en **Neon** (Netlify DB)
- Copia la cadena de conexión desde el dashboard

### 4. Crear y seedar la base de datos

```bash
# Aplicar esquema
npm run db:schema

# Llenar con datos de Pokémon
npm run db:seed

# (Opcional) Crear índices para mejor performance
node scripts/db-indexes.js
```

### 5. Ejecutar en desarrollo

Opción A - **Netlify Dev** (recomendado, simula producción):

```bash
npx netlify dev
```

Abre http://localhost:8888 en tu navegador.

Opción B - **Solo frontend** (más rápido para UI):

```bash
cd frontend
npm run dev
```

Abre http://localhost:5173 en tu navegador.

---

## 📁 Estructura del proyecto

```
pokedle-plus/
├── frontend/               # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # Componentes React (Toast, ThemeToggle, etc.)
│   │   ├── hooks/        # Custom hooks (useTheme, useToast)
│   │   └── utils/        # Utilidades (cn, etc.)
│   ├── index.html
│   └── package.json
├── netlify/
│   └── functions/          # Backend serverless (Node.js)
│       ├── _lib/           # Librerías compartidas (db, utils, rateLimit)
│       ├── guess.js         # Endpoint POST /api/guess
│       ├── search.js        # Endpoint GET /api/search
│       ├── pokemon.js       # Endpoint GET /api/pokemon/:id
│       └── meta.js         # Endpoint GET /api/meta
├── scripts/               # Scripts de base de datos
│   ├── apply-schema.js    # Crear tablas
│   ├── seed-postgres.js   # Insertar datos de Pokémon
│   └── db-indexes.js      # Crear índices
├── docs/                  # Documentación y assets
│   ├── architecture.md    # Arquitectura del sistema
│   └── screenshots/       # Capturas del juego
├── netlify.toml          # Configuración de Netlify
├── package.json          # Dependencias del backend
├── .env.example          # Plantilla de variables de entorno
└── README.md
```

---

## 🎬 Scripts disponibles

### En la raíz (backend)

| Comando             | Descripción                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run db:schema` | Crea las tablas en PostgreSQL                          |
| `npm run db:seed`   | Inserta los datos de Pokémon (todos los generaciones)  |
| `npm run dev`       | Ejecuta `netlify dev` (frontend + functions)           |
| `npm run build`     | Construye el frontend (`cd frontend && npm run build`) |
| `npm run lint`      | Ejecuta ESLint en todo el proyecto                     |

### En `frontend/`

| Comando           | Descripción                           |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Ejecuta Vite dev server (puerto 5173) |
| `npm run build`   | Construye el frontend para producción |
| `npm run preview` | Previsualiza el build de producción   |
| `npm run lint`    | Ejecuta ESLint en el frontend         |

---

## 🎨 Convenciones de código

### JavaScript/React

- Usar **ES6+** (const/let, arrow functions, destructuring)
- Componentes funcionales con **hooks**
- Usar **clsx** + **tailwind-merge** para clases dinámicas:

```jsx
import { cn } from "../utils/cn";

<div className={cn("base-class", isActive && "active-class")} />;
```

- Nombres de componentes en **PascalCase**
- Nombres de funciones/variables en **camelCase**

### Formato

- El proyecto usa **ESLint** con reglas de React y Prettier
- Antes de commitear, ejecuta:

```bash
npm run lint
```

### Backend (Netlify Functions)

- Usar **async/await**
- Validar entradas en todos los endpoints
- Retornar respuestas JSON consistentes:

```js
{
  statusCode: 200,
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ ... })
}
```

- Manejar errores con try/catch y loggearlos

---

## 🔄 Flujo de trabajo

### 1. Crear una rama

```bash
# Desde master/main
git checkout -b feature/tu-nueva-feature
```

### 2. Hacer cambios

```bash
# Editar archivos
git add .
git commit -m "feat: descripción concisa de tu cambio"
```

Usa el formato de **Conventional Commits**:

- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` formato, missing semi colons, etc.
- `refactor:` refactoring de código
- `test:` agregando tests
- `chore:` actualizando tareas, configs, etc.

### 3. Push y Pull Request

```bash
git push origin feature/tu-nueva-feature
```

Luego crea un **Pull Request** en GitHub desde tu rama a `main/master`.

### 4. Revisión

- Tu PR será revisada por el equipo
- Solicita feedback si es necesario
- Se aplican cambios sugeridos

### 5. Merge

- Una vez aprobada, la PR se mergea a `main/master`
- Tu rama puede eliminarse:

```bash
git checkout main
git branch -d feature/tu-nueva-feature
```

---

## 🐛 Reportando bugs

Para reportar bugs, crea un issue en GitHub con la siguiente plantilla:

```
### Descripción
Breve descripción del problema.

### Pasos para reproducir
1. Ir a '...'
2. Click en '...'
3. Ver que '...' ocurre

### Comportamiento esperado
Lo que debería pasar.

### Comportamiento actual
Lo que está pasando.

### Capturas de pantalla
Si aplica, adjunta screenshots.

### Entorno
- Navegador: [ej. Chrome 120]
- OS: [ej. Windows 11]
- Versión del proyecto: [ej. v1.0.0]
```

---

## 💡 Solicitando features

¿Tenes una idea para mejorar Pokedle+? Crea un issue con la plantilla:

```
### Descripción de la feature
Qué querés agregar o cambiar.

### Motivación
Por qué es útil.

### Propuesta de implementación (opcional)
Cómo lo harías (tecnología, aproximación).

### Alternativas consideradas (opcional)
Otras opciones evaluadas.
```

---

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licencian bajo la misma licencia del proyecto (revisar `LICENSE`).

---

## ❓ Preguntas frecuentes

**¿Necesito configurar Netlify?**

- No obligatoriamente. Podes desarrollar localmente sin Netlify.

**¿Dónde encuentro documentación de arquitectura?**

- Ve a `docs/architecture.md` para detalles técnicos.

**¿Cómo testeo los endpoints de Netlify Functions?**

- Usa `npx netlify dev` para simular el entorno serverless localmente.

---

¿Tenés dudas? Abre un issue o contacta al equipo del proyecto. ¡Gracias por contribuir! 🎮
