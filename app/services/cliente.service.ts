const API_BASE_URL = 'http://localhost:3000/api'

export interface Cliente {
  id?: string
  nombre: string
  apellido: string
  email: string
  dni: string
  telefono: string
  direccion: string
  fechanacimiento: string
  ingresosMensuales: number
  estado: string
}

export const ClienteService = {
  // Obtener todos los clientes
  getClientes: async (): Promise<Cliente[]> => {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los clientes')
    return response.json()
  },

  // Obtener un cliente por ID
  getClienteById: async (id: string): Promise<Cliente> => {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el cliente')
    return response.json()
  },

  // Crear un nuevo cliente
  createCliente: async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
    console.log(cliente);
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cliente),
    })
    if (!response.ok) throw new Error('Error al crear el cliente')
    return response.json()
  },

  // Actualizar un cliente
  updateCliente: async (id: string, cliente: Partial<Cliente>): Promise<Cliente> => {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cliente),
    })
    if (!response.ok) throw new Error('Error al actualizar el cliente')
    return response.json()
  },

  // Eliminar un cliente
  deleteCliente: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al eliminar el cliente')
  },
  // Buscar clientes por DNI
  searchClientes: async (dni: string): Promise<Cliente[]> => {
    const response = await fetch(`${API_BASE_URL}/clientes/search?term=${dni}`, {
      method: 'GET',
      credentials: 'include',
    })
    console.log(response)
    if (!response.ok) throw new Error('Error al buscar clientes')
    return response.json()
  },

  // Descargar template de Excel
  downloadTemplate: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/clientes/template`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al descargar el template')
    return response.blob()
  },

  // Subir archivo Excel con clientes
  uploadExcel: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('excel', file)

    const response = await fetch(`${API_BASE_URL}/clientes/upload-excel`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    if (!response.ok) throw new Error('Error al subir el archivo Excel')
    return response.json()
  },
  
}