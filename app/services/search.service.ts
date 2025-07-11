const API_BASE_URL = 'http://localhost:3000/api'

export interface SearchResult {
  id: string
  type: 'cliente' | 'credito'
  title: string
  subtitle: string
  estado?: string
  monto?: number
}

export const SearchService = {
  search: async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []

    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error en la búsqueda')
      }

      const data = await response.json()
      return data.results
    } catch (error) {
      console.error('Error al realizar la búsqueda:', error)
      return []
    }
  },

  searchClients: async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []

    try {
      const response = await fetch(`${API_BASE_URL}/search/clients?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error en la búsqueda de clientes')
      }

      const data = await response.json()
      return data.results.map((client: any) => ({
        id: client.id,
        type: 'cliente',
        title: client.nombre,
        subtitle: `DNI/RUC: ${client.documento}`
      }))
    } catch (error) {
      console.error('Error al buscar clientes:', error)
      return []
    }
  },

  searchCredits: async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return []

    try {
      const response = await fetch(`${API_BASE_URL}/search/credits?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Error en la búsqueda de créditos')
      }

      const data = await response.json()
      return data.results.map((credit: any) => ({
        id: credit.id,
        type: 'credito',
        title: `Crédito #${credit.id}`,
        subtitle: `Monto: $${credit.monto.toLocaleString()}`,
        estado: credit.estado,
        monto: credit.monto
      }))
    } catch (error) {
      console.error('Error al buscar créditos:', error)
      return []
    }
  }
}