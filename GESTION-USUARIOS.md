# Gestión de Usuarios - CreditPro

## Descripción
El módulo de gestión de usuarios permite administrar todos los usuarios del sistema, incluyendo la creación, edición, visualización y eliminación de usuarios, así como la gestión de roles y permisos.

## Funcionalidades Implementadas

### ✅ Funcionalidades Completadas
- **Listado de usuarios** con tabla paginada
- **Filtros avanzados** (búsqueda, rol, estado)
- **KPIs** con estadísticas de usuarios
- **Modales para acciones** (crear, editar, ver, eliminar)
- **Sistema de notificaciones** con toast y panel
- **Datos mock** para desarrollo
- **Interfaz responsive** con tema oscuro/claro
- **Estados de usuario** (activo, inactivo, suspendido)
- **Roles de usuario** (admin, supervisor, asesor, usuario)

### 🔧 Funcionalidades Preparadas (Backend pendiente)
- **Servicio de API** con métodos completos
- **Validación de email** duplicado
- **Cambio de contraseña** 
- **Estadísticas avanzadas**
- **Log de actividades** de usuarios
- **Reset de contraseña** para administradores

## Estructura de Archivos

```
front/app/
├── features/sections/
│   └── gestion-usuarios.tsx        # Componente principal
├── routes/
│   └── gestion-usuarios.tsx        # Ruta de la página
├── services/
│   ├── usuario.service.ts          # Servicio de usuarios
│   └── api.config.ts               # Configuración de API
└── routes.ts                       # Configuración de rutas
```

## Uso

### 1. Acceso al Módulo
- **Desde el dashboard**: Click en "Gestión de Usuarios" en el sidebar
- **Ruta directa**: `/gestion-usuarios`

### 2. Funcionalidades de la Interfaz

#### Tabla de Usuarios
- **Columnas**: Nombre, Email, Rol, Estado, Último acceso, Acciones
- **Filtros**: Búsqueda por nombre/email, filtro por rol, filtro por estado
- **Paginación**: Navegación por páginas con tamaño configurable
- **Ordenamiento**: Click en headers para ordenar

#### Acciones Disponibles
- **👁️ Ver**: Visualizar todos los datos del usuario
- **✏️ Editar**: Modificar información del usuario
- **🗑️ Eliminar**: Eliminar usuario del sistema
- **➕ Nuevo**: Crear nuevo usuario

#### KPIs
- **Total de usuarios**
- **Usuarios activos** con porcentaje
- **Usuarios por rol** (admin, supervisor, asesor, usuario)
- **Usuarios por estado** (activo, inactivo, suspendido)

### 3. Datos Mock Incluidos

El sistema incluye 8 usuarios de ejemplo:

```typescript
// Roles disponibles
- admin: Ana María Rodríguez
- supervisor: Carlos Mendoza, Carmen Vásquez  
- asesor: Laura Martínez, Roberto Silva, Patricia Gómez, Diego Ramírez
- usuario: Miguel Torres

// Estados disponibles
- activo: 6 usuarios
- inactivo: 1 usuario (Roberto Silva)
- suspendido: 1 usuario (Miguel Torres)

// Sucursales
- Principal, Norte, Sur, Centro
```

## Configuración

### Variables de Entorno
```env
REACT_APP_API_URL=http://localhost:3001  # URL del backend
```

### Estructura de Usuario
```typescript
interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: 'admin' | 'asesor' | 'supervisor' | 'usuario'
  estado: 'activo' | 'inactivo' | 'suspendido'
  fechaCreacion: string
  ultimoAcceso: string
  telefono: string
  sucursal: string
  avatar?: string
}
```

## Próximos Pasos

### 🔄 Integración con Backend
1. **Conectar con API real** (reemplazar datos mock)
2. **Implementar autenticación** y autorización
3. **Validaciones del servidor**
4. **Manejo de errores** mejorado

### 🎨 Mejoras de UI/UX
1. **Subida de avatar** para usuarios
2. **Filtros avanzados** adicionales
3. **Exportación** de datos a Excel/PDF
4. **Búsqueda avanzada** con múltiples criterios

### 🔐 Seguridad y Permisos
1. **Sistema de permisos** granular
2. **Auditoría de acciones**
3. **Historial de cambios**
4. **Autenticación de 2 factores**

## Notas Técnicas

- **Framework**: React con TypeScript
- **Routing**: React Router v7
- **UI Components**: Shadcn/ui
- **Estado**: React hooks (useState, useEffect)
- **Notificaciones**: Toast + Panel de notificaciones
- **Temas**: Soporte para modo oscuro/claro
- **Responsivo**: Diseño adaptativo para móviles

## Comandos Útiles

```bash
# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar pruebas
npm run test
```

---

**Autor**: Sistema CreditPro  
**Fecha**: 9 de julio de 2025  
**Versión**: 1.0.0 (Mock Data)
