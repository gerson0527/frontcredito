// Hook personalizado para manejar permisos
import { useAuth } from "@/contexts/AuthContext"

export type PermissionModule = 
  | 'creditos' 
  | 'clientes' 
  | 'asesores' 
  | 'bancos' 
  | 'financieras' 
  | 'objetivos' 
  | 'reportes' 
  | 'comisiones' 
  | 'configuracion' 
  | 'gestionUsuarios'

export type PermissionAction = 'ver' | 'crear' | 'editar' | 'eliminar'

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (module: PermissionModule, action: PermissionAction): boolean => {
    if (!user) {
      return false
    }
    // Si es admin, tiene todos los permisos
    if (user.rol === 'admin') {
      return true
    }

    // Verificar permisos específicos
    if (!user.permisos) {
      return false
    }

    const modulePermissions = user.permisos[module]
    if (!modulePermissions) {
      return false
    }

    return modulePermissions[action] === true
  }

  const hasAnyPermission = (module: PermissionModule): boolean => {
    if (!user || !user.permisos) {
      return false
    }

    const modulePermissions = user.permisos[module]
    if (!modulePermissions) {
      return false
    }

    return modulePermissions.ver || modulePermissions.crear || modulePermissions.editar || modulePermissions.eliminar
  }

  const canViewModule = (module: PermissionModule): boolean => {
    return hasPermission(module, 'ver')
  }

  const canCreateModule = (module: PermissionModule): boolean => {
    return hasPermission(module, 'crear')
  }

  const canEditModule = (module: PermissionModule): boolean => {
    return hasPermission(module, 'editar')
  }

  const canDeleteFromModule = (module: PermissionModule): boolean => {
    return hasPermission(module, 'eliminar')
  }

  const isAdmin = (): boolean => {
    return user?.rol === 'admin' || user?.rol === 'superadmin'
  }

  // Alias para compatibilidad con otros componentes
  const canView = (module: PermissionModule): boolean => {
    return canViewModule(module)
  }

  const canCreate = (module: PermissionModule): boolean => {
    return canCreateModule(module)
  }

  const canEdit = (module: PermissionModule): boolean => {
    return canEditModule(module)
  }

  const canDelete = (module: PermissionModule): boolean => {
    return canDeleteFromModule(module)
  }

  return {
    user,
    hasPermission,
    hasAnyPermission,
    canViewModule,
    canCreateModule,
    canEditModule,
    canDeleteFromModule,
    // Alias para otros componentes
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin
  }
}
