# Sistema de Autenticación - Lemon

## Descripción

Sistema de autenticación completo implementado en Next.js 16 con TypeScript, que incluye manejo de cookies, protección de rutas y una interfaz moderna.

## Estructura del Proyecto

```
app/
├── types/
│   └── auth.ts                 # Tipos TypeScript para autenticación
├── lib/
│   ├── auth-service.ts         # Servicio para llamadas a la API
│   └── cookies.ts              # Utilidad para manejo de cookies
├── contexts/
│   └── auth-context.tsx        # Contexto de React para estado global
├── components/
│   └── protected-route.tsx     # HOC para proteger componentes
├── login/
│   └── page.tsx                # Página de inicio de sesión
└── layout.tsx                  # Layout principal con AuthProvider

middleware.ts                   # Middleware para protección de rutas
```

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_LEMON_API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

- `NEXT_PUBLIC_LEMON_API_URL`: URL para autenticación (sign_in, logout)
- `NEXT_PUBLIC_API_URL`: URL para gestión de archivos y OnlyOffice

### 2. API Backend

El sistema espera los siguientes endpoints en tu backend:

#### POST /auth/sign_in

Autentica un usuario con email y password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Usuario"
  }
}
```

**Headers:** Debe establecer una cookie `auth_token` con el token JWT.

#### POST /auth/logout

Cierra la sesión del usuario.

**Headers:** Debe incluir la cookie `auth_token`.

#### GET /auth/verify

Verifica si la sesión actual es válida.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Usuario"
  }
}
```

**Headers:** Debe incluir la cookie `auth_token`.

## Uso

### Usar el Hook useAuth

```tsx
'use client';

import { useAuth } from '@/app/contexts/auth-context';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <p>Bienvenido, {user?.email}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### Proteger una Página Completa

Usa el componente `ProtectedRoute`:

```tsx
'use client';

import { ProtectedRoute } from '@/app/components/protected-route';

export default function PrivatePage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Contenido Protegido</h1>
        <p>Solo usuarios autenticados pueden ver esto</p>
      </div>
    </ProtectedRoute>
  );
}
```

### Middleware Automático

El middleware en `middleware.ts` protege automáticamente todas las rutas excepto `/login`. Si un usuario no autenticado intenta acceder a una ruta protegida, será redirigido a `/login`.

Para agregar más rutas públicas, edita el array `PUBLIC_PATHS`:

```typescript
const PUBLIC_PATHS = ['/login', '/register', '/forgot-password'];
```

## Características

### Manejo de Cookies

- Las cookies se establecen automáticamente después del login
- Duración predeterminada: 7 días
- `SameSite=Strict` para mayor seguridad
- Las cookies se eliminan automáticamente al cerrar sesión

### Protección de Rutas

- **Middleware nivel aplicación**: Protege todas las rutas automáticamente
- **HOC ProtectedRoute**: Para proteger componentes específicos
- Redirección automática a `/login` para usuarios no autenticados
- Redirección automática a `/` para usuarios autenticados que intentan acceder a `/login`

### Estado Global

- Contexto de React con `AuthProvider`
- Estado persistente durante la sesión
- Verificación automática de sesión al cargar la aplicación
- Hook `useAuth` para acceder al estado desde cualquier componente

### UI Moderna

- Diseño responsivo con Tailwind CSS
- Tema oscuro compatible
- Animaciones y transiciones suaves
- Iconos de Lucide React
- Mensajes de error claros

## Flujo de Autenticación

1. Usuario visita la aplicación
2. Middleware verifica si existe cookie `auth_token`
3. Si no hay cookie, redirige a `/login`
4. Usuario ingresa credenciales
5. Frontend llama a `/auth/sign_in`
6. Backend valida y retorna token + datos del usuario
7. Frontend guarda token en cookie
8. Usuario es redirigido a la página principal
9. En cada carga, `AuthContext` verifica la sesión con `/auth/verify`

## Seguridad

- Las contraseñas nunca se almacenan en el frontend
- Los tokens se envían solo con `credentials: 'include'`
- Cookies con flag `SameSite=Strict`
- Validación de sesión en cada carga de la aplicación
- Manejo seguro de errores sin exponer información sensible

## Personalización

### Cambiar Duración de la Cookie

En `app/contexts/auth-context.tsx`:

```typescript
CookieManager.set('auth_token', response.token, 14); // 14 días
```

### Personalizar Redirecciones

En `middleware.ts`:

```typescript
if (!auth_token && !is_public_path) {
  const login_url = new URL('/login', request.url);
  login_url.searchParams.set('redirect', pathname);
  return NextResponse.redirect(login_url);
}
```

### Agregar Más Campos al Usuario

En `app/types/auth.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}
```

## Solución de Problemas

### Error: "Sesión no válida"

- Verifica que el backend esté ejecutándose
- Confirma que la URL de la API en `.env.local` sea correcta
- Verifica que el backend esté retornando las cookies correctamente

### Redirección Infinita

- Asegúrate de que `/login` esté en `PUBLIC_PATHS`
- Verifica que el middleware no esté bloqueando recursos estáticos

### Usuario no se mantiene autenticado

- Verifica que las cookies se estén estableciendo correctamente
- Confirma que el backend esté enviando el token en la respuesta
- Revisa la configuración de CORS en el backend

