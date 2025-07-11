const API_BASE_URL = 'http://localhost:3000/api'

interface Objetivo {
  id: string;
  titulo: string;
  tipo: string;
  meta: number;
  actual: number;
  unidad: string;
  responsable: string;
  fechaFin: string;
  estado: string;
  prioridad: string;
  progreso: number;
  estadoVariant: string;
  prioridadVariant: string;
  asesor?: {
    nombre: string;
  };
}

export const ObjetivoService = {
  getAllObjetivos: async (): Promise<Objetivo[]> => {
    const response = await fetch(`${API_BASE_URL}/objetivos`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los objetivos')
    return response.json()
  },

  getObjetivoById: async (id: string): Promise<Objetivo> => {
    const response = await fetch(`${API_BASE_URL}/objetivos/${id}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el objetivo')
    return response.json()
  },

  getObjetivosByAsesor: async (asesorId: string): Promise<Objetivo[]> => {
    const response = await fetch(`${API_BASE_URL}/objetivos/asesor/${asesorId}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener los objetivos del asesor')
    return response.json()
  },

  createObjetivo: async (objetivo: Omit<Objetivo, 'id'>): Promise<Objetivo> => {
    const response = await fetch(`${API_BASE_URL}/objetivos`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objetivo),
    })
    if (!response.ok) throw new Error('Error al crear el objetivo')
    return response.json()
  },

  updateObjetivo: async (id: string, objetivo: Partial<Objetivo>): Promise<Objetivo> => {
    const response = await fetch(`${API_BASE_URL}/objetivos/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objetivo),
    })
    if (!response.ok) throw new Error('Error al actualizar el objetivo')
    return response.json()
  },

  deleteObjetivo: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/objetivos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al eliminar el objetivo')
  },
}