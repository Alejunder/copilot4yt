# Copilot4YT — Generador de Miniaturas para YouTube con IA

Aplicación full-stack que permite a creadores de contenido generar miniaturas profesionales para YouTube utilizando inteligencia artificial (Google Gemini). El usuario puede personalizar el estilo visual, la paleta de colores, la relación de aspecto y opcionalmente subir una imagen de referencia para guiar la generación.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Variables de Entorno](#variables-de-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)

---

## Descripción General

**Copilot4YT** es una herramienta SaaS que resuelve uno de los problemas más comunes de los YouTubers: crear miniaturas atractivas y profesionales de forma rápida. Mediante el modelo de generación de imágenes de Google Gemini, el usuario describe su video, elige un estilo y obtiene una miniatura lista para usar en segundos.

El proyecto está dividido en dos partes:
- **Cliente**: interfaz web moderna construida con React y Vite.
- **Servidor**: API REST construida con Express y TypeScript que gestiona la autenticación, la generación de imágenes y el almacenamiento.

---

## Stack Tecnológico

### Frontend (`client/`)

| Tecnología | Descripción |
|---|---|
| **React 19** | Biblioteca principal de UI |
| **TypeScript** | Tipado estático |
| **Vite** | Bundler y servidor de desarrollo ultrarrápido |
| **Tailwind CSS v4** | Framework de estilos utilitarios |
| **React Router DOM v7** | Enrutamiento del lado del cliente |
| **Motion (Framer Motion)** | Animaciones declarativas |
| **Lenis** | Scroll suave |
| **Axios** | Cliente HTTP con interceptores JWT |
| **Lucide React** | Biblioteca de iconos |
| **React Hot Toast** | Notificaciones toast |
| **React Fast Marquee** | Componente de marquee animado |

### Backend (`server/`)

| Tecnología | Descripción |
|---|---|
| **Node.js + Express** | Servidor y API REST |
| **TypeScript** | Tipado estático |
| **MongoDB + Mongoose** | Base de datos NoSQL y ODM |
| **Google Gemini AI** | Modelo de generación de imágenes (`gemini-3.1-flash-image-preview`) |
| **Cloudinary** | Almacenamiento y CDN de imágenes generadas |
| **Multer** | Manejo de subida de archivos (imagen de referencia) |
| **JSON Web Tokens (JWT)** | Autenticación stateless |
| **bcrypt** | Hash seguro de contraseñas |
| **dotenv** | Gestión de variables de entorno |
| **tsx + nodemon** | Ejecución y recarga en caliente para desarrollo |

### Despliegue

| Plataforma | Uso |
|---|---|
| **Vercel** | Hosting del frontend y del backend (serverless functions) |

---

## Instalación y Ejecución

## El link para verlo en producción: https://copilot4yt.vercel.app/ 

### Requisitos previos

- Node.js >= 18
- npm >= 9
- Una instancia de MongoDB (local o MongoDB Atlas)
- Cuenta en [Google AI Studio](https://aistudio.google.com/) para obtener una API key de Gemini
- Cuenta en [Cloudinary](https://cloudinary.com/) para el almacenamiento de imágenes

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/copilot4yt.git
cd copilot4yt
```

### 2. Configurar el servidor

```bash
cd server
npm install
```

Crea un archivo `.env` en `server/` con las variables necesarias (ver sección [Variables de Entorno](#variables-de-entorno)).

Ejecutar en modo desarrollo:

```bash
npm run server
```

El servidor estará disponible en `http://localhost:3000`.

### 3. Configurar el cliente

Abre una nueva terminal:

```bash
cd client
npm install
```

Crea un archivo `.env` en `client/` si necesitas sobreescribir la URL base de la API:

```env
VITE_BASE_URL=http://localhost:3000
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de Entorno

### `server/.env`

```env
# Base de datos
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/<dbname>

# Autenticación
JWT_SECRET=tu_clave_secreta_jwt

# Google Gemini AI
GEMINI_API_KEY=tu_api_key_de_gemini

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key_cloudinary
CLOUDINARY_API_SECRET=tu_api_secret_cloudinary

# Servidor
PORT=3000
NODE_ENV=development
```

### `client/.env` (opcional en desarrollo)

```env
VITE_BASE_URL=http://localhost:3000
```

> En producción sobre Vercel no es necesario: el rewrite de Vercel redirige `/api/*` al servidor automáticamente.

---

## Estructura del Proyecto

```
copilot4yt/
├── client/                     # Aplicación frontend (React + Vite)
│   ├── public/                 # Archivos estáticos públicos
│   └── src/
│       ├── assets/             # Recursos estáticos e imagen de assets
│       ├── components/         # Componentes reutilizables de UI
│       ├── configs/            # Configuración de Axios (api.ts)
│       ├── context/            # Contextos de React (AuthContext)
│       ├── data/               # Datos estáticos (pricing, features, testimonials…)
│       ├── pages/              # Páginas de la aplicación (rutas)
│       ├── sections/           # Secciones de la landing page
│       ├── App.tsx             # Componente raíz con las rutas
│       ├── main.tsx            # Punto de entrada
│       ├── types.ts            # Tipos TypeScript globales
│       └── globals.css         # Estilos globales y Tailwind
│
└── server/                     # API REST (Express + TypeScript)
    ├── configs/                # Configuración de DB y cliente de Gemini AI
    ├── controllers/            # Lógica de negocio por recurso
    │   ├── AuthControllers.ts  # Registro e inicio de sesión
    │   ├── ThumbnailController.ts  # Generación y gestión de miniaturas
    │   └── UserController.ts   # Perfil y datos del usuario
    ├── middlewares/            # Middlewares de Express
    │   ├── auth.ts             # Verificación de JWT
    │   └── upload.ts           # Manejo de subida de imágenes con Multer
    ├── models/                 # Esquemas de Mongoose
    │   ├── User.ts             # Modelo de usuario
    │   └── Thumbnail.ts        # Modelo de miniatura generada
    ├── routes/                 # Definición de rutas de la API
    │   ├── AuthRoutes.ts       # /api/auth
    │   ├── ThumbnailRoutes.ts  # /api/thumbnail
    │   └── UserRoutes.ts       # /api/user
    └── server.ts               # Punto de entrada del servidor
```

---

## Funcionalidades

- **Generación de miniaturas con IA**: Genera imágenes profesionales para YouTube en segundos usando el modelo `gemini-3.1-flash-image-preview` de Google.
- **Estilos visuales**: Elige entre 5 estilos de diseño: *Bold & Graphic*, *Tech/Futuristic*, *Minimalist*, *Photorealistic* e *Illustrated*.
- **Paletas de color**: 8 esquemas de color disponibles: *Vibrant*, *Sunset*, *Forest*, *Neon*, *Purple*, *Monochrome*, *Ocean* y *Pastel*.
- **Relaciones de aspecto**: Soporte para los formatos estándar de YouTube: `16:9`, `1:1` y `9:16`.
- **Imagen de referencia**: Sube una imagen como inspiración para que la IA tome como base composición y estilo.
- **Superposición de texto**: Opción para incluir texto superpuesto en la miniatura generada.
- **Autenticación de usuarios**: Registro e inicio de sesión con JWT. Las credenciales se almacenan con hash bcrypt.
- **Historial de generaciones**: Cada usuario puede consultar todas sus miniaturas generadas en `/my-generation`.
- **Vista previa de YouTube**: Visualiza cómo se verá la miniatura dentro de la interfaz de YouTube real.
- **Landing page completa**: Secciones de hero, características, testimonios y planes de precios.
- **Sistema de créditos**: Tres planes de pago (*Basic*, *Pro*, *Enterprise*) con distintas cantidades de créditos para generación.
- **Despliegue en Vercel**: Configurado para funcionar como monorepo en Vercel con rewrite de rutas `/api/*` al backend.
