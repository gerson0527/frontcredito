const API_BASE_URL = 'http://localhost:3000/api'

export interface Asesor {
  id?: number
  nombre: string
  cargo: string
  email: string
  telefono?: string
  sucursal?: string
  creditos?: number
  tasaAprobacion?: number
  rendimiento?: 'Alto' | 'Medio' | 'Bajo' | 'Nuevo'
  experienciaPrev?: string
  fechaIngreso?: string
  createdAt?: string
  updatedAt?: string
}

export const AsesorService = {
  // Obtener todos los asesores
  getAsesores: async (): Promise<Asesor[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/asesores`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error al obtener los asesores:', error)
      throw new Error('Error al obtener los asesores')
    }
  },

  // Obtener un asesor por ID
  getAsesorById: async (id: string | number): Promise<Asesor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/asesores/${id}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error al obtener el asesor:', error)
      throw new Error('Error al obtener el asesor')
    }
  },

  // Crear un nuevo asesor
  createAsesor: async (asesor: Omit<Asesor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Asesor> => {
    try {
      console.log('Creando asesor:', asesor)
      const response = await fetch(`${API_BASE_URL}/asesores`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asesor),
      })
      console.log('Respuesta del servidor:', response)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error al crear el asesor:', error)
      throw new Error('Error al crear el asesor')
    }
  },

  // Actualizar un asesor
  updateAsesor: async (id: string | number, asesor: Partial<Asesor>): Promise<Asesor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/asesores/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(asesor),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`)
      }
      return response.json()
    } catch (error) {
      console.error('Error al actualizar el asesor:', error)
      throw new Error('Error al actualizar el asesor')
    }
  },

  // Eliminar un asesor
  deleteAsesor: async (id: string | number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/asesores/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error('Error al eliminar el asesor:', error)
      throw new Error('Error al eliminar el asesor')
    }
  },
}