const API_BASE_URL = 'http://localhost:3000/api'

export interface Financiera {
  id?: string
  nombre: string
  especializacion: string
  creditosActivos?: number
  montoTotal?: string
  tasaPromedio?: string
  estado: string
  estadoVariant?: 'default' | 'destructive' | 'secondary'
  contacto: string
  telefono: string
  email: string
}

export const FinancieraService = {
  getFinancieras: async (): Promise<Financiera[]> => {
    const response = await fetch(`${API_BASE_URL}/financieras`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener las financieras')
    return response.json()
  },

  getFinancieraById: async (id: string): Promise<Financiera> => {
    const response = await fetch(`${API_BASE_URL}/financieras/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener la financiera')
    return response.json()
  },

  createFinanciera: async (financiera: Omit<Financiera, 'id'>): Promise<Financiera> => {
    const response = await fetch(`${API_BASE_URL}/financieras`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(financiera),
    })
    if (!response.ok) throw new Error('Error al crear la financiera')
    return response.json()
  },

  updateFinanciera: async (id: string, financiera: Partial<Financiera>): Promise<Financiera> => {
    const response = await fetch(`${API_BASE_URL}/financieras/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(financiera),
    })
    if (!response.ok) throw new Error('Error al actualizar la financiera')
    return response.json()
  },

  deleteFinanciera: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/financieras/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al eliminar la financiera')
  },
}