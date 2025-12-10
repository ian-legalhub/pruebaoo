# Configuración de Cookies - Implementación Frontend

## ✅ Implementación Actual

El frontend está configurado correctamente para manejar cookies automáticamente usando **Axios**.

### Estructura de Archivos

```
app/lib/
├── api-config.ts          # Configuración de axios con cookies
├── auth-service.ts        # Servicio de autenticación
└── file-service.ts        # Servicio de archivos
```

---

## 🔧 Configuración de Axios

### `app/lib/api-config.ts`

```typescript
import axios from 'axios';

// Cliente para autenticación (Lemonflow)
export const auth_api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LEMON_API_URL,
  withCredentials: true,  // ⚠️ CRUCIAL: Envía cookies automáticamente
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente para archivos y OnlyOffice
export const files_api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // ⚠️ CRUCIAL: Envía cookies automáticamente
});

// Interceptor: Agrega tenant-id a TODAS las peticiones de archivos
files_api.interceptors.request.use((config) => {
  const tenant_id = localStorage.getItem('tenantId');
  if (tenant_id) {
    config.headers['tenant-id'] = tenant_id;
  }
  return config;
});

// Interceptor: Redirige al login si hay 401
files_api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📝 Uso en los Servicios

### Servicio de Autenticación

```typescript
// app/lib/auth-service.ts
import { auth_api } from './api-config';

export class AuthService {
  static async sign_in(credentials: LoginCredentials): Promise<void> {
    // La cookie se recibe automáticamente en la respuesta
    await auth_api.post('/auth/sign_in', credentials);
  }

  static async logout(): Promise<void> {
    // La cookie se envía automáticamente en la petición
    await auth_api.post('/auth/logout');
  }
}
```

### Servicio de Archivos

```typescript
// app/lib/file-service.ts
import { files_api } from './api-config';

export class FileService {
  static async list_files(): Promise<FileListResponse> {
    // Cookie + tenant-id se envían automáticamente
    const response = await files_api.get('/files');
    return response.data;
  }

  static async upload_file(file: File): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Cookie + tenant-id se envían automáticamente
    const response = await files_api.post('/files/upload', formData);
    return response.data;
  }
}
```

---

## 🍪 Flujo de Cookies

### 1. Login (Cookie se establece)

```
Usuario → Frontend → POST /auth/sign_in → Backend Lemonflow
                                              ↓
                                    Set-Cookie: sessionId=abc123
                                              ↓
                                         Navegador guarda
```

### 2. Request a Archivos (Cookie se envía)

```
Frontend → GET /files → files_api (axios)
              ↓
        withCredentials: true
              ↓
        Cookie: sessionId=abc123  (AUTOMÁTICO)
        tenant-id: xxx            (Interceptor)
              ↓
         Backend API
```

---

## 🔍 Verificación

### 1. Verifica que la Cookie se Envía

**Chrome DevTools:**
1. F12 → Network
2. Haz una petición (ej: listar archivos)
3. Click en la petición → Headers
4. Busca en "Request Headers":
   ```
   Cookie: sessionId=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   tenant-id: tu-tenant-id
   ```

### 2. Verifica que la Cookie Existe

**Chrome DevTools:**
1. F12 → Application → Cookies
2. Selecciona tu dominio
3. Busca `sessionId`

**Debe verse así:**
```
Name: sessionId
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Domain: tu-dominio.com (o localhost)
Path: /
HttpOnly: ✓
Secure: ✓
SameSite: Lax
```

---

## 🚨 Solución de Problemas

### ❌ Cookie no se envía

**Síntoma:** Backend responde 401, pero la cookie existe en el navegador.

**Verificación:**
1. Revisa que `withCredentials: true` esté en axios
2. Verifica el dominio de la cookie:
   ```javascript
   // En DevTools → Application → Cookies
   // Si frontend: localhost:3001
   // Cookie debe ser: localhost (sin puerto)
   // O sin dominio (se usa el origen de la petición)
   ```

**Solución - Limpia las cookies:**
```javascript
// DevTools → Application → Cookies
// Elimina todas las cookies
// Vuelve a hacer login
```

### ❌ tenant-id no se envía

**Síntoma:** Backend responde que falta tenant-id.

**Verificación:**
```javascript
// Verifica en localStorage
console.log(localStorage.getItem('tenantId'));
```

**Solución:**
```javascript
// Establece el tenant-id
localStorage.setItem('tenantId', 'tu-tenant-id');
// Recarga la página
window.location.reload();
```

O usa el componente TenantConfig que se mostrará automáticamente si falta.

### ❌ CORS Error

**Síntoma:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**El backend necesita:**
```typescript
// Backend cors.config.ts
export const corsConfig = {
  origin: [
    'http://localhost:3001',      // Frontend local
    'https://tu-frontend.com',    // Frontend producción
  ],
  credentials: true,  // ⚠️ IMPORTANTE
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'tenant-id'],
};
```

---

## 📦 Variables de Entorno

```env
# .env.local

# Backend de autenticación (Lemonflow)
NEXT_PUBLIC_LEMON_API_URL=https://pruebalegalhub.api.lemonflowapp.com

# Backend de archivos y OnlyOffice
NEXT_PUBLIC_API_URL=https://tu-backend-api.com
```

---

## 🎯 Checklist de Configuración

### Frontend ✅
- [x] Axios instalado
- [x] `withCredentials: true` configurado
- [x] Interceptor para tenant-id
- [x] Interceptor para redirección 401
- [x] Variables de entorno configuradas

### Backend (Requisitos)
- [ ] CORS configurado con `credentials: true`
- [ ] Cookie `sessionId` con `HttpOnly`, `Secure`, `SameSite`
- [ ] Endpoint `/auth/sign_in` establece cookie
- [ ] Endpoints protegidos validan cookie + tenant-id
- [ ] Cookie sin dominio específico (o dominio correcto)

---

## 💡 Resumen

**El frontend NO maneja cookies manualmente.**

Gracias a Axios:
- ✅ Las cookies se envían automáticamente (`withCredentials: true`)
- ✅ El tenant-id se agrega automáticamente (interceptor)
- ✅ Redirección a login es automática (interceptor 401)
- ✅ No necesitas `document.cookie` ni parseo manual
- ✅ No necesitas agregar headers manualmente

**Todo es transparente y automático.** 🎉


