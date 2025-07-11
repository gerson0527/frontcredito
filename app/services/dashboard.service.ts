const API_BASE_URL = 'http://localhost:3000/api'

export interface DashboardKPI {
  creditos_en_proceso?: number
  variacion_semanal?: string
  monto_en_solicitudes?: string
  variacion_mensual?: string
  tasa_aprobacion?: number
  tiempo_promedio_dias?: number
}

export interface UltimaSolicitud {
  id: number
  type: 'success' | 'warning' | 'info'
  title: string
  description: string
  time: string
  entidad: string
  estado: string
  monto: number
  cliente: {
    nombre: string
    cedula: string
  }
  fechas: {
    solicitud: string
    aprobacion?: string
    rechazo?: string
  }
}

export interface DistribucionItem {
  tipo?: string
  estado?: string
  cantidad: number
  porcentaje: number
}

export const DashboardService = {
  // Obtener créditos en proceso
  getCreditosProceso: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/creditos-proceso`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener créditos en proceso')
    return response.json()
  },

  // Obtener monto total de solicitudes
  getMontoSolicitudes: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/monto-solicitudes`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener monto de solicitudes')
    return response.json()
  },

  // Obtener tasa de aprobación
  getTasaAprobacion: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/tasa-aprobacion`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener tasa de aprobación')
    return response.json()
  },

  // Obtener tiempo promedio
  getTiempoPromedio: async (): Promise<DashboardKPI> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/tiempo-promedio`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener tiempo promedio')
    return response.json()
  },

  // Obtener últimas solicitudes
  getUltimasSolicitudes: async (limit: number = 10): Promise<UltimaSolicitud[]> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/ultimas-solicitudes?limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener últimas solicitudes')
    return response.json()
  },

  // Obtener distribución por tipos
  getDistribucionTipos: async (): Promise<DistribucionItem[]> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/distribucion-tipos`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener distribución por tipos')
    return response.json()
  },

  // Obtener distribución por estados
  getDistribucionEstados: async (): Promise<DistribucionItem[]> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/distribucion-estados`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener distribución por estados')
    return response.json()
  },
}
