# Configuración de Tenant ID

## ¿Qué es el Tenant ID?

El **tenant-id** es un identificador único que se usa en sistemas multi-tenant para separar los datos de diferentes organizaciones o clientes.

En este sistema:
- La cookie `sessionId` autentica al usuario
- El header `tenant-id` identifica a qué organización pertenece

---

## 🔧 Configuración Automática

### Al Cargar el Dashboard

El componente `TenantConfig` se muestra automáticamente si no hay tenant-id configurado:

```typescript
// app/components/tenant-config.tsx
export function TenantConfig() {
  useEffect(() => {
    const current_tenant = get_tenant_id();
    if (!current_tenant) {
      setShowPrompt(true);  // Muestra modal para configurar
    }
  }, []);
  // ...
}
```

**Flujo:**
1. Usuario hace login → Redirige a dashboard
2. Dashboard carga → Verifica tenant-id
3. Si no existe → Muestra modal
4. Usuario ingresa tenant-id → Se guarda en localStorage
5. Página se recarga → tenant-id se envía en todas las peticiones

---

## 📝 Uso Manual

### Establecer Tenant ID

```typescript
import { set_tenant_id } from './lib/api-config';

// Establecer tenant-id
set_tenant_id('tenant-123');

// Recarga para que se aplique
window.location.reload();
```

### Obtener Tenant ID

```typescript
import { get_tenant_id } from './lib/api-config';

const tenant = get_tenant_id();
console.log(tenant);  // 'tenant-123' o null
```

### Eliminar Tenant ID

```typescript
localStorage.removeItem('tenantId');
window.location.reload();
```

---

## 🔄 Cómo se Envía el Tenant ID

### Configuración en Axios

```typescript
// app/lib/api-config.ts
files_api.interceptors.request.use((config) => {
  const tenant_id = localStorage.getItem('tenantId');
  
  if (tenant_id) {
    config.headers['tenant-id'] = tenant_id;  // Se agrega automáticamente
  }
  
  return config;
});
```

### En Cada Petición

```typescript
// app/lib/file-service.ts
const response = await files_api.get('/files');

// La petición HTTP incluye:
// Headers:
//   Cookie: sessionId=abc123...
//   tenant-id: tenant-123       ← Agregado automáticamente
```

---

## 🎯 Dónde se Usa

### API de Autenticación (NO usa tenant-id)

```typescript
// auth_api no usa tenant-id
await auth_api.post('/auth/sign_in', credentials);
await auth_api.post('/auth/logout');
```

**Razón:** El login es previo a conocer el tenant.

### API de Archivos (SÍ usa tenant-id)

```typescript
// files_api SIEMPRE envía tenant-id
await files_api.get('/files');                    // ✅ tenant-id
await files_api.post('/files/upload', formData);  // ✅ tenant-id
await files_api.get('/onlyoffice/open-file/123'); // ✅ tenant-id
```

**Razón:** Los archivos son específicos de cada tenant.

---

## 🔍 Verificación

### En el Navegador

**Chrome DevTools:**
1. F12 → Network
2. Haz una petición a archivos
3. Click en la petición → Headers
4. Busca en "Request Headers":
   ```
   tenant-id: tenant-123
   ```

### En localStorage

**Chrome DevTools:**
1. F12 → Application → Local Storage
2. Selecciona tu dominio
3. Busca `tenantId`

```
Key: tenantId
Value: tenant-123
```

---

## 🚨 Problemas Comunes

### ❌ Backend responde: "tenant-id is required"

**Causa:** No se está enviando el header tenant-id.

**Solución:**

1. Verifica que exista en localStorage:
   ```javascript
   console.log(localStorage.getItem('tenantId'));
   ```

2. Si es null, configúralo:
   ```javascript
   localStorage.setItem('tenantId', 'tu-tenant-id');
   window.location.reload();
   ```

3. Verifica que se envíe en la petición (DevTools → Network → Headers)

---

### ❌ Modal de tenant-id aparece cada vez

**Causa:** El tenant-id no se está guardando correctamente.

**Solución:**

1. Verifica que localStorage funcione:
   ```javascript
   localStorage.setItem('test', 'value');
   console.log(localStorage.getItem('test')); // Debe mostrar 'value'
   ```

2. Si estás en modo incógnito, localStorage no persiste.

---

### ❌ Cambié el tenant-id pero sigue usando el anterior

**Causa:** La página no se recargó después del cambio.

**Solución:**
```javascript
localStorage.setItem('tenantId', 'nuevo-tenant-id');
window.location.reload();  // ⚠️ IMPORTANTE
```

---

## 🏢 Multi-Tenant en Producción

### Opción 1: Subdominios

Cada tenant tiene su propio subdominio:

```
tenant-a.tuapp.com → tenantId: tenant-a
tenant-b.tuapp.com → tenantId: tenant-b
```

**Implementación:**
```typescript
// Extraer tenant del subdominio
const getTenantFromDomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  return parts[0]; // 'tenant-a'
};

// Auto-configurar al cargar
useEffect(() => {
  const tenant = getTenantFromDomain();
  set_tenant_id(tenant);
}, []);
```

### Opción 2: Después del Login

El backend retorna el tenant-id después del login:

```typescript
// Backend responde al login:
{
  user: { id: '123', email: 'user@example.com' },
  tenantId: 'tenant-abc'
}

// Frontend lo guarda:
const response = await auth_api.post('/auth/sign_in', credentials);
const { tenantId } = response.data;
set_tenant_id(tenantId);
```

### Opción 3: Manual (Implementación Actual)

Usuario configura manualmente su tenant-id la primera vez.

---

## 📦 Componente TenantConfig

### Uso en el Dashboard

```typescript
// app/dashboard/page.tsx
import { TenantConfig } from '../components/tenant-config';

export default function DashboardPage() {
  return (
    <div>
      <TenantConfig />  {/* Se muestra solo si falta tenant-id */}
      {/* Resto del dashboard */}
    </div>
  );
}
```

### Personalización

```typescript
// app/components/tenant-config.tsx

// Cambiar apariencia
className="bg-gradient-to-r from-blue-400 to-blue-500"

// Validación personalizada
if (tenant_input.length < 5) {
  alert('Tenant ID debe tener al menos 5 caracteres');
  return;
}

// Pre-llenar con valor por defecto
const [tenant_input, setTenantInput] = useState('default-tenant');
```

---

## 💡 Resumen

- ✅ Tenant ID se almacena en `localStorage`
- ✅ Se envía automáticamente en header `tenant-id` (interceptor)
- ✅ Modal automático si no está configurado
- ✅ Se puede cambiar manualmente cuando sea necesario
- ✅ Necesario para todas las peticiones de archivos

**El sistema es plug-and-play:** Solo necesitas configurar el tenant-id una vez.


