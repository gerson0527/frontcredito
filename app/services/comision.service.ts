const API_BASE_URL = 'http://localhost:3000/api'

export interface Comision {
  id: number
  asesorId: number
  bancoid?: number
  financieraId?: number
  tipoEntidad: 'Banco' | 'Financiera'
  periodo: string // "2024-07"
  creditosAprobados: number
  montoTotalGestionado: number
  comisionBase: number
  bonificaciones: number
  deducciones: number
  comisionTotal: number
  estado: 'Pendiente' | 'Pagado' | 'Rechazado'
  fechaCalculo: string
  fechaPago?: string
  metodoPago?: 'Transferencia' | 'Efectivo' | 'Cheque'
  numeroTransferencia?: string
  observaciones?: string
  asesor?: {
    id: number
    nombre: string
    email: string
    cargo: string
    sucursal?: string
  }
  banco?: {
    id: number
    nombre: string
    comisionban: number
  }
  financiera?: {
    id: number
    nombre: string
    comisionfin: number
  }
}

export interface ResumenComision {
  periodo: string
  comisionTotal: number
  totalAsesores: number
  totalMonto: number
  pendientes: number
  pagados: number
  rechazados: number
  comisionesBancos: number
  comisionesFinancieras: number
}

export interface CalcularComisionRequest {
  periodo: string // "2024-07"
  asesorId?: number
}

export interface UpdateComisionRequest {
  estado: 'Pagado' | 'Rechazado'
  fechaPago?: string
  metodoPago?: 'Transferencia' | 'Efectivo' | 'Cheque'
  numeroTransferencia?: string
  bonificaciones?: number
  deducciones?: number
  observaciones?: string
}

export const ComisionService = {
  // Obtener todas las comisiones con filtros opcionales
  getComisiones: async (periodo?: string, estado?: string): Promise<Comision[]> => {
    const params = new URLSearchParams()
    if (periodo) params.append('periodo', periodo)
    if (estado) params.append('estado', estado)
    
    const queryString = params.toString()
    const url = queryString ? `${API_BASE_URL}/comisiones?${queryString}` : `${API_BASE_URL}/comisiones`
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener comisiones')
    }

    return response.json()
  },

  // Calcular comisiones para un periodo
  calcularComisiones: async (data: CalcularComisionRequest): Promise<{
    success: boolean
    message: string
    periodo: string
    asesorId?: number
    asesoresConComision: number
    totalComisiones: number
    sistemaCalculo: {
      descripcion: string
      formula: string
    }
    pagoAutomatico: {
      estado: string
      fechaPago: string
      metodoPago: string
      observaciones: string
    }
    detalle: any[]
    comisiones: Comision[]
    archivo: {
      generado: boolean
      nombre: string
      ruta: string
      tamaño: number
      contenido: string
    }
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/comisiones/calcular`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      // MANEJO ESPECÍFICO DE CÓDIGOS DE ERROR
      if (!response.ok) {
        // Intentar obtener el JSON de error del servidor
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = {
            message: `Error ${response.status}: ${response.statusText}`,
            success: false
          }
        }
        
        // Crear error con información detallada
        const error = new Error(errorData.message || 'Error al calcular comisiones')
        
        // Agregar información del response para el frontend
        ;(error as any).response = { 
          status: response.status, 
          data: errorData,
          statusText: response.statusText
        }        
        throw error
      }

      // Si llegamos aquí, la respuesta fue exitosa (200-299)
      const resultado = await response.json()
      
      return resultado
      
    } catch (error) {
      
      // Si el error NO tiene response (error de red/parsing)
      if (!(error as any).response) {
        const networkError = new Error('Error de conexión con el servidor')
        ;(networkError as any).response = { 
          status: 500, 
          data: { 
            message: 'Error de conexión con el servidor. Verifica que el backend esté ejecutándose en el puerto 5000.',
            details: `No se pudo conectar a ${API_BASE_URL}/comisiones/calcular`
          } 
        }
        throw networkError
      }
      
      // Re-lanzar el error con toda la información
      throw error
    }
  },

  // Actualizar/pagar una comisión
  updateComision: async (id: number, data: UpdateComisionRequest): Promise<Comision> => {
    const response = await fetch(`${API_BASE_URL}/comisiones/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    console.log('Actualizando comisión:', response)
    if (!response.ok) {
      throw new Error('Error al actualizar comisión')
    }

    return response.json()
  },

  // Obtener resumen histórico
  getResumen: async (): Promise<ResumenComision[]> => {
    const response = await fetch(`${API_BASE_URL}/comisiones/resumen`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener resumen de comisiones')
    }

    return response.json()
  },

  // Obtener comisiones por asesor
  getComisionesByAsesor: async (asesorId: number, periodo?: string, estado?: string): Promise<Comision[]> => {
    const params = new URLSearchParams()
    if (periodo) params.append('periodo', periodo)
    if (estado) params.append('estado', estado)
    
    const queryString = params.toString()
    const url = queryString ? `${API_BASE_URL}/comisiones/asesor/${asesorId}?${queryString}` : `${API_BASE_URL}/comisiones/asesor/${asesorId}`
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener comisiones por asesor')
    }

    return response.json()
  },

  // Obtener comisiones por periodo
  getComisionesByPeriodo: async (periodo: string, estado?: string): Promise<Comision[]> => {
    const params = new URLSearchParams()
    if (estado) params.append('estado', estado)
    
    const queryString = params.toString()
    const url = queryString ? `${API_BASE_URL}/comisiones/periodo/${periodo}?${queryString}` : `${API_BASE_URL}/comisiones/periodo/${periodo}`
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al obtener comisiones por periodo')
    }

    return response.json()
  },

  // Eliminar comisión (solo pendientes)
  deleteComision: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/comisiones/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Error al eliminar comisión')
    }
  }
}