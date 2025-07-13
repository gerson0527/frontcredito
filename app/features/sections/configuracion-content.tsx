"use client"

import { useState, useEffect } from "react"
import { Save, User, Eye, EyeOff, Lock, Settings, Bell, Globe, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { AuthService } from "@/services/auth.service"
import { useAuth } from "../../contexts/AuthContext" // 🎯 CAMBIAR A useAuth
import { useTheme } from "@/contexts/ThemeContext" // 🎯 IMPORTAR useTheme
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS
import { PermissionGuard } from "@/components/permission-guard/permission-guard" // 🎯 IMPORTAR GUARD

interface ConfiguracionContentProps {
  onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
}

interface PerfilData {
  nombres: string
  apellidos: string
  correo: string
  telefono: string
  cargo: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ShowPasswords {
  current: boolean
  new: boolean
  confirm: boolean
}

interface SystemConfig {
  theme: string
  language: string
  timezone: string
  emailNotifications: boolean
  autoSave: boolean
}

export function ConfiguracionContent({ onAddNotification }: ConfiguracionContentProps) {
  const { toast } = useToast()
  const { user, updateUser } = useAuth() // 🎯 OBTENER updateUser TAMBIÉN
  const { theme, setTheme } = useTheme() // 🎯 USAR EL HOOK DE TEMA
  
  // 🎯 USAR HOOK DE PERMISOS
  const { canViewModule, canCreateModule, canEditModule, canDeleteFromModule } = usePermissions()

  // 🎯 VERIFICAR ACCESO AL MÓDULO
  if (!canViewModule('configuracion')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para ver el módulo de configuración.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Estados del perfil
  const [perfilData, setPerfilData] = useState<PerfilData>({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    cargo: "",
  })

  // Estados de contraseña
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  })

  // Estados de carga
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoadingSystem, setIsLoadingSystem] = useState(false)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true)

  // Estados del sistema - 🎯 INICIALIZAR CON EL TEMA ACTUAL
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    theme: "sistema", // Se actualizará desde el contexto
    language: "es",
    timezone: "america/bogota",
    emailNotifications: true,
    autoSave: true
  })

  // 🎯 FUNCIÓN PARA CARGAR DATOS DESDE EL SERVIDOR
  const cargarDatosPerfil = async () => {
    setIsLoadingInitialData(true)
    try {
      const response = await AuthService.obtenerPerfil()
      
      if (response.success && response.user) {
        const userData = response.user
        
        // Actualizar el formulario
        setPerfilData({
          nombres: userData.nombres || "",
          apellidos: userData.apellidos || "",
          correo: userData.correo || "",
          telefono: userData.telefono || "",
          cargo: userData.cargo || "",
        })

        // Actualizar configuración del sistema
        setSystemConfig(prev => ({
          ...prev,
          theme: userData.theme 
        }))

        // Actualizar el contexto de usuario si los datos son diferentes
        updateUser({
          ...userData,
          // Mantener compatibilidad
          nombre: userData.nombres,
          apellido: userData.apellidos,
          email: userData.correo,
        })

        console.log('Datos del perfil cargados:', userData)
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error cargando perfil:', error)
      toast({
        title: "Error",
        description: "Error al cargar los datos del perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoadingInitialData(false)
    }
  }

  // 🎯 EFECTO PARA CARGAR DATOS AL MONTAR EL COMPONENTE
  useEffect(() => {
    cargarDatosPerfil()
  }, [])

  // 🎯 EFECTO PARA SINCRONIZAR CON EL CONTEXTO CUANDO CAMBIE
  useEffect(() => {
    if (user && !isLoadingInitialData) {
      setPerfilData({
        nombres: user.nombres || user.nombre || "",
        apellidos: user.apellidos || user.apellido || "",
        correo: user.correo || user.email || "",
        telefono: user.telefono || "",
        cargo: user.cargo || "",
      })

      setSystemConfig(prev => ({
        ...prev,
        theme: user.theme || "sistema"
      }))
    }
  }, [user, isLoadingInitialData])

  // 🎯 MANEJADOR PARA GUARDAR PERFIL USANDO AuthService
  const handleSaveProfile = async () => {
    // Validaciones básicas
    if (!perfilData.nombres.trim() || !perfilData.apellidos.trim() || !perfilData.correo.trim()) {
      toast({
        title: "Error",
        description: "Los campos nombres, apellidos y correo son obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(perfilData.correo)) {
      toast({
        title: "Error",
        description: "Formato de email inválido",
        variant: "destructive",
      })
      return
    }

    setIsLoadingProfile(true)
    try {
      const response = await AuthService.actualizarPerfil({
        nombres: perfilData.nombres.trim(),
        apellidos: perfilData.apellidos.trim(),
        correo: perfilData.correo.trim().toLowerCase(),
        telefono: perfilData.telefono.trim(),
        cargo: perfilData.cargo
      })

      if (response.success) {
        // Actualizar el contexto con los nuevos datos
        updateUser({
          nombres: response.user.nombres,
          apellidos: response.user.apellidos,
          correo: response.user.correo,
          telefono: response.user.telefono,
          cargo: response.user.cargo,
          // Mantener compatibilidad
          nombre: response.user.nombres,
          apellido: response.user.apellidos,
          email: response.user.correo,
        })

        toast({
          title: "Perfil actualizado",
          description: "Tu información de perfil ha sido guardada correctamente.",
          variant: "success",
        })

        onAddNotification({
          type: "success",
          title: "Perfil actualizado",
          description: "Se actualizó la información del perfil de usuario",
          read: false,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "No se pudo actualizar el perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // 🎯 MANEJADOR PARA CAMBIAR CONTRASEÑA USANDO AuthService
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsLoadingPassword(true)
    try {
      const userId = user?.id?.toString() || "1"
      
      const response = await AuthService.cambiarPassword({
        userId,
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.success) {
        toast({
          title: "Éxito",
          description: "Contraseña actualizada correctamente",
          variant: "success",
        })
        
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })

        onAddNotification({
          type: "success",
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente",
          read: false,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Error al cambiar la contraseña",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cambiar la contraseña. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPassword(false)
    }
  }

  // Función para alternar visibilidad de contraseña
  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // 🎯 EFECTO PARA SINCRONIZAR EL TEMA DEL CONTEXTO CON EL FORMULARIO
  useEffect(() => {
    const themeMapping: { [key in 'light' | 'dark' ]: string } = {
      'light': 'light',
      'dark': 'dark',
    }

    setSystemConfig(prev => ({
      ...prev,
      theme: themeMapping[theme] || 'sistema'
    }))
  }, [theme])

  // 🎯 ACTUALIZAR MANEJADOR PARA GUARDAR CONFIGURACIÓN DEL SISTEMA
  const handleSaveSystemConfig = async () => {
    setIsLoadingSystem(true)
    try {
      // Mapear tema del formulario al formato del backend
      const themeMapping: { [key: string]: 'light' | 'dark' } = {
        'light': 'light',
        'dark': 'dark',
      }

      const mappedTheme = themeMapping[systemConfig.theme] 
      
      // Actualizar tema en el backend
      const response = await AuthService.actualizarTema(mappedTheme)
      
      if (response.success) {
        // 🎯 ACTUALIZAR EL CONTEXTO DE USUARIO Y TEMA
        updateUser({ theme: response.theme })
        setTheme(response.theme as 'light' | 'dark')
        
        toast({
          title: "Tema actualizado",
          description: `Se cambió el tema a: ${systemConfig.theme}`,
          variant: "success",
        })
      }

      // Simular guardado de otras configuraciones
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast({
        title: "Configuración guardada",
        description: "La configuración del sistema ha sido actualizada correctamente.",
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Configuración actualizada",
        description: "Se guardaron las preferencias del sistema",
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSystem(false)
    }
  }

  // 🎯 MOSTRAR LOADING MIENTRAS CARGAN LOS DATOS INICIALES
  if (isLoadingInitialData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Configuración</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando configuración...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuración</h2>
        {user && (
          <div className="text-sm text-muted-foreground">
            Configurando perfil de: <span className="font-medium">{user.nombres || user.nombre} {user.apellidos || user.apellido}</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="perfil" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil 
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Configuración de Perfil */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal y de contacto
                {/* 🎯 BOTÓN PARA RECARGAR DATOS */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={cargarDatosPerfil}
                  className="ml-2"
                  disabled={isLoadingInitialData}
                >
                  🔄 Recargar
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input
                    id="nombres"
                    value={perfilData.nombres}
                    onChange={(e) => setPerfilData({ ...perfilData, nombres: e.target.value })}
                    placeholder="Ingresa tus nombres"
                    disabled={isLoadingInitialData}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={perfilData.apellidos}
                    onChange={(e) => setPerfilData({ ...perfilData, apellidos: e.target.value })}
                    placeholder="Ingresa tus apellidos"
                    disabled={isLoadingInitialData}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Email</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={perfilData.correo}
                    onChange={(e) => setPerfilData({ ...perfilData, correo: e.target.value })}
                    placeholder="tu@email.com"
                    disabled={isLoadingInitialData}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={perfilData.telefono}
                    onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })}
                    placeholder="+57 300 123 4567"
                    disabled={isLoadingInitialData}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select
                    value={perfilData.cargo}
                    onValueChange={(value) => setPerfilData({ ...perfilData, cargo: value })}
                    disabled={isLoadingInitialData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                {canEditModule('configuracion') && (
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isLoadingProfile || isLoadingInitialData}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoadingProfile ? "Guardando..." : "Guardar Perfil"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Seguridad */}
        <TabsContent value="seguridad" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="current-password">Contraseña Actual</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="new-password">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  {canEditModule('configuracion') && (
                    <Button onClick={handleChangePassword} disabled={isLoadingPassword}>
                      <Lock className="mr-2 h-4 w-4" />
                      {isLoadingPassword ? "Cambiando..." : "Cambiar Contraseña"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración del Sistema */}
        <TabsContent value="sistema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>
                Configuraciones generales y preferencias del sistema
                {/* 🎯 MOSTRAR TEMA ACTUAL */}
                <span className="ml-2 text-xs bg-primary/10 px-2 py-1 rounded">
                  Tema actual: {systemConfig.theme}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Tema de la aplicación
                    </Label>
                    <Select 
                      value={systemConfig.theme}
                      onValueChange={(value) => setSystemConfig({ ...systemConfig, theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">☀️ Claro</SelectItem>
                        <SelectItem value="dark">🌙 Oscuro</SelectItem>
                      </SelectContent>
                    </Select>
                    {/* 🎯 PREVIEW DEL TEMA */}
                    <p className="text-xs text-muted-foreground">
                      El tema se aplicará inmediatamente después de guardar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma
                    </Label>
                    <Select 
                      value={systemConfig.language}
                      onValueChange={(value) => setSystemConfig({ ...systemConfig, language: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Zona horaria
                  </Label>
                  <Select 
                    value={systemConfig.timezone}
                    onValueChange={(value) => setSystemConfig({ ...systemConfig, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america/bogota">🇨🇴 América/Bogotá (UTC-5)</SelectItem>
                      <SelectItem value="america/mexico_city">🇲🇽 América/México (UTC-6)</SelectItem>
                      <SelectItem value="america/lima">🇵🇪 América/Lima (UTC-5)</SelectItem>
                      <SelectItem value="america/caracas">🇻🇪 América/Caracas (UTC-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notificaciones
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications" className="text-base">
                        Notificaciones por email
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Recibe notificaciones importantes por correo electrónico
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={systemConfig.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSystemConfig({ ...systemConfig, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-save" className="text-base">
                        Auto-guardado
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Guarda automáticamente los cambios mientras trabajas
                      </p>
                    </div>
                    <Switch
                      id="auto-save"
                      checked={systemConfig.autoSave}
                      onCheckedChange={(checked) => 
                        setSystemConfig({ ...systemConfig, autoSave: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />
                
                <div className="flex justify-end">
                  {canEditModule('configuracion') && (
                    <Button onClick={handleSaveSystemConfig} disabled={isLoadingSystem}>
                      <Save className="mr-2 h-4 w-4" />
                      {isLoadingSystem ? "Guardando..." : "Guardar Configuración"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default ConfiguracionContent
