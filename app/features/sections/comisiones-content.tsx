"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS
import { PermissionGuard } from "@/components/permission-guard/permission-guard" // 🎯 IMPORTAR GUARD

import { Calculator, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Calendar, Users, Filter, Eye, Edit } from "lucide-react"
import { ComisionService, type Comision, type ResumenComision } from '@/services/comision.service'
import { AsesorService, type Asesor } from '@/services/asesores.service'
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { ActionModals } from "@/components/action-modals/action-modals"


interface ComisionesContentProps {
  onAddNotification: (notification: any) => void
}

export function ComisionesContent({ onAddNotification }: ComisionesContentProps) {
  const { toast } = useToast()
  
  // 🎯 USAR HOOK DE PERMISOS
  const { canViewModule, canCreateModule, canEditModule, canDeleteFromModule } = usePermissions()

  // 🎯 VERIFICAR ACCESO AL MÓDULO
  if (!canViewModule('comisiones')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para ver el módulo de comisiones.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Función para obtener el periodo actual (YYYY-MM)
  const getPeriodoActual = (): string => {
    const fechaActual = new Date()
    const año = fechaActual.getFullYear()
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0')
    return `${año}-${mes}`
  }

  // Estados existentes
  const [comisiones, setComisiones] = useState<Comision[]>([])
  const [resumen, setResumen] = useState<ResumenComision[]>([])
  const [asesores, setAsesores] = useState<Asesor[]>([])
  const [loading, setLoading] = useState(true)
  const [calculandoComisiones, setCalculandoComisiones] = useState(false)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  
  // Estados para modales de acciones
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: "view" | "edit" | null
    data: Comision | null
  }>({ isOpen: false, action: null, data: null })
  
  // Estados para modales originales
  const [modalCalcular, setModalCalcular] = useState(false)
  const [modalPago, setModalPago] = useState(false)
  const [modalRechazar, setModalRechazar] = useState(false) // NUEVO: Modal de rechazo
  const [comisionSeleccionada, setComisionSeleccionada] = useState<Comision | null>(null)
  const [motivoRechazo, setMotivoRechazo] = useState('') // NUEVO: Motivo del rechazo

  // Estados para filtros mejorados
  const [filters, setFilters] = useState<Record<string, string>>({})
  
  // Estados para filtros avanzados - AGREGAR PERIODO ACTUAL POR DEFECTO
  const [filtrosAvanzados, setFiltrosAvanzados] = useState({
    periodo: getPeriodoActual(), // CAMBIO: Usar mes actual por defecto
    estado: 'todos',
    asesorId: 'todos'
  })

  // Estados para selección múltiple
  const [comisionesSeleccionadas, setComisionesSeleccionadas] = useState<number[]>([])

  // Estados para cálculo de comisiones - TAMBIÉN AGREGAR PERIODO ACTUAL
  const [datosCalculo, setDatosCalculo] = useState({
    periodo: getPeriodoActual(), // CAMBIO: Usar mes actual por defecto
    asesorId: 'todos'
  })

  // Estados para pago de comisiones
  const [datosPago, setDatosPago] = useState({
    metodoPago: 'Transferencia' as 'Transferencia' | 'Efectivo' | 'Cheque',
    numeroTransferencia: '',
    observaciones: '',
    bonificaciones: 0,
    deducciones: 0
  })

  // AGREGAR LA FUNCIÓN QUE FALTA
  // Función para limpiar filtros - ACTUALIZAR PARA USAR PERIODO ACTUAL
  const limpiarFiltrosAvanzados = () => {
    setFiltrosAvanzados({ 
      periodo: getPeriodoActual(), // CAMBIO: Volver al mes actual, no vacío
      estado: 'todos', 
      asesorId: 'todos' 
    })
    setFilters({})
  }

  // Función para formatear montos
  const formatearMonto = (monto: number | null | undefined) => {
    if (monto === null || monto === undefined || isNaN(monto)) {
      return '$0 COP'
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto)
  }

  const formatearPeriodo = (periodo: string) => {
    const [año, mes] = periodo.split('-')
    const fecha = new Date(parseInt(año), parseInt(mes) - 1)
    return fecha.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Pagado':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pagado</Badge>
      case 'Rechazado':
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  // Filtrar datos combinando filtros básicos y avanzados
  const filteredData = comisiones.filter((comision) => {
    // Filtros básicos (TableFilter)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matches = 
        comision.asesor?.nombre.toLowerCase().includes(searchTerm) ||
        (comision.banco?.nombre || comision.financiera?.nombre || '').toLowerCase().includes(searchTerm) ||
        comision.periodo.includes(searchTerm)
      if (!matches) return false
    }

    if (filters.estado && comision.estado !== filters.estado) {
      return false
    }

    if (filters.tipoEntidad && comision.tipoEntidad !== filters.tipoEntidad) {
      return false
    }

    if (filters.rangoComision) {
      const comisionTotal = comision.comisionTotal || 0
      if (filters.rangoComision === "baja" && comisionTotal >= 500000) return false
      if (filters.rangoComision === "media" && (comisionTotal < 500000 || comisionTotal > 2000000)) return false
      if (filters.rangoComision === "alta" && comisionTotal <= 2000000) return false
    }

    // Filtros avanzados
    if (filtrosAvanzados.periodo && comision.periodo !== filtrosAvanzados.periodo) {
      return false
    }

    if (filtrosAvanzados.estado !== 'todos' && comision.estado !== filtrosAvanzados.estado) {
      return false
    }

    if (filtrosAvanzados.asesorId !== 'todos' && comision.asesorId?.toString() !== filtrosAvanzados.asesorId) {
      return false
    }

    return true
  })
  // Calcular estadísticas BASADAS EN LOS DATOS FILTRADOS (no en todos los datos)
  const pagadosFiltrados = filteredData.filter(c => c.estado === 'Pagado').length
  const rechazadosFiltrados = filteredData.filter(c => c.estado === 'Rechazado').length

  // CAMBIO: Calcular total solo del periodo filtrado, no de todo el histórico
  const getTotalPorPeriodo = () => {
    if (!filtrosAvanzados.periodo) {
      // Si no hay periodo seleccionado, usar todas las comisiones individuales
      return comisiones.reduce((sum, c) => sum + (c.comisionTotal || 0), 0)
    }
    
    // Buscar el periodo específico en el resumen histórico
    const periodoEncontrado = resumen.find(r => r.periodo === filtrosAvanzados.periodo)
    
    if (periodoEncontrado) {
      // Usar el total del histórico para ese periodo específico
      return Number(periodoEncontrado.comisionTotal || periodoEncontrado.totalMonto || 0)
    } else {
      // Si no está en el histórico, calcular de las comisiones individuales
      return comisiones
        .filter(c => c.periodo === filtrosAvanzados.periodo)
        .reduce((sum, c) => sum + (c.comisionTotal || 0), 0)
    }
  }

  const totalComisiones = getTotalPorPeriodo()
  

  // AGREGAR LAS VARIABLES QUE FALTAN - Calcular estadísticas generales (para comparación)
  const pagados = comisiones.filter(c => c.estado === 'Pagado').length
  const rechazados = comisiones.filter(c => c.estado === 'Rechazado').length

  // Verificar si hay filtros activos
  const hayFiltrosActivos = (
    filtrosAvanzados.periodo !== getPeriodoActual() ||
    filtrosAvanzados.estado !== 'todos' ||
    filtrosAvanzados.asesorId !== 'todos' ||
    Object.keys(filters).length > 0
  )

  // Paginación (MOVER DESPUÉS de filteredData)
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  // Funciones para manejo de selección múltiple
  const toggleSeleccionComision = (comisionId: number) => {
    setComisionesSeleccionadas(prev => 
      prev.includes(comisionId) 
        ? prev.filter(id => id !== comisionId)
        : [...prev, comisionId]
    )
  }
  const limpiarSeleccion = () => {
    setComisionesSeleccionadas([])
  }

  // AGREGAR LA FUNCIÓN loadData QUE FALTA
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar TODOS los datos sin filtros del servidor
      const [comisionesData, resumenData, asesoresData] = await Promise.all([
        ComisionService.getComisiones(), // Sin filtros, cargar todo
        ComisionService.getResumen(),
        AsesorService.getAsesores()
      ])
      console.log(resumenData)
      setComisiones(comisionesData)
      setResumen(resumenData)
      setAsesores(asesoresData)
      
      // Limpiar selección cuando cambien los datos
      setComisionesSeleccionadas([])
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las comisiones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // SOLO cargar datos una vez al montar el componente
  useEffect(() => {
    loadData()
  }, []) // Sin dependencias, solo se ejecuta una vez

  const handleSaveComision = async (data: Comision) => {
    try {
      if (data.id) {
        await ComisionService.updateComision(data.id, data)
        await loadData()

        toast({
          title: "Comisión actualizada",
          description: `La comisión de ${data.asesor?.nombre} ha sido actualizada correctamente.`,
          variant: "default",
        })

        if (onAddNotification) {
          onAddNotification({
            type: "success",
            title: "Comisión actualizada",
            description: `Se actualizó la comisión de ${data.asesor?.nombre}`,
            read: false,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la comisión",
        variant: "destructive",
      })
    }
  }

  // Función para procesar acciones masivas
  const procesarAccionMasiva = async (accion: 'pagar' | 'rechazar') => {
    if (comisionesSeleccionadas.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos una comisión",
        variant: "destructive",
      })
      return
    }

    const confirmMessage = accion === 'pagar' 
      ? `¿Confirmas el pago de ${comisionesSeleccionadas.length} comisiones?`
      : `¿Confirmas rechazar ${comisionesSeleccionadas.length} comisiones?`

    if (!confirm(confirmMessage)) return

    try {
      const promises = comisionesSeleccionadas.map(id => 
        ComisionService.updateComision(id, {
          estado: accion === 'pagar' ? 'Pagado' : 'Rechazado',
          fechaPago: accion === 'pagar' ? new Date().toISOString() : undefined,
          metodoPago: accion === 'pagar' ? 'Transferencia' : undefined,
          observaciones: accion === 'rechazar' ? 'Rechazado mediante acción masiva' : undefined
        })
      )

      await Promise.all(promises)
      await loadData()
      limpiarSeleccion()

      toast({
        title: accion === 'pagar' ? "Pagos registrados" : "Comisiones rechazadas",
        description: `Se procesaron ${comisionesSeleccionadas.length} comisiones`,
        variant: "default",
      })

      onAddNotification({
        type: "success",
        title: accion === 'pagar' ? "Pagos masivos" : "Rechazos masivos",
        description: `${comisionesSeleccionadas.length} comisiones ${accion === 'pagar' ? 'pagadas' : 'rechazadas'}`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Error al ${accion === 'pagar' ? 'pagar' : 'rechazar'} las comisiones`,
        variant: "destructive",
      })
    }
  }

  // Función para rechazar comisión individual - ACTUALIZADA
  const handleRechazarComision = (comision: Comision) => {
    setComisionSeleccionada(comision)
    setMotivoRechazo('') // Limpiar motivo anterior
    setModalRechazar(true) // Abrir modal en lugar de confirm
  }

  // Función para confirmar el rechazo - ACTUALIZADA SIN RECARGAR
  const confirmarRechazo = async () => {
    if (!comisionSeleccionada) return

    if (!motivoRechazo.trim()) {
      toast({
        title: "Error",
        description: "Por favor, especifica un motivo para el rechazo",
        variant: "destructive",
      })
      return
    }

    try {
      await ComisionService.updateComision(comisionSeleccionada.id, {
        estado: 'Rechazado',
        observaciones: motivoRechazo.trim(),
        fechaRechazo: new Date().toISOString()
      })

      // CAMBIO: Actualizar solo el estado local, sin recargar todo
      setComisiones(prevComisiones => 
        prevComisiones.map(comision => 
          comision.id === comisionSeleccionada.id 
            ? { 
                ...comision, 
                estado: 'Rechazado',
                observaciones: motivoRechazo.trim(),
                fechaRechazo: new Date().toISOString()
              }
            : comision
        )
      )

      // Cerrar modal y limpiar estados
      setModalRechazar(false)
      setComisionSeleccionada(null)
      setMotivoRechazo('')

      toast({
        title: "Comisión rechazada",
        description: `Se rechazó la comisión de ${comisionSeleccionada.asesor?.nombre}`,
        variant: "default",
      })

      onAddNotification({
        type: "warning",
        title: "Comisión rechazada",
        description: `Comisión de ${comisionSeleccionada.asesor?.nombre} rechazada: ${motivoRechazo.substring(0, 50)}...`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al rechazar la comisión",
        variant: "destructive",
      })
    }
  }

  // Función para descargar archivo TXT
  const descargarArchivoTXT = (contenido: string, nombreArchivo: string) => {
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
  };

  // Función para calcular comisiones con manejo mejorado de errores
  const handleCalcularComisiones = async () => {
    if (!datosCalculo.periodo) {
      toast({
        title: "Error",
        description: "Selecciona un periodo válido",
        variant: "destructive",
      })
      return
    }

    try {
      setCalculandoComisiones(true)
      
      const requestData: any = { periodo: datosCalculo.periodo }
      if (datosCalculo.asesorId !== 'todos') {
        requestData.asesorId = parseInt(datosCalculo.asesorId)
      }
      const resultado = await ComisionService.calcularComisiones(requestData)      
      // Si la respuesta es exitosa y tiene comisiones
      if (resultado.success && resultado.comisiones && resultado.comisiones.length > 0) {
        await loadData()
        setModalCalcular(false)
        setDatosCalculo({ periodo: '', asesorId: 'todos' })

        // DESCARGAR ARCHIVO TXT AUTOMÁTICAMENTE
        if (resultado.archivo && resultado.archivo.generado) {
          const nombreArchivo = resultado.archivo.nombre || `comisiones_${resultado.periodo}_${new Date().toISOString().split('T')[0]}.txt`;
          descargarArchivoTXT(resultado.archivo.contenido, nombreArchivo);
          
          toast({
            title: "✅ Comisiones calculadas y reporte generado",
            description: (
              <div className="space-y-2">
                <p className="font-medium">Periodo {resultado.periodo}</p>
                <p className="text-sm">
                  💰 Total: ${resultado.totalComisiones.toLocaleString('es-CO')} COP
                </p>
                <p className="text-sm">
                  👥 Asesores: {resultado.asesoresConComision}
                </p>
                <p className="text-xs text-muted-foreground">
                  📄 Reporte: {nombreArchivo}
                </p>
              </div>
            ),
            variant: "default",
          })
        }

        if (onAddNotification) {
          onAddNotification({
            type: "success",
            title: "Comisiones calculadas",
            description: `Periodo ${resultado.periodo}: ${resultado.asesoresConComision} ${resultado.asesoresConComision === 1 ? 'asesor' : 'asesores'} con comisiones. Total: $${resultado.totalComisiones.toLocaleString('es-CO')} COP`,
            read: false,
          })
        }
      }
    } catch (error: any) {
      
      // MANEJO ESPECÍFICO POR CÓDIGO DE ERROR
      if (error.response?.status === 404) {
        const errorData = error.response.data           
        // Caso 2: No se generaron comisiones válidas (montos < $1M)
        if (errorData.message === 'No se generaron comisiones válidas') {
          toast({
            title: "💰 No se generaron comisiones válidas",
            description: (
              <div className="space-y-2">
                <p className="font-medium">Periodo {datosCalculo.periodo}</p>
                <p className="text-sm">
                  📊 {errorData.detalles?.creditosEncontrados || 0} créditos encontrados
                </p>
                <p className="text-sm">
                  💵 ${errorData.detalles?.montoTotalEncontrado?.toLocaleString('es-CO') || '0'} COP total
                </p>
                <p className="text-sm font-medium text-amber-50">
                  ⚠️ {errorData.detalles?.razonPrincipal || 'Los montos son menores a $1,000,000 COP'}
                </p>
                <p className="text-xs  text-amber-50">
                  {errorData.detalles?.sistemaComision || 'Solo se pagan comisiones por cada millón completo'}
                </p>
                {errorData.ejemplo && (
                  <div className="text-xs bg-amber-50 p-2 rounded mt-2">
                    <p className="font-medium">{errorData.ejemplo.descripcion}</p>
                    <p className="text-green-600">✅ {errorData.ejemplo.caso}</p>
                    <p className="text-red-600">❌ {errorData.ejemplo.noGeneraComision}</p>
                  </div>
                )}
              </div>
            ),
            variant: "destructive",
          })
        }
        
        if (onAddNotification) {
          onAddNotification({
            type: "warning",
            title: "Sin comisiones",
            description: `Periodo ${datosCalculo.periodo}: ${errorData.message}`,
            read: false,
          })
        }
      }
      else {
        // Error genérico o de conexión
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'        
        toast({
          title: "❌ Error",
          description: (
            <div className="space-y-1">
              <p>Error al calcular las comisiones</p>
              <p className="text-xs text-muted-foreground">{errorMessage}</p>
              {!error.response && (
                <p className="text-xs text-red-600">
                  Verifica que el backend esté ejecutándose en puerto 5000
                </p>
              )}
            </div>
          ),
          variant: "destructive",
        })
      }
    } finally {
      setCalculandoComisiones(false)
    }
  }

  // Función para pagar comisión
  const handlePagarComision = async () => {
    if (!comisionSeleccionada) return

    try {
      const dataUpdate: any = {
        estado: 'Pagado' as const,
        fechaPago: new Date().toISOString(),
        metodoPago: datosPago.metodoPago,
        observaciones: datosPago.observaciones || `Pago procesado vía ${datosPago.metodoPago}`
      }

      if (datosPago.metodoPago === 'Transferencia' && datosPago.numeroTransferencia) {
        dataUpdate.numeroTransferencia = datosPago.numeroTransferencia
      }

      if (datosPago.bonificaciones > 0) {
        dataUpdate.bonificaciones = datosPago.bonificaciones
      }

      if (datosPago.deducciones > 0) {
        dataUpdate.deducciones = datosPago.deducciones
      }

      await ComisionService.updateComision(comisionSeleccionada.id, dataUpdate)
      
      await loadData()
      setModalPago(false)
      setComisionSeleccionada(null)
      setDatosPago({
        metodoPago: 'Transferencia',
        numeroTransferencia: '',
        observaciones: '',
        bonificaciones: 0,
        deducciones: 0
      })

      toast({
        title: "Pago registrado",
        description: `Se registró el pago de la comisión de ${comisionSeleccionada.asesor?.nombre}`,
        variant: "default",
      })

      onAddNotification({
        type: "success",
        title: "Pago registrado",
        description: `Comisión de ${comisionSeleccionada.asesor?.nombre} pagada exitosamente`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al registrar el pago",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando comisiones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header con acciones masivas */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestión de Comisiones</h2>
          <div className="flex gap-2">
            {comisionesSeleccionadas.length > 0 && canEditModule('comisiones') && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => procesarAccionMasiva('pagar')}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Pagar ({comisionesSeleccionadas.length})
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => procesarAccionMasiva('rechazar')}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar ({comisionesSeleccionadas.length})
                </Button>
                <Button 
                  variant="ghost"
                  onClick={limpiarSeleccion}
                  size="sm"
                >
                  Limpiar
                </Button>
              </>
            )}
            {canCreateModule('comisiones') && (
              <Dialog open={modalCalcular} onOpenChange={setModalCalcular}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calcular Comisiones
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Calcular Comisiones</DialogTitle>
                  <DialogDescription>
                    Selecciona el periodo para calcular las comisiones.
                    <br />
                    <span className="text-sm text-muted-foreground mt-1 block">
                      📄 Se generará automáticamente un reporte TXT con el resumen
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      Periodo
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        Sugerido: {formatearPeriodo(getPeriodoActual())}
                      </Badge>
                    </Label>
                    <Input
                      type="month"
                      value={datosCalculo.periodo}
                      onChange={(e) => setDatosCalculo(prev => ({ ...prev, periodo: e.target.value }))}
                      className="mt-1"
                    />
                    {datosCalculo.periodo && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatearPeriodo(datosCalculo.periodo)}
                        </p>
                        {datosCalculo.periodo === getPeriodoActual() && (
                          <Badge variant="default" className="ml-1 text-xs h-4 px-1 bg-green-100 text-green-700">
                            Mes actual
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Asesor (opcional)</Label>
                    <Select 
                      value={datosCalculo.asesorId} 
                      onValueChange={(value) => setDatosCalculo(prev => ({ ...prev, asesorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los asesores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los asesores</SelectItem>
                        {asesores.map((asesor) => (
                          <SelectItem key={asesor.id} value={asesor.id?.toString() || ''}>
                            {asesor.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Información adicional sobre el proceso */}
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Criterios de cálculo</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Solo créditos: Aprobado, Desembolsado, Activo</p>
                      <p>• Comisión por cada millón completo</p>
                      <p>• Requiere banco o financiera asociada</p>
                      <p>• Reporte automático si hay comisiones</p>
                      <p>• Periodo actual: {formatearPeriodo(getPeriodoActual())}</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCalcularComisiones}
                    disabled={calculandoComisiones}
                    className="w-full"
                  >
                    {calculandoComisiones ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                        Verificando y calculando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Calcular Comisiones
                        {datosCalculo.periodo === getPeriodoActual() && (
                          <Badge className="ml-1 text-xs h-4 px-1 bg-white/20">
                            Actual
                          </Badge>
                        )}
                      </div>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas - ACTUALIZADAS PARA REFLEJAR FILTROS */}
      <div className="flex-shrink-0 mb-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Comisiones
                {hayFiltrosActivos && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Filtrado
                  </Badge>
                )}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatearMonto(totalComisiones)}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {filteredData.length} {filteredData.length === 1 ? 'comisión' : 'comisiones'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pagadas
                {hayFiltrosActivos && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Filtrado
                  </Badge>
                )}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{pagadosFiltrados}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Completadas</span>
                {hayFiltrosActivos && (
                  <span className="text-blue-600 font-medium">
                    de {pagados} total {/* AHORA YA ESTÁ DEFINIDA */}
                  </span>
                )}
              </div>
              {hayFiltrosActivos && pagadosFiltrados > 0 && (
                <div className="mt-1 pt-1 border-t">
                  <div className="text-xs text-green-600 font-medium">
                    {((pagadosFiltrados / filteredData.length) * 100).toFixed(1)}% del periodo
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rechazadas
                {hayFiltrosActivos && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Filtrado
                  </Badge>
                )}
              </CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rechazadosFiltrados}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>No pagadas</span>
                {hayFiltrosActivos && (
                  <span className="text-blue-600 font-medium">
                    de {rechazados} total {/* AHORA YA ESTÁ DEFINIDA */}
                  </span>
                )}
              </div>
              {hayFiltrosActivos && rechazadosFiltrados > 0 && (
                <div className="mt-1 pt-1 border-t">
                  <div className="text-xs text-red-600 font-medium">
                    {((rechazadosFiltrados / filteredData.length) * 100).toFixed(1)}% del periodo
                  </div>
                </div>
              )}
            </CardContent>
          </Card>       
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 min-h-0">
        <Tabs defaultValue="comisiones" className="h-full flex flex-col">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="comisiones">Comisiones</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="comisiones" className="flex-1 flex flex-col space-y-4 mt-4 min-h-0">
            {/* Card principal con filtros y tabla */}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle>Lista de Comisiones</CardTitle>
                <CardDescription>
                  Sistema colombiano: Comisión fija por cada millón de pesos
                  {comisionesSeleccionadas.length > 0 && (
                    <span className="block text-blue-600 font-medium mt-1">
                      {comisionesSeleccionadas.length} comisiones seleccionadas
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
                {/* Filtros básicos y avanzados */}
                <div className="space-y-4">                  
                  {/* Filtros avanzados mejorados */}
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium">Filtros Avanzados</h3>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {formatearPeriodo(getPeriodoActual())} {/* Mostrar mes actual */}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={limpiarFiltrosAvanzados} // CAMBIO: Usar la nueva función
                        className="h-7 px-2 text-xs"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Limpiar
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Filtro de Periodo */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Periodo
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            Actual: {getPeriodoActual()}
                          </Badge>
                        </Label>
                        <Input
                          type="month"
                          value={filtrosAvanzados.periodo}
                          onChange={(e) => setFiltrosAvanzados(prev => ({ ...prev, periodo: e.target.value }))}
                          placeholder="Selecciona periodo"
                          className="h-9 text-sm"
                        />
                        {filtrosAvanzados.periodo && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {formatearPeriodo(filtrosAvanzados.periodo)}
                            </p>
                            {filtrosAvanzados.periodo === getPeriodoActual() && (
                              <Badge variant="default" className="text-xs h-4 px-1 bg-green-100 text-green-700 border-green-200">
                                Mes actual
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Filtro de Estado */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Estado
                        </Label>
                        <Select 
                          value={filtrosAvanzados.estado} 
                          onValueChange={(value) => setFiltrosAvanzados(prev => ({ ...prev, estado: value }))}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                                <span>Todos los estados</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Pagado">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>Pagado</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Rechazado">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span>Rechazado</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Filtro de Asesor */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Asesor
                        </Label>
                        <Select 
                          value={filtrosAvanzados.asesorId} 
                          onValueChange={(value) => setFiltrosAvanzados(prev => ({ ...prev, asesorId: value }))}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Selecciona asesor" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px] overflow-y-auto">
                            <SelectItem value="todos">
                              <div className="flex items-center gap-2 py-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Todos los asesores</span>
                              </div>
                            </SelectItem>
                            
                            <div className="border-t border-border my-1"></div>
                            
                            {asesores.map((asesor) => (
                              <SelectItem 
                                key={asesor.id} 
                                value={asesor.id?.toString() || ''}
                                className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                              >
                                <div className="flex items-center gap-3 py-1">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-medium">
                                      {asesor.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <div className="font-medium text-foreground truncate">
                                      {asesor.nombre}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {asesor.cargo}
                                      {asesor.sucursal && (
                                        <span className="ml-1 text-primary">• {asesor.sucursal}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                            
                            {asesores.length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                                No hay asesores disponibles
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Filtros activos */}
                    {(filtrosAvanzados.periodo || filtrosAvanzados.estado !== 'todos' || filtrosAvanzados.asesorId !== 'todos' || Object.keys(filters).length > 0) && (
                      <div className="mt-4 pt-3 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="h-5 text-xs">
                            Filtros activos
                          </Badge>
                          {filtrosAvanzados.periodo === getPeriodoActual() && (
                            <Badge variant="default" className="h-5 text-xs bg-blue-100 text-blue-700 border-blue-200">
                              <Calendar className="h-3 w-3 mr-1" />
                              Periodo actual
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {/* Filtros básicos activos */}
                          {filters.search && (
                            <Badge variant="secondary" className="h-6 text-xs bg-blue-100 text-blue-800 border-blue-200">
                              <Filter className="h-3 w-3 mr-1" />
                              Búsqueda: "{filters.search}"
                              <button
                                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                className="ml-2 hover:text-blue-900 font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          )}
                          
                          {filters.estado && (
                            <Badge variant="secondary" className="h-6 text-xs bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Estado: {filters.estado}
                              <button
                                onClick={() => setFilters(prev => ({ ...prev, estado: '' }))}
                                className="ml-2 hover:text-green-900 font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          )}
                          
                          {filters.tipoEntidad && (
                            <Badge variant="secondary" className="h-6 text-xs bg-purple-100 text-purple-800 border-purple-200">
                              <Users className="h-3 w-3 mr-1" />
                              Entidad: {filters.tipoEntidad}
                              <button
                                onClick={() => setFilters(prev => ({ ...prev, tipoEntidad: '' }))}
                                className="ml-2 hover:text-purple-900 font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          )}
                          
                          {filters.rangoComision && (
                            <Badge variant="secondary" className="h-6 text-xs bg-orange-100 text-orange-800 border-orange-200">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Rango: {filters.rangoComision}
                              <button
                                onClick={() => setFilters(prev => ({ ...prev, rangoComision: '' }))}
                                className="ml-2 hover:text-orange-900 font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          )}
                          
                          {/* Filtros avanzados activos */}
                          {filtrosAvanzados.periodo && (
                            <Badge variant="secondary" className={`h-6 text-xs ${
                              filtrosAvanzados.periodo === getPeriodoActual() 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            }`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatearPeriodo(filtrosAvanzados.periodo)}
                              {filtrosAvanzados.periodo === getPeriodoActual() && (
                                <span className="ml-1 text-xs">(Actual)</span>
                              )}
                              <button
                                onClick={() => setFiltrosAvanzados(prev => ({ ...prev, periodo: getPeriodoActual() }))}
                                className={`ml-2 hover:font-bold ${
                                  filtrosAvanzados.periodo === getPeriodoActual() 
                                    ? 'hover:text-green-900' 
                                    : 'hover:text-indigo-900'
                                }`}
                                title={filtrosAvanzados.periodo === getPeriodoActual() ? 'Ya es el periodo actual' : 'Volver al periodo actual'}
                              >
                                {filtrosAvanzados.periodo === getPeriodoActual() ? '↻' : '×'}
                              </button>
                            </Badge>
                          )}
                          
                          {filtrosAvanzados.estado !== 'todos' && (
                            <Badge variant="secondary" className="h-6 text-xs bg-green-100 text-green-800 border-green-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Estado: {filtrosAvanzados.estado}
                              <button
                                onClick={() => setFiltrosAvanzados(prev => ({ ...prev, estado: 'todos' }))}
                                className="ml-2 hover:text-green-900 font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          )}
                          
                          {filtrosAvanzados.asesorId !== 'todos' && (
                            <Badge variant="secondary" className="h-6 text-xs bg-purple-100 text-purple-800 border-purple-200">
                              <Users className="h-3 w-3 mr-1" />
                              {asesores.find(a => a.id?.toString() === filtrosAvanzados.asesorId)?.nombre || 'Asesor'}
                              <button
                                onClick={() => setFiltrosAvanzados(prev => ({ ...prev, asesorId: 'todos' }))}
                                className="ml-2 hover:text-purple-900 font-bold"
                              >
                                ×
                              </button>
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabla con paginación */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="rounded-md border flex-1 overflow-hidden">
                    <div className="h-full overflow-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead>Asesor</TableHead>
                            <TableHead>Entidad</TableHead>
                            <TableHead>Periodo</TableHead>
                            <TableHead>Créditos</TableHead>
                            <TableHead>Monto Gestionado</TableHead>
                            <TableHead>Comisión Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[120px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.length > 0 ? (
                            paginatedData.map((comision) => (
                              <TableRow key={comision.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{comision.asesor?.nombre}</div>
                                    <div className="text-sm text-muted-foreground">{comision.asesor?.cargo}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {comision.banco?.nombre || comision.financiera?.nombre}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {comision.tipoEntidad}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{formatearPeriodo(comision.periodo)}</TableCell>
                                <TableCell>{comision.creditosAprobados}</TableCell>
                                <TableCell>{formatearMonto(comision.montoTotalGestionado)}</TableCell>
                                <TableCell className="font-medium text-green-600">
                                  {formatearMonto(comision.comisionTotal)}
                                </TableCell>
                                <TableCell>{getEstadoBadge(comision.estado)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {/* Solo mostrar botón de rechazar para comisiones que NO están rechazadas */}
                                    {comision.estado !== 'Rechazado' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRechazarComision(comision)}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Rechazar comisión"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                    
                                    {comision.estado === 'Rechazado' && (
                                      <Badge variant="destructive" className="text-xs ml-2">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Rechazada
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={9} className="h-24 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">No hay comisiones para mostrar</p>
                                    <p className="text-sm text-muted-foreground">
                                      No se encontraron comisiones con los filtros aplicados
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Paginación */}
                  <div className="mt-4">
                    <TablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalItems={totalItems}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="flex-1 min-h-0 mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle>Resumen Histórico</CardTitle>
                <CardDescription>Resumen de comisiones por periodo</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0">
                <div className="h-full overflow-auto border rounded-md">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Periodo</TableHead>
                        <TableHead>Asesores</TableHead>
                        <TableHead>Total Comisiones</TableHead>
                        <TableHead>Pagadas</TableHead>
                        <TableHead>Rechazadas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resumen.map((item) => (
                        <TableRow key={item.periodo}>
                          <TableCell className="font-medium">
                            {formatearPeriodo(item.periodo)}
                          </TableCell>
                          <TableCell>{item.totalAsesores}</TableCell>
                          <TableCell className="font-medium text-green-600">
                            {formatearMonto(item.totalMonto)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{item.pagados}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.rechazados}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modales de acciones (Ver/Editar) */}
      <ActionModals
        type="comision"
        action={modalState.action}
        data={modalState.data}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, data: null })}
        onSave={handleSaveComision}
        onDelete={() => {}} // No se usa para comisiones
      />

      {/* Modal de rechazo - NUEVO */}
      <Dialog open={modalRechazar} onOpenChange={setModalRechazar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Rechazar Comisión
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres rechazar la comisión de{' '}
              <span className="font-medium text-foreground">
                {comisionSeleccionada?.asesor?.nombre}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Información de la comisión */}
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Periodo:</span>
                  <span className="font-medium">
                    {comisionSeleccionada?.periodo ? formatearPeriodo(comisionSeleccionada.periodo) : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entidad:</span>
                  <span className="font-medium">
                    {comisionSeleccionada?.banco?.nombre || comisionSeleccionada?.financiera?.nombre}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto comisión:</span>
                  <span className="font-medium text-green-600">
                    {comisionSeleccionada?.comisionTotal ? formatearMonto(comisionSeleccionada.comisionTotal) : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créditos:</span>
                  <span className="font-medium">
                    {comisionSeleccionada?.creditosAprobados || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Motivo del rechazo */}
            <div className="space-y-2">
              <Label htmlFor="motivoRechazo" className="text-sm font-medium">
                Motivo del rechazo *
              </Label>
              <Textarea
                id="motivoRechazo"
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Especifica el motivo del rechazo..."
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Este motivo será registrado y visible en el historial de la comisión.
              </p>
            </div>

            {/* Opciones rápidas de motivo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Motivos comunes:</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Documentación incompleta',
                  'Crédito no cumple criterios',
                  'Error en cálculo',
                  'Duplicado',
                  'Fuera de periodo',
                  'Cliente no elegible'
                ].map((motivo) => (
                  <Button
                    key={motivo}
                    variant="outline"
                    size="sm"
                    onClick={() => setMotivoRechazo(motivo)}
                    className="text-xs h-7 px-2"
                  >
                    {motivo}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setModalRechazar(false)
                setComisionSeleccionada(null)
                setMotivoRechazo('')
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarRechazo}
              disabled={!motivoRechazo.trim()}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar Comisión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de pago - EXISTENTE */}
      <Dialog open={modalPago} onOpenChange={setModalPago}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago de Comisión</DialogTitle>
            <DialogDescription>
              Registra el pago para {comisionSeleccionada?.asesor?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Método de Pago</Label>
              <Select 
                value={datosPago.metodoPago} 
                onValueChange={(value: 'Transferencia' | 'Efectivo' | 'Cheque') => 
                  setDatosPago(prev => ({ ...prev, metodoPago: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {datosPago.metodoPago === 'Transferencia' && (
              <div>
                <Label>Número de Transferencia</Label>
                <Input
                  value={datosPago.numeroTransferencia}
                  onChange={(e) => setDatosPago(prev => ({ ...prev, numeroTransferencia: e.target.value }))}
                  placeholder="Número de referencia"
                />
              </div>
            )}

            <div>
              <Label>Observaciones</Label>
              <Textarea
                value={datosPago.observaciones}
                onChange={(e) => setDatosPago(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePagarComision} className="w-full">
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}