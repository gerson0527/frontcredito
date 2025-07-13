"use client"

import { useState, useEffect } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye, UserPlus, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS CORRECTO
import { useAuth } from "@/contexts/AuthContext" // 🎯 IMPORTAR useAuth POR SEPARADO
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { 
  UsuarioService, 
  type Usuario, 
  type PermisoModulo, 
  type PermisosUsuario,
  type UsuarioFilters,
  type CreateUsuarioRequest,
  type UpdateUsuarioRequest
} from "@/services/usuario.service"

interface GestionUsuariosContentProps {
  onAddNotification: (notification: Notification) => void
}

// 🎯 FUNCIONES HELPER PARA PERMISOS
const createPermisoModulo = (ver: boolean, crear: boolean, editar: boolean, eliminar: boolean): PermisoModulo => ({
  ver,
  crear,
  editar,
  eliminar
})

const createPermisosAdministrador = (): PermisosUsuario => ({
  creditos: createPermisoModulo(true, true, true, true),
  clientes: createPermisoModulo(true, true, true, true),
  asesores: createPermisoModulo(true, true, true, true),
  bancos: createPermisoModulo(true, true, true, true),
  financieras: createPermisoModulo(true, true, true, true),
  objetivos: createPermisoModulo(true, true, true, true),
  reportes: createPermisoModulo(true, true, true, true),
  comisiones: createPermisoModulo(true, true, true, true),
  configuracion: createPermisoModulo(true, true, true, true),
  gestionUsuarios: createPermisoModulo(true, true, true, true)
})

const createPermisosAsesor = (): PermisosUsuario => ({
  creditos: createPermisoModulo(true, true, true, false),
  clientes: createPermisoModulo(true, true, true, false),
  asesores: createPermisoModulo(true, false, false, false),
  bancos: createPermisoModulo(true, false, false, false),
  financieras: createPermisoModulo(true, false, false, false),
  objetivos: createPermisoModulo(true, false, false, false),
  reportes: createPermisoModulo(true, false, false, false),
  comisiones: createPermisoModulo(true, false, false, false),
  configuracion: createPermisoModulo(false, false, false, false),
  gestionUsuarios: createPermisoModulo(false, false, false, false)
})

export function GestionUsuariosContent({ onAddNotification }: GestionUsuariosContentProps) {
  const { toast } = useToast()
  const { canView, canCreate, canEdit, canDelete } = usePermissions() // 🎯 USAR HOOK DE PERMISOS CORRECTO
  const { user } = useAuth() // 🎯 OBTENER DATOS DEL USUARIO PARA DEBUG
  
  // 🔍 DEBUG: Verificar datos del usuario
  console.log('🔍 Usuario actual:', user)
  console.log('🔍 Permisos del usuario:', user?.permisos)
  console.log('🔍 Rol del usuario:', user?.rol)
  console.log('🔍 Puede ver gestión usuarios:', canView('gestionUsuarios'))
  
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState<string>("todos")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'delete'>('add')
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [formPermisos, setFormPermisos] = useState<PermisosUsuario>(createPermisosAsesor())
  
  // Estados para contraseñas
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [selectedTema, setSelectedTema] = useState<'claro' | 'oscuro' | 'sistema'>('sistema')
  
  // Estados para campos del formulario
  const [selectedRol, setSelectedRol] = useState<'administrador' | 'asesor'>('asesor')
  const [selectedEstado, setSelectedEstado] = useState<'activo' | 'inactivo' | 'suspendido'>('activo')
  const [selectedSucursal, setSelectedSucursal] = useState<string>('Principal')
  
  // Estados de carga y error
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    administradores: 0,
    asesores: 0
  })
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // 🎯 FUNCIONES DE API
  const loadUsuarios = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const filters: UsuarioFilters = {
        search: searchTerm || undefined,
        role: filterRol !== "todos" ? filterRol : undefined,
        estado: filterEstado !== "todos" ? filterEstado : undefined
      }
      
      const response = await UsuarioService.getUsuarios(filters, currentPage, pageSize)
      
      if (response.success) {
        setUsuarios(response.data.users)
        setFilteredUsuarios(response.data.users)
        setTotalItems(response.data.pagination.totalItems)
        setTotalPages(response.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
      setError('Error al cargar la lista de usuarios')
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await UsuarioService.getUsuarioStats()
      
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    loadUsuarios()
    loadStats()
  }, [])

  // Recargar cuando cambien filtros o paginación
  useEffect(() => {
    loadUsuarios()
  }, [searchTerm, filterRol, filterEstado, currentPage, pageSize])

  // Los datos ya vienen paginados del backend
  const getCurrentPageData = () => {
    return filteredUsuarios
  }

  // 🎯 FUNCIONES DE MODAL
  const openModal = (type: typeof modalType, usuario?: Usuario) => {
    setModalType(type)
    setSelectedUsuario(usuario || null)
    // Inicializar permisos del formulario
    if (usuario) {
      setFormPermisos(usuario.permisos)
      setSelectedTema(usuario.tema)
      setSelectedRol(usuario.rol)
      setSelectedEstado(usuario.estado)
      setSelectedSucursal(usuario.sucursal)
    } else {
      setFormPermisos(createPermisosAsesor())
      setSelectedTema('sistema')
      setSelectedRol('asesor')
      setSelectedEstado('activo')
      setSelectedSucursal('Principal')
    }
    // Limpiar campos de contraseña
    setCurrentPassword("")
    setNewPassword("")
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUsuario(null)
  }

  const handleSave = async () => {
    // Validación de contraseñas para edición
    if (modalType === 'edit' && newPassword && !currentPassword) {
      toast({
        title: "Error de validación",
        description: "Debes ingresar la contraseña actual para cambiarla",
        variant: "destructive",
      })
      return
    }

    if (newPassword && newPassword.length < 8) {
      toast({
        title: "Error de validación", 
        description: "La nueva contraseña debe tener al menos 8 caracteres",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      if (modalType === 'add') {
        // Crear nuevo usuario
        const userData: CreateUsuarioRequest = {
          nombres: (document.getElementById('nombre') as HTMLInputElement).value,
          apellidos: (document.getElementById('apellido') as HTMLInputElement).value,
          username: (document.getElementById('email') as HTMLInputElement).value.split('@')[0],
          correo: (document.getElementById('email') as HTMLInputElement).value,
          password: (document.getElementById('password') as HTMLInputElement).value,
          role: UsuarioService.convertRoleToBackend(selectedRol),
          telefono: (document.getElementById('telefono') as HTMLInputElement).value,
          sucursal: selectedSucursal,
          theme: UsuarioService.convertThemeToBackend(selectedTema),
          estado: selectedEstado,
          permisos: formPermisos
        }

        const response = await UsuarioService.createUsuario(userData)
        
        if (response.success) {
          toast({
            title: "Usuario creado",
            description: response.message,
            variant: "default",
          })

          onAddNotification({
            id: Date.now().toString(),
            type: "success",
            title: "Usuario creado",
            description: `Se creó el usuario ${userData.nombres} ${userData.apellidos}`,
            read: false,
            timestamp: new Date(),
          })

          await loadUsuarios()
          await loadStats()
        }
      } else if (modalType === 'edit' && selectedUsuario) {
        // Actualizar usuario existente
        const updateData: UpdateUsuarioRequest = {
          nombres: (document.getElementById('nombre') as HTMLInputElement).value,
          apellidos: (document.getElementById('apellido') as HTMLInputElement).value,
          correo: (document.getElementById('email') as HTMLInputElement).value,
          role: UsuarioService.convertRoleToBackend(selectedRol),
          telefono: (document.getElementById('telefono') as HTMLInputElement).value,
          sucursal: selectedSucursal,
          theme: UsuarioService.convertThemeToBackend(selectedTema),
          estado: selectedEstado,
          permisos: formPermisos
        }

        // Agregar contraseñas si se proporcionaron
        if (currentPassword && newPassword) {
          updateData.currentPassword = currentPassword
          updateData.newPassword = newPassword
        }

        const response = await UsuarioService.updateUsuario(selectedUsuario.id, updateData)
        
        if (response.success) {
          const message = currentPassword && newPassword 
            ? "El usuario y su contraseña han sido actualizados exitosamente"
            : "El usuario ha sido actualizado exitosamente"

          toast({
            title: "Usuario actualizado",
            description: message,
            variant: "default",
          })

          onAddNotification({
            id: Date.now().toString(),
            type: "success",
            title: "Usuario actualizado",
            description: `Se actualizó el usuario ${updateData.nombres} ${updateData.apellidos}`,
            read: false,
            timestamp: new Date(),
          })

          await loadUsuarios()
          await loadStats()
        }
      }

      closeModal()
    } catch (error: any) {
      console.error('Error al guardar usuario:', error)
      toast({
        title: "Error",
        description: error.message || "Error al guardar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUsuario) return

    try {
      setIsLoading(true)
      
      const response = await UsuarioService.deleteUsuario(selectedUsuario.id)
      
      if (response.success) {
        toast({
          title: "Usuario eliminado",
          description: response.message,
          variant: "default",
        })

        onAddNotification({
          id: Date.now().toString(),
          type: "info",
          title: "Usuario eliminado",
          description: `Se eliminó el usuario ${selectedUsuario.nombre} ${selectedUsuario.apellido}`,
          read: false,
          timestamp: new Date(),
        })

        await loadUsuarios()
        await loadStats()
      }
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error)
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el usuario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }

    closeModal()
  }

  // 🎯 FUNCIONES DE UTILIDAD
  const getRolBadge = (rol: string) => {
    const variants = {
      administrador: "default",
      asesor: "outline"
    }
    const icons = {
      administrador: "👑",
      asesor: "👤"
    }
    return (
      <Badge variant={variants[rol as keyof typeof variants] as any}>
        {icons[rol as keyof typeof icons]} {rol.charAt(0).toUpperCase() + rol.slice(1)}
      </Badge>
    )
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activo: "default",
      inactivo: "secondary",
      suspendido: "destructive"
    }
    const colors = {
      activo: "🟢",
      inactivo: "⚫",
      suspendido: "🔴"
    }
    return (
      <Badge variant={variants[estado as keyof typeof variants] as any}>
        {colors[estado as keyof typeof colors]} {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES')
  }

  const getTemaBadge = (tema: string) => {
    const temas = {
      claro: { icon: '🌞', label: 'Claro' },
      oscuro: { icon: '🌙', label: 'Oscuro' },
      sistema: { icon: '⚙️', label: 'Seguir sistema' }
    }
    const temaData = temas[tema as keyof typeof temas] || temas.sistema
    return (
      <Badge variant="outline">
        {temaData.icon} {temaData.label}
      </Badge>
    )
  }

  // 🎯 VERIFICAR PERMISOS DE ACCESO AL MÓDULO
  if (!canView('gestionUsuarios')) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a la gestión de usuarios
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button 
          onClick={() => openModal('add')} 
          className="gap-2" 
          disabled={isLoading || !canCreate('gestionUsuarios')} // 🎯 VALIDAR PERMISOS
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? "..." : stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios en el sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStats ? "..." : stats.activos}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.activos / stats.total) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingStats ? "..." : stats.administradores}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios con acceso completo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asesores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoadingStats ? "..." : stats.asesores}
            </div>
            <p className="text-xs text-muted-foreground">
              Personal de ventas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Buscar usuario</Label>
              <Input
                placeholder="Nombre, apellido o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Filtrar por rol</Label>
              <Select value={filterRol} onValueChange={setFilterRol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="asesor">Asesor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filtrar por estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="suspendido">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Cargando..." : `Mostrando ${filteredUsuarios.length} de ${totalItems} usuarios`}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setFilterRol("todos")
                setFilterEstado("todos")
                setCurrentPage(1)
              }}
              disabled={isLoading}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Gestiona los usuarios del sistema y sus permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-4 text-red-600">
              <p>{error}</p>
              <Button 
                variant="outline" 
                onClick={loadUsuarios} 
                className="mt-2"
                disabled={isLoading}
              >
                Reintentar
              </Button>
            </div>
          )}
          
          {!error && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Cargando usuarios...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No se encontraron usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    getCurrentPageData().map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{usuario.nombre} {usuario.apellido}</div>
                              <div className="text-sm text-muted-foreground">ID: {usuario.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{usuario.email}</div>
                            <div className="text-sm text-muted-foreground">{usuario.telefono}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                        <TableCell>{getEstadoBadge(usuario.estado)}</TableCell>
                        <TableCell>{usuario.sucursal}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDateTime(usuario.ultimoAcceso)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isLoading}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* 🎯 VER DETALLES - Siempre disponible si puede ver el módulo */}
                              {canView('gestionUsuarios') && (
                                <DropdownMenuItem onClick={() => openModal('view', usuario)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </DropdownMenuItem>
                              )}
                              
                              {/* 🎯 EDITAR - Solo si tiene permisos de editar */}
                              {canEdit('gestionUsuarios') && (
                                <DropdownMenuItem onClick={() => openModal('edit', usuario)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              
                              {/* 🎯 ELIMINAR - Solo si tiene permisos de eliminar */}
                              {canDelete('gestionUsuarios') && (
                                <DropdownMenuItem 
                                  onClick={() => openModal('delete', usuario)}
                                  className="text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'add' && "Nuevo Usuario"}
              {modalType === 'edit' && "Editar Usuario"}
              {modalType === 'view' && "Detalles del Usuario"}
              {modalType === 'delete' && "Eliminar Usuario"}
            </DialogTitle>
            <DialogDescription>
              {modalType === 'add' && "Crear un nuevo usuario en el sistema"}
              {modalType === 'edit' && "Modificar la información del usuario"}
              {modalType === 'view' && "Información detallada del usuario"}
              {modalType === 'delete' && "¿Estás seguro de que deseas eliminar este usuario?"}
            </DialogDescription>
          </DialogHeader>

          {/* Contenido del modal según el tipo */}
          {(modalType === 'add' || modalType === 'edit') && ( 
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    defaultValue={selectedUsuario?.nombre || ""}
                    placeholder="Ingresa el nombre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    defaultValue={selectedUsuario?.apellido || ""}
                    placeholder="Ingresa el apellido"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={selectedUsuario?.email || ""}
                  placeholder="usuario@creditpro.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    defaultValue={selectedUsuario?.telefono || ""}
                    placeholder="3001234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sucursal">Sucursal</Label>
                  <Select value={selectedSucursal} onValueChange={setSelectedSucursal}>
                    <SelectTrigger id="sucursal">
                      <SelectValue placeholder="Seleccionar sucursal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principal">Principal</SelectItem>
                      <SelectItem value="Norte">Norte</SelectItem>
                      <SelectItem value="Sur">Sur</SelectItem>
                      <SelectItem value="Centro">Centro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select value={selectedRol} onValueChange={(value) => setSelectedRol(value as 'administrador' | 'asesor')}>
                    <SelectTrigger id="rol">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="asesor">Asesor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={selectedEstado} onValueChange={(value) => setSelectedEstado(value as 'activo' | 'inactivo' | 'suspendido')}>
                    <SelectTrigger id="estado">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 🎯 CAMPOS DE TEMA Y CONTRASEÑA */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema Preferido</Label>
                  <Select value={selectedTema} onValueChange={(value) => setSelectedTema(value as 'claro' | 'oscuro' | 'sistema')}>
                    <SelectTrigger id="tema">
                      <SelectValue placeholder="Seleccionar tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claro">🌞 Claro</SelectItem>
                      <SelectItem value="oscuro">🌙 Oscuro</SelectItem>
                      <SelectItem value="sistema">⚙️ Seguir sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Esta configuración solo afecta la preferencia del usuario, no cambia el tema de toda la aplicación
                  </p>
                </div>
              </div>

              {modalType === 'edit' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa la contraseña actual"
                    />
                    <p className="text-xs text-muted-foreground">
                      Solo completa si deseas cambiar la contraseña
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Contraseña Nueva</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ingresa la nueva contraseña"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres
                    </p>
                  </div>
                </div>
              )}

              {modalType === 'add' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa la contraseña inicial"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres. El usuario podrá cambiarla después.
                  </p>
                </div>
              )}
              
              {/* 🎯 GESTIÓN DE PERMISOS */}
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <Label className="text-base font-medium">Permisos por Módulo</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configura los permisos específicos para cada módulo del sistema
                  </p>
                  
                  <div className="space-y-3">
                    {Object.entries(formPermisos).map(([modulo, permisos]) => (
                      <div key={modulo} className="grid grid-cols-5 gap-2 items-center p-3 border rounded-lg">
                        <div className="font-medium text-sm capitalize">
                          {modulo.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${modulo}-ver`}
                            checked={permisos.ver}
                            onChange={(e) => {
                              setFormPermisos(prev => ({
                                ...prev,
                                [modulo]: {
                                  ...prev[modulo as keyof PermisosUsuario],
                                  ver: e.target.checked
                                }
                              }))
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`${modulo}-ver`} className="text-xs">Ver</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${modulo}-editar`}
                            checked={permisos.editar}
                            onChange={(e) => {
                              setFormPermisos(prev => ({
                                ...prev,
                                [modulo]: {
                                  ...prev[modulo as keyof PermisosUsuario],
                                  editar: e.target.checked
                                }
                              }))
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`${modulo}-editar`} className="text-xs">Editar</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${modulo}-eliminar`}
                            checked={permisos.eliminar}
                            onChange={(e) => {
                              setFormPermisos(prev => ({
                                ...prev,
                                [modulo]: {
                                  ...prev[modulo as keyof PermisosUsuario],
                                  eliminar: e.target.checked
                                }
                              }))
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`${modulo}-eliminar`} className="text-xs">Eliminar</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${modulo}-crear`}
                            checked={permisos.crear}
                            onChange={(e) => {
                              setFormPermisos(prev => ({
                                ...prev,
                                [modulo]: {
                                  ...prev[modulo as keyof PermisosUsuario],
                                  crear: e.target.checked
                                }
                              }))
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`${modulo}-crear`} className="text-xs">Crear</label>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Aplicar permisos de administrador
                        setFormPermisos(createPermisosAdministrador())
                      }}
                    >
                      Permisos de Administrador
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Aplicar permisos de asesor
                        setFormPermisos(createPermisosAsesor())
                      }}
                    >
                      Permisos de Asesor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalType === 'view' && selectedUsuario && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nombre completo</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUsuario.nombre} {selectedUsuario.apellido}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedUsuario.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Rol</Label>
                  <div className="mt-1">{getRolBadge(selectedUsuario.rol)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">{getEstadoBadge(selectedUsuario.estado)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Teléfono</Label>
                  <p className="text-sm text-muted-foreground">{selectedUsuario.telefono}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sucursal</Label>
                  <p className="text-sm text-muted-foreground">{selectedUsuario.sucursal}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de creación</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedUsuario.fechaCreacion)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Último acceso</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(selectedUsuario.ultimoAcceso)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tema Preferido</Label>
                  <div className="mt-1">{getTemaBadge(selectedUsuario.tema)}</div>
                </div>
              </div>
              
              {/* 🎯 MOSTRAR PERMISOS EN VISTA */}
              <div className="border-t pt-4">
                <Label className="text-base font-medium">Permisos Asignados</Label>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {Object.entries(selectedUsuario.permisos).map(([modulo, permisos]) => (
                    <div key={modulo} className="border rounded-lg p-3">
                      <div className="font-medium text-sm capitalize mb-2">
                        {modulo.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {permisos.ver && <Badge variant="outline" className="text-xs">Ver</Badge>}
                        {permisos.crear && <Badge variant="secondary" className="text-xs">Crear</Badge>}
                        {permisos.editar && <Badge variant="outline" className="text-xs">Editar</Badge>}
                        {permisos.eliminar && <Badge variant="destructive" className="text-xs">Eliminar</Badge>}
                        {!permisos.ver && !permisos.crear && !permisos.editar && !permisos.eliminar && (
                          <Badge variant="secondary" className="text-xs">Sin permisos</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {modalType === 'delete' && selectedUsuario && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Se eliminará permanentemente el usuario <strong>{selectedUsuario.nombre} {selectedUsuario.apellido}</strong> 
                y toda la información asociada. Esta acción no se puede deshacer.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={isLoading}>
              Cancelar
            </Button>
            {(modalType === 'add' || modalType === 'edit') && (
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : modalType === 'add' ? 'Crear Usuario' : 'Guardar Cambios'}
              </Button>
            )}
            {modalType === 'delete' && (
              <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                {isLoading ? "Eliminando..." : "Eliminar Usuario"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
