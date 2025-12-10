# Lemon Front - Sistema de Autenticación y Gestión de Archivos

Sistema completo de autenticación y gestión de archivos construido con Next.js 16, TypeScript y Tailwind CSS.

## Características

- Autenticación con cookies (sessionId)
- Dashboard de gestión de archivos
- Subida de archivos (hasta 50MB)
- Descarga de archivos
- Eliminación de archivos
- Integración con OnlyOffice para edición de documentos
- Protección de rutas con middleware
- Diseño moderno y responsivo
- Soporte para modo oscuro

## Requisitos

- Node.js 18+
- npm o yarn
- Backend API configurado

## Instalación

1. Clona el repositorio
```bash
git clone <repository-url>
cd lemon-front
```

2. Instala las dependencias
```bash
npm install
```

3. Configura las variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_LEMON_API_URL=https://pruebalegalhub.api.lemonflowapp.com
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- `NEXT_PUBLIC_LEMON_API_URL`: URL del servidor de autenticación (Lemonflow)
- `NEXT_PUBLIC_API_URL`: URL del servidor de archivos y OnlyOffice

4. Inicia el servidor de desarrollo
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

6. Configura tu Tenant ID

Al acceder al dashboard por primera vez, se te pedirá configurar tu Tenant ID. Ingresa el ID proporcionado por tu administrador.

## Estructura del Proyecto

```
lemon-front/
├── app/
│   ├── components/
│   │   ├── file-list.tsx              # Lista de archivos con acciones
│   │   └── upload-file-modal.tsx      # Modal de subida de archivos
│   ├── contexts/
│   │   └── auth-context.tsx           # Contexto de autenticación
│   ├── dashboard/
│   │   └── page.tsx                   # Página del dashboard
│   ├── editor/
│   │   └── [fileId]/
│   │       └── page.tsx               # Editor OnlyOffice
│   ├── lib/
│   │   ├── auth-service.ts            # Servicio de autenticación
│   │   └── file-service.ts            # Servicio de archivos
│   ├── login/
│   │   └── page.tsx                   # Página de login
│   ├── types/
│   │   ├── auth.ts                    # Tipos de autenticación
│   │   └── file.ts                    # Tipos de archivos
│   ├── layout.tsx                     # Layout principal
│   └── page.tsx                       # Página de inicio
├── docs/
│   ├── AUTHENTICATION.md              # Documentación de autenticación
│   └── DASHBOARD.md                   # Documentación del dashboard
├── middleware.ts                      # Middleware de protección de rutas
└── .env.local                         # Variables de entorno (crear)
```

## Rutas

- `/` - Redirige automáticamente a `/dashboard`
- `/login` - Página de inicio de sesión
- `/dashboard` - Dashboard principal (requiere autenticación)
- `/editor/[fileId]` - Editor de documentos (requiere autenticación)

## API Endpoints Requeridos

### Autenticación (NEXT_PUBLIC_LEMON_API_URL)

- `POST /auth/sign_in` - Inicio de sesión
- `POST /auth/logout` - Cierre de sesión

### Archivos (NEXT_PUBLIC_API_URL)

- `POST /files/upload` - Subir archivo
- `GET /files` - Listar archivos
- `GET /files/:fileId` - Obtener metadatos
- `GET /files/:fileId/download` - Descargar archivo
- `POST /files/:fileId/delete` - Eliminar archivo
- `GET /files/:fileId/signed-url` - Obtener URL firmada
- `GET /onlyoffice/open-file/:fileId` - Abrir en editor

## Scripts Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta el linter
```

## Tecnologías

- **Next.js 16** - Framework de React
- **React 19** - Librería de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de CSS
- **Axios** - Cliente HTTP con soporte de cookies
- **Lucide React** - Iconos
- **OnlyOffice** - Editor de documentos

## Funcionalidades

### Autenticación

- Login con email y password
- Cookies automáticas (sessionId) con Axios
- Envío automático de cookies en todas las peticiones
- Tenant ID configurable para multi-tenancy
- Protección de rutas con proxy
- Logout con limpieza de sesión

### Gestión de Archivos

- Subida con validación de tamaño
- Lista con información detallada
- Descarga directa
- Eliminación con confirmación
- Edición con OnlyOffice

### Editor OnlyOffice

- Edición en tiempo real
- Guardado automático
- Soporte para Word, Excel, PowerPoint
- Comentarios y revisiones
- Control de versiones

## Personalización

### Colores

Los colores principales (amarillo/lemon) se pueden cambiar en los componentes:

```tsx
// De:
className="bg-gradient-to-r from-yellow-400 to-yellow-500"

// A:
className="bg-gradient-to-r from-blue-400 to-blue-500"
```

### Rutas Públicas

Para agregar más rutas públicas, edita `middleware.ts`:

```typescript
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
```

## Documentación Adicional

- [Documentación de Autenticación](docs/AUTHENTICATION.md)
- [Documentación del Dashboard](docs/DASHBOARD.md)
- [Configuración de Cookies](docs/COOKIES_SETUP.md) ⭐ Importante
- [Configuración de Tenant](docs/TENANT_SETUP.md)

## Solución de Problemas

### Error: "Error al conectar con el servidor"

- Verifica que las URLs en `.env.local` sean correctas
- Asegúrate de que los backends estén ejecutándose
- Revisa la configuración de CORS en los backends

### La sesión no persiste

- Confirma que el backend esté enviando la cookie `sessionId`
- Verifica que `credentials: 'include'` esté en todas las llamadas
- Revisa la configuración de cookies en el backend

### Archivos no se suben

- Verifica el tamaño del archivo (máx 50MB)
- Confirma que el endpoint `/files/upload` esté disponible
- Revisa los logs del backend para más detalles

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT.
