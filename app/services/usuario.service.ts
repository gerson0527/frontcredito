// Servicio de usuarios - Conectado al backend
import type { Notification } from "@/components/notifications-panel/notifications-panel"

export interface PermisoModulo {
  ver: boolean
  crear: boolean
  editar: boolean
  eliminar: boolean
}

export interface PermisosUsuario {
  creditos: PermisoModulo
  clientes: PermisoModulo
  asesores: PermisoModulo
  bancos: PermisoModulo
  financieras: PermisoModulo
  objetivos: PermisoModulo
  reportes: PermisoModulo
  comisiones: PermisoModulo
  configuracion: PermisoModulo
  gestionUsuarios: PermisoModulo
}

export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  username?: string
  rol: 'administrador' | 'asesor'
  estado: 'activo' | 'inactivo' | 'suspendido'
  fechaCreacion: string
  ultimoAcceso: string
  telefono: string
  sucursal: string
  tema: 'claro' | 'oscuro' | 'sistema'
  avatar?: string
  permisos: PermisosUsuario
}

export interface CreateUsuarioRequest {
  nombres: string
  apellidos: string
  username: string
  correo: string
  password: string
  role: 'admin' | 'user'
  telefono: string
  sucursal: string
  theme: 'light' | 'dark' | 'system'
  estado: 'activo' | 'inactivo' | 'suspendido'
  permisos?: PermisosUsuario
}

export interface UpdateUsuarioRequest {
  nombres?: string
  apellidos?: string
  correo?: string
  role?: 'admin' | 'user'
  telefono?: string
  sucursal?: string
  theme?: 'light' | 'dark' | 'system'
  estado?: 'activo' | 'inactivo' | 'suspendido'
  permisos?: PermisosUsuario
  currentPassword?: string
  newPassword?: string
}

export interface UsuarioFilters {
  search?: string
  role?: string
  estado?: string
  sucursal?: string
}

export interface UsuarioResponse {
  success: boolean
  data: {
    users: Usuario[]
    pagination: {
      currentPage: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }
}

export interface UsuarioStatsResponse {
  success: boolean
  data: {
    total: number
    activos: number
    administradores: number
    asesores: number
    inactivos: number
  }
}

//const API_BASE_URL =  'http://localhost:3000/api'
//prueba localhost
//const API_BASE_URL = 'http://localhost:3000/api'
export class UsuarioService {
  // Obtener usuarios con filtros y paginación
  static async getUsuarios(
    filters: UsuarioFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<UsuarioResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && filters.role !== 'todos' && { role: filters.role }),
        ...(filters.estado && filters.estado !== 'todos' && { estado: filters.estado })
      })

      const response = await fetch(`${API_BASE_URL}/users?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      throw error
    }
  }

  // Obtener un usuario por ID
  static async getUsuario(id: number): Promise<{ success: boolean; data: Usuario }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al obtener usuario:', error)
      throw error
    }
  }

  // Crear usuario
  static async createUsuario(userData: CreateUsuarioRequest): Promise<{ success: boolean; data: Usuario; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al crear usuario:', error)
      throw error
    }
  }

  // Actualizar usuario
  static async updateUsuario(id: number, userData: UpdateUsuarioRequest): Promise<{ success: boolean; data: Usuario; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
        console.error('Error response:', { status: response.status, statusText: response.statusText, errorData })
        throw new Error(errorData.message || `Error HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      throw error
    }
  }

  // Eliminar usuario
  static async deleteUsuario(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      throw error
    }
  }

  // Obtener estadísticas
  static async getUsuarioStats(): Promise<UsuarioStatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  }

  // Funciones helper para conversión de datos
  static convertThemeToBackend(tema: 'claro' | 'oscuro' | 'sistema'): 'light' | 'dark' | 'system' {
    const mapping = {
      'claro': 'light' as const,
      'oscuro': 'dark' as const,
      'sistema': 'system' as const
    }
    return mapping[tema]
  }

  static convertRoleToBackend(rol: 'administrador' | 'asesor'): 'admin' | 'user' {
    return rol === 'administrador' ? 'admin' : 'user'
  }
}
