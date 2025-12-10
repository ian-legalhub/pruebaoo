# Dashboard de Gestión de Archivos

## Descripción

Sistema completo de gestión de archivos con subida, listado, descarga, edición y eliminación. Integrado con OnlyOffice para edición de documentos en línea.

## Características Implementadas

### 1. Dashboard Principal (`/dashboard`)

- Listado de todos los archivos del usuario
- Información detallada: nombre, tamaño, versión, autor, fecha
- Actualización automática después de cada acción
- Diseño responsivo y moderno

### 2. Subida de Archivos

**Características:**
- Modal intuitivo para subir archivos
- Drag & drop visual
- Validación de tamaño (máx. 50MB)
- Previsualización del archivo seleccionado
- Indicador de progreso durante la subida

**Metadatos opcionales:**
- `isContract`: Marcar como contrato
- `contractId`: ID del contrato asociado
- `isPublic`: Visibilidad del archivo

### 3. Acciones sobre Archivos

Al pasar el mouse sobre un archivo, se muestran botones de acción:

#### Editar (Icono azul)
- Abre el archivo en OnlyOffice Editor
- Permite edición en tiempo real
- Soporte para Word, Excel, PowerPoint
- Guardado automático
- Control de versiones

#### Descargar (Icono verde)
- Descarga directa del archivo
- Mantiene el nombre original
- Indicador de descarga en progreso

#### Ver Versiones (Icono morado)
- Muestra historial de versiones
- (Actualmente muestra mensaje "próximamente")

#### Eliminar (Icono rojo)
- Solicita confirmación antes de eliminar
- Refresca la lista automáticamente

### 4. Editor OnlyOffice (`/editor/[fileId]`)

**Características:**
- Interfaz de edición completa
- Guardado automático
- Colaboración en tiempo real
- Comentarios y revisiones
- Soporte de formatos:
  - Word (.docx, .doc)
  - Excel (.xlsx, .xls)
  - PowerPoint (.pptx, .ppt)

**Configuración:**
```javascript
{
  document: {
    fileType: "docx",
    key: "unique_key",
    title: "nombre.docx",
    permissions: {
      edit: true,
      download: true,
      comment: true,
      fillForms: true,
      review: true
    }
  },
  editorConfig: {
    lang: "es",
    mode: "edit",
    customization: {
      autosave: true,
      comments: true
    }
  }
}
```

## Estructura de Archivos

```
app/
├── dashboard/
│   └── page.tsx                    # Página principal del dashboard
├── editor/
│   └── [fileId]/
│       └── page.tsx                # Editor OnlyOffice
├── components/
│   ├── file-list.tsx               # Lista de archivos con acciones
│   └── upload-file-modal.tsx      # Modal de subida
├── lib/
│   └── file-service.ts             # Servicio API de archivos
└── types/
    └── file.ts                     # Tipos TypeScript
```

## Uso del Dashboard

### Subir un Archivo

```typescript
// Abrir el modal
setIsUploadModalOpen(true);

// El modal maneja la subida automáticamente
// Después del éxito, refresca la lista
```

### Listar Archivos

```typescript
const response = await FileService.list_files();
setFiles(response.files);

// Con filtros
const contractFiles = await FileService.list_files({ 
  isContract: 'true' 
});
```

### Descargar Archivo

```typescript
await FileService.download_file(fileId, fileName);
```

### Eliminar Archivo

```typescript
await FileService.delete_file(fileId);
```

### Abrir en Editor

```typescript
const config = await FileService.open_in_editor(fileId);
router.push(`/editor/${fileId}`);
```

## Iconos de Archivos

El sistema muestra diferentes iconos según el tipo de archivo:

- **Documentos Word**: Icono azul
- **Hojas de cálculo**: Icono verde
- **Presentaciones**: Icono naranja
- **Imágenes**: Icono morado
- **Otros**: Icono gris

## Formato de Archivos

### FileMetadata

```typescript
interface FileMetadata {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;           // en bytes
  mimeType: string;
  fileExtension: string;
  version: number;
  uploadedBy: string;
  uploadedByName: string;
  isContract?: boolean;
  contractId?: string;
  isPublic?: boolean;
  createdAt: string;          // ISO 8601
  updatedAt: string;          // ISO 8601
}
```

## Funciones Auxiliares

### Formatear Tamaño de Archivo

```typescript
const format_file_size = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
```

### Formatear Fecha

```typescript
const format_date = (dateString: string): string => {
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}
```

## Estados de Carga

- **isLoading**: Carga inicial de archivos
- **loadingAction**: Acción específica en progreso (download-{id}, delete-{id})
- **hoveredFile**: ID del archivo sobre el que está el mouse

## Integración con OnlyOffice

### Cargar el Script

```typescript
const script = document.createElement('script');
script.src = config.editorApiUrl;
document.head.appendChild(script);
```

### Inicializar el Editor

```typescript
new window.DocsAPI.DocEditor('editor-container', {
  ...config.config,
  events: {
    onAppReady: () => console.log('✅ Editor listo'),
    onError: (event) => console.error('❌ Error:', event.data),
    onDocumentStateChange: (event) => console.log('Cambio:', event.data)
  }
});
```

## Personalización

### Cambiar Colores de Acción

En `file-list.tsx`:

```typescript
// Editar - azul
className="hover:bg-blue-50 text-blue-600"

// Descargar - verde
className="hover:bg-green-50 text-green-600"

// Versiones - morado
className="hover:bg-purple-50 text-purple-600"

// Eliminar - rojo
className="hover:bg-red-50 text-red-600"
```

### Agregar Filtros al Dashboard

```typescript
const [filter, setFilter] = useState({ isContract: 'false' });

const load_files = async () => {
  const response = await FileService.list_files(filter);
  setFiles(response.files);
};
```

## Navegación

- `/` → Redirige automáticamente a `/dashboard`
- `/login` → Página de inicio de sesión
- `/dashboard` → Dashboard principal
- `/editor/[fileId]` → Editor de documentos

## Middleware

El middleware protege automáticamente:
- `/dashboard` requiere autenticación
- `/editor/*` requiere autenticación
- Redirige a `/login` si no hay sesión
- Redirige a `/dashboard` después del login

## Próximas Funcionalidades

- Ver historial de versiones
- Restaurar versión anterior
- Compartir archivos con URL firmada
- Búsqueda y filtros avanzados
- Vista en cuadrícula/lista
- Carpetas y organización


