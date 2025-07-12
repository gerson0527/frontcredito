const API_BASE_URL = 'https://backcreditos2025-backcreditos.up.railway.app/api'//prueba localhost
//const API_BASE_URL = 'http://localhost:3000/api'
export interface ReportePeriodo {
  creditosAprobados: number
  creditosRechazados: number
  creditosPendientes: number
  montoTotal: number
  tasaAprobacion: number
  comisionesTotal: number
}

export interface ReporteCredito {
  creditosAprobados: number
  creditosRechazados: number
  creditosPendientes: number
  mesnum: number
  mes: string
}

export interface ReporteAsesor {
  id: number
  nombre: string
  creditos: number
  montoGestionado: number
  comisiones: number
  rendimiento: number
  // 🎯 AGREGAR CAMPOS FALTANTES
  Posicion: number
  Asesor: string
  Creditos: number
  'Monto Gestionado': string
  Comisiones: string
  Rendimiento: string
}

export interface ResumenBanco {
  banco: string
  total_creditos: number
  total_monto: number
}

export interface ResumenFinanciera {
  banco: string
  total_creditos: number
  total_monto: number
}

export interface ResumenEstado {
  estado: string
  cantidad: number
  porcentaje: number
}

export const ReportesService = {
  getReportePeriodo: async (fechaInicio: string, fechaFin: string): Promise<ReportePeriodo> => {
    const response = await fetch(`${API_BASE_URL}/reportes/periodo?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el reporte del período')
    return response.json()
  },

  getTopAsesores: async (): Promise<ReporteAsesor[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/asesores/rankingasesores`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el ranking de asesores')
    return response.json()
  },

  getCreditosPormes: async (ano: number): Promise<ReporteCredito> => {
    const response = await fetch(`${API_BASE_URL}/reportes/creditos/meses?year=${ano}`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener todos los meses de los creditos')
    return response.json()
  },

  getResumenPorBanco: async (): Promise<ResumenBanco[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/resumen/bancos`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el resumen por banco')
    return response.json()
  },

  getResumenPorFinanciera: async (): Promise<ResumenFinanciera[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/resumen/financieras`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el resumen por financiera')
    return response.json()
  },

  getResumenPorEstado: async (): Promise<ResumenEstado[]> => {
    const response = await fetch(`${API_BASE_URL}/reportes/resumen/estados`, {
      method: 'GET',
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Error al obtener el resumen por estado')
    return response.json()
  },

  // 🎯 MÉTODO PRINCIPAL DE EXPORTACIÓN (MEJORADO)
  exportarReporte: async (
    formato: 'pdf' | 'excel', 
    filtros: { fechaInicio: string; fechaFin: string }
  ): Promise<Blob> => {
    try {
      console.log('Exportando reporte:', { formato, filtros });

      const response = await fetch(`${API_BASE_URL}/reportes/exportar/${formato}`, {
        method: 'POST', // 🎯 CAMBIAR A POST para enviar datos en el body
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtros)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error al exportar ${formato}`);
      }

      const blob = await response.blob();
      console.log('Blob recibido:', { size: blob.size, type: blob.type });
      
      return blob;
    } catch (error) {
      console.error(`Error al exportar ${formato}:`, error);
      throw error;
    }
  },

  // 🎯 MÉTODOS ESPECÍFICOS PARA CADA FORMATO
  exportarExcel: async (filtros: { fechaInicio: string; fechaFin: string }): Promise<Blob> => {
    try {
      console.log('Exportando Excel con filtros:', filtros);

      const response = await fetch(`${API_BASE_URL}/reportes/exportar/excel`, {
        method: 'POST', // 🎯 CAMBIAR A POST
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtros)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al exportar Excel: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // 🎯 VERIFICAR QUE SEA UN ARCHIVO EXCEL VÁLIDO
      if (!blob.type.includes('spreadsheet') && !blob.type.includes('excel')) {
        console.warn('Tipo de archivo inesperado:', blob.type);
      }

      return blob;
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      throw error;
    }
  },

  exportarPDF: async (filtros: { fechaInicio: string; fechaFin: string }): Promise<Blob> => {
    try {
      console.log('Exportando PDF con filtros:', filtros);

      const response = await fetch(`${API_BASE_URL}/reportes/exportar/pdf`, {
        method: 'POST', // 🎯 CAMBIAR A POST
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtros)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al exportar PDF: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // 🎯 VERIFICAR QUE SEA UN ARCHIVO PDF VÁLIDO
      if (!blob.type.includes('pdf')) {
        console.warn('Tipo de archivo inesperado:', blob.type);
      }

      return blob;
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      throw error;
    }
  },

  // 🎯 MÉTODO HELPER PARA DESCARGAR ARCHIVOS
  descargarArchivo: (blob: Blob, nombreArchivo: string): void => {
    try {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      
      // 🎯 AGREGAR AL DOM TEMPORALMENTE PARA COMPATIBILIDAD
      document.body.appendChild(link);
      link.click();
      
      // 🎯 LIMPIAR
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('Archivo descargado:', nombreArchivo);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw error;
    }
  }
}

