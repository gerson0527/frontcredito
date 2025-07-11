// Componente para verificar permisos antes de renderizar contenido
import React from 'react'
import { usePermissions, type PermissionModule, type PermissionAction } from '@/hooks/use-permissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  module: PermissionModule
  action?: PermissionAction
  fallback?: React.ReactNode
  showFallback?: boolean
}

export function PermissionGuard({ 
  children, 
  module, 
  action = 'ver', 
  fallback,
  showFallback = true
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions()

  const hasAccess = hasPermission(module, action)

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showFallback) {
      return (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-center text-destructive flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Acceso Denegado
            </CardTitle>
            <CardDescription className="text-center">
              No tienes permisos para {action} en el módulo de {module}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Contacta a tu administrador si necesitas acceso a esta funcionalidad.
            </p>
          </CardContent>
        </Card>
      )
    }
    
    return null
  }

  return <>{children}</>
}

// Hook para usar en componentes cuando solo necesitas el booleano
export function usePermissionCheck(module: PermissionModule, action: PermissionAction = 'ver') {
  const { hasPermission } = usePermissions()
  return hasPermission(module, action)
}
