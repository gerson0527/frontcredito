const API_BASE_URL = 'http://localhost:3000/api'

export interface Banco {
  id?: string
  nombre: string
  tipo: string
  personaContacto: string
  telefono: string
  email: string
  tasaBase: string
  direccion: string
  estado: boolean
  estadoVariant?: 'default' | 'destructive' | 'secondary'
}

export const BancoService = {
  getBancos: async (): Promise<Banco[]> => {
    const response = await fetch(`${API_BASE_URL}/bancos`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los bancos')
    return response.json()
  },

  getBancoById: async (id: string): Promise<Banco> => {
    const response = await fetch(`${API_BASE_URL}/bancos/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el banco')
    return response.json()
  },

  createBanco: async (banco: Omit<Banco, 'id'>): Promise<Banco> => {
    const response = await fetch(`${API_BASE_URL}/bancos`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(banco),
    })
    if (!response.ok) throw new Error('Error al crear el banco')
    return response.json()
  },

  updateBanco: async (id: string, banco: Partial<Banco>): Promise<Banco> => {
    const response = await fetch(`${API_BASE_URL}/bancos/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(banco),
    })
    if (!response.ok) throw new Error('Error al actualizar el banco')
    return response.json()
  },

  deleteBanco: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bancos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al eliminar el banco')
  },
}