// Hook personalizado para manejar permisos
import { useUser } from "@/contexts/UserContext"

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
  const { user } = useUser()

  const hasPermission = (module: PermissionModule, action: PermissionAction): boolean => {
    if (!user || !user.permisos) {
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
    return user?.role === 'admin'
  }

  return {
    user,
    hasPermission,
    hasAnyPermission,
    canViewModule,
    canCreateModule,
    canEditModule,
    canDeleteFromModule,
    isAdmin
  }
}
