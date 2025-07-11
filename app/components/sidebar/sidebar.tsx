import { Building2, DollarSign, CreditCard, FileText, Home, Target, UserCheck, Users, Settings, LogOut } from "lucide-react"
import { AuthService } from '@/services/auth.service'
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router'
import { usePermissions, type PermissionModule } from '@/hooks/use-permissions' // 🎯 IMPORTAR HOOK DE PERMISOS

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  className?: string
  onLogout?: () => void
}

// 🎯 MAPEAR ITEMS CON SUS PERMISOS CORRESPONDIENTES
const sidebarItems = [
  { icon: Home, label: "Dashboard", id: "dashboard", permission: null }, // Dashboard siempre visible
  { icon: Users, label: "Clientes", id: "clientes", permission: "clientes" as PermissionModule },
  { icon: UserCheck, label: "Asesores", id: "asesores", permission: "asesores" as PermissionModule },
  { icon: Building2, label: "Bancos", id: "bancos", permission: "bancos" as PermissionModule },
  { icon: CreditCard, label: "Financieras", id: "financieras", permission: "financieras" as PermissionModule },
  { icon: DollarSign, label: "Créditos", id: "creditos", permission: "creditos" as PermissionModule },
  { icon: Target, label: "Objetivos", id: "objetivos", permission: "objetivos" as PermissionModule },
  { icon: FileText, label: "Reportes", id: "reportes", permission: "reportes" as PermissionModule },
  { icon: FileText, label: "Comisiones", id: "comisiones", permission: "comisiones" as PermissionModule },
  { icon: FileText, label: "Gestión de Usuarios", id: "gestion-usuarios", permission: "gestionUsuarios" as PermissionModule },
  { icon: Settings, label: "Configuración", id: "configuracion", permission: "configuracion" as PermissionModule },
]

export function Sidebar({ activeSection, onSectionChange, className = "" }: SidebarProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canViewModule, user } = usePermissions(); // 🎯 USAR HOOK DE PERMISOS

  // 🎯 FILTRAR ITEMS SEGÚN PERMISOS
  const visibleItems = sidebarItems.filter(item => {
    // Dashboard siempre visible
    if (!item.permission) return true;
    
    // Verificar si el usuario tiene permisos para ver este módulo
    return canViewModule(item.permission);
  });

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      navigate('/')
      toast({
        title: 'Cierre de sesión',
        description: 'Has cerrado sesión exitosamente',
        variant: 'default',
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className={`flex h-screen max-h-screen flex-col bg-muted/40 fixed top-0 left-0 w-[220px] lg:w-[280px] ${className}`}>
      {/* Header del sidebar */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-5 font-semibold">
          <CreditCard className="h-6 w-6" />
          <span>CreditPro</span>
        </div>
      </div>

      {/* Contenido del sidebar con scroll controlado */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Navegación principal */}
        <nav className="flex-1 px-2 lg:px-4 py-4 overflow-y-auto">
          <div className="space-y-2">            
            {/* 🎯 USAR ITEMS FILTRADOS */}
            {visibleItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all hover:bg-muted hover:text-primary ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
            
            {/* 🎯 MENSAJE SI NO HAY PERMISOS */}
            {visibleItems.length === 1 && ( // Solo dashboard visible
              <div className="px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">
                  No tienes permisos para acceder a otros módulos
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="flex-shrink-0 border-t px-2 lg:px-4 py-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all hover:bg-muted hover:text-primary text-muted-foreground"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  )
}
