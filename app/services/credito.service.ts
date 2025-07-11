const API_BASE_URL = 'http://localhost:3000/api'

export interface Credito {
  id?: string
  clienteId?: string
  asesorId?: string
  financieraId?: string
  bancoid?: string
  monto: string | number
  tasa: string
  plazo: number
  tipo: string
  garantia?: string
  estado: string
  fechaSolicitud?: string
  fechaAprobacion?: string
  fechaVencimiento?: string
  observaciones?: string
  // Relaciones
  cliente?: {
    id?: string
    nombre: string
    apellido: string
    dni: string
  }
  asesor?: {
    id?: string
    nombre: string
  }
  banco?: {
    id?: string
    nombre: string
  }
  financiera?: {
    id?: string
    nombre: string
  }
  // Para UI
  estadoVariant?: "default" | "destructive" | "secondary"
}

export const CreditoService = {
  getCreditos: async (): Promise<Credito[]> => {
    const response = await fetch(`${API_BASE_URL}/creditos`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los créditos')
    return response.json()
  },

  getCreditoById: async (id: string): Promise<Credito> => {
    const response = await fetch(`${API_BASE_URL}/creditos/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el crédito')
    return response.json()
  },

  getCreditosByCliente: async (clienteId: string): Promise<Credito[]> => {
    const response = await fetch(`${API_BASE_URL}/creditos/cliente/${clienteId}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los créditos del cliente')
    return response.json()
  },

  getCreditosByAsesor: async (asesorId: string): Promise<Credito[]> => {
    const response = await fetch(`${API_BASE_URL}/creditos/asesor/${asesorId}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los créditos del asesor')
    return response.json()
  },

  createCredito: async (credito: Omit<Credito, 'id'>): Promise<Credito> => {
    const response = await fetch(`${API_BASE_URL}/creditos`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credito),
    })
    if (!response.ok) throw new Error('Error al crear el crédito')
    return response.json()
  },

  updateCredito: async (id: string, credito: Partial<Credito>): Promise<Credito> => {
    const response = await fetch(`${API_BASE_URL}/creditos/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credito),
    })
    if (!response.ok) throw new Error('Error al actualizar el crédito')
    return response.json()
  },

  deleteCredito: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/creditos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al eliminar el crédito')
  },

  // Descargar template de Excel para créditos
  downloadTemplate: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/creditos/template`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al descargar el template')
    return response.blob()
  },

  // Subir archivo Excel con créditos
  uploadExcel: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('excel', file)

    const response = await fetch(`${API_BASE_URL}/creditos/upload-excel`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    if (!response.ok) throw new Error('Error al subir el archivo Excel')
    return response.json()
  },
}