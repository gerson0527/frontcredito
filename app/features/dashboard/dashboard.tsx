import { useState } from "react"
import { Sidebar } from "@/components/sidebar/sidebar"
import { Header } from "@/components/header/header"
import { DashboardContent } from "@/features/sections/dashboard-content"
import { ClientesContent } from "@/features/sections/clientes-content"
import { AsesoresContent } from "@/features/sections/asesores-content"
import { BancosContent } from "@/features/sections/bancos-content"
import { FinancierasContent } from "@/features/sections/financieras-content"
import { ObjetivosContent } from "@/features/sections/objetivos-content"
import { CreditosContent } from "@/features/sections/creditos-content"
import { ComisionesContent } from "@/features/sections/comisiones-content"
import { ReportesContent } from "@/features/sections/reportes-content"
import { ConfiguracionContent } from "@/features/sections/configuracion-content"
import { GestionUsuariosContent } from "@/features/sections/gestion-usuarios"
import { Toaster } from "@/components/toaster/toaster"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // 🎯 PARA MENSAJE DE ACCESO DENEGADO


export default function Component() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const { canViewModule } = usePermissions(); // 🎯 USAR HOOK DE PERMISOS
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "info",
      title: "Bienvenido al sistema",
      description: "Sistema de gestión de créditos iniciado correctamente",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
      read: false,
    }
  ])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications([])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // 🎯 COMPONENTE PARA ACCESO DENEGADO
  const AccessDenied = () => (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center text-destructive">Acceso Denegado</CardTitle>
        <CardDescription className="text-center">
          No tienes permisos para acceder a esta sección
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          Contacta a tu administrador si necesitas acceso a este módulo.
        </p>
      </CardContent>
    </Card>
  )

  // 🎯 VERIFICAR PERMISOS ANTES DE RENDERIZAR CONTENIDO
  const renderContent = () => {
    switch (activeSection) {
      case "clientes":
        return canViewModule("clientes") ? 
          <ClientesContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      case "asesores":
        return canViewModule("asesores") ? 
          <AsesoresContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      case "bancos":
        return canViewModule("bancos") ? 
          <BancosContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      case "financieras":
        return canViewModule("financieras") ? 
          <FinancierasContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      case "objetivos":
        return canViewModule("objetivos") ? 
          <ObjetivosContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      case "reportes":
        return canViewModule("reportes") ? 
          <ReportesContent /> : 
          <AccessDenied />
      case "creditos":
        return canViewModule("creditos") ? 
          <CreditosContent onAddNotification={addNotification}/> : 
          <AccessDenied />
      case "comisiones":
        return canViewModule("comisiones") ? 
          <ComisionesContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      case "gestion-usuarios":
        return canViewModule("gestionUsuarios") ? 
          <GestionUsuariosContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      case "configuracion":
        return canViewModule("configuracion") ? 
          <ConfiguracionContent onAddNotification={addNotification} /> : 
          <AccessDenied />
      default:
        return <DashboardContent /> // Dashboard siempre accesible
    }
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar estático */}
      <div className="hidden border-r bg-muted/40 md:block">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col">
        <Header
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onRemoveNotification={removeNotification}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{renderContent()}</main>
      </div>

      <Toaster />
    </div>
  )
}
