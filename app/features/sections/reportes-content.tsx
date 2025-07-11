import { useState, useEffect } from "react"
import { Download, FileText, TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePickerWithRange } from "@/components/date-picker-range/date-picker-range"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportesService } from "@/services/reportes.service"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS
import { PermissionGuard } from "@/components/permission-guard/permission-guard" // 🎯 IMPORTAR GUARD
import type { ReportePeriodo, ReporteAsesor} from "@/services/reportes.service"
import { useToast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"
import { TablePagination } from "@/components/table-pagination/table-pagination"

export function ReportesContent() {
  const { toast } = useToast()
  
  // 🎯 USAR HOOK DE PERMISOS
  const { canViewModule, canCreateModule, canEditModule, canDeleteFromModule } = usePermissions()

  // 🎯 VERIFICAR ACCESO AL MÓDULO
  if (!canViewModule('reportes')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para ver el módulo de reportes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null) // 🎯 NUEVO

  // 🎯 SOLO FILTRO DE FECHAS
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const today = new Date()
    const firstDayLastMonth = new Date()
    firstDayLastMonth.setMonth(firstDayLastMonth.getMonth() - 1)
    firstDayLastMonth.setDate(1)
    return {
      from: firstDayLastMonth,
      to: today,
    }
  })

  const [reportData, setReportData] = useState<{
    periodo: ReportePeriodo | null,
    asesores: ReporteAsesor[],
    creditosPorMes: {
      mes: string,
      mes_num: number,
      aprobados: string,
      rechazados: string,
      pendientes: string
    }[],
    resumenBancos: {
      banco: string,
      creditos: number,
      monto: number,
      participacion: number
    }[],
    resumenFinancieras: {
      financiera: string,
      creditos: number,
      monto: number,
      participacion: number
    }[],
    resumenEstados: {
      estado: string,
      cantidad: number,
      porcentaje: number
    }[]
  }>({    
    periodo: null,
    asesores: [],
    creditosPorMes: [],
    resumenBancos: [],
    resumenFinancieras: [],
    resumenEstados: []
  })

  useEffect(() => {
    loadReportData()
  }, [date])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
  }

  const loadReportData = async () => {
    setLoading(true)
    try {
      const selectedYear = date?.from?.getFullYear() || new Date().getFullYear()

      const [periodo, asesores, creditosPorMes, resumenBancos, resumenFinancieras, resumenEstados] = await Promise.all([
        ReportesService.getReportePeriodo(date?.from?.toISOString() || '', date?.to?.toISOString() || ''),
        ReportesService.getTopAsesores(),
        ReportesService.getCreditosPormes(selectedYear),
        ReportesService.getResumenPorBanco(),
        ReportesService.getResumenPorFinanciera(),
        ReportesService.getResumenPorEstado()
      ])
      setReportData({
        periodo,
        asesores,
        creditosPorMes,
        resumenBancos,
        resumenFinancieras,
        resumenEstados
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los datos del reporte",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 🎯 FUNCIÓN MEJORADA DE EXPORTACIÓN
  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(format) // 🎯 INDICAR QUÉ FORMATO SE ESTÁ EXPORTANDO
      
      console.log('Iniciando exportación:', { format, date });
      
      // 🎯 VALIDAR FECHAS
      if (!date?.from || !date?.to) {
        toast({
          title: "Error",
          description: "Selecciona un rango de fechas válido",
          variant: "destructive",
        })
        return
      }

      // 🎯 USAR MÉTODO ESPECÍFICO SEGÚN EL FORMATO
      let blob: Blob
      const filtros = {
        fechaInicio: date.from.toISOString(),
        fechaFin: date.to.toISOString()
      }

      if (format === 'excel') {
        blob = await ReportesService.exportarExcel(filtros)
      } else {
        blob = await ReportesService.exportarPDF(filtros)
      }

      // 🎯 GENERAR NOMBRE DE ARCHIVO
      const fechaHoy = new Date().toISOString().split('T')[0]
      const extension = format === 'excel' ? 'xlsx' : 'pdf'
      const nombreArchivo = `reporte_creditos_${fechaHoy}.${extension}`

      // 🎯 DESCARGAR ARCHIVO
      ReportesService.descargarArchivo(blob, nombreArchivo)

      // 🎯 MOSTRAR ÉXITO
      toast({
        title: "Exportación exitosa",
        description: `Reporte exportado en formato ${format.toUpperCase()}`,
        variant: "default",
      })

    } catch (error) {
      console.error('Error al exportar reporte:', error)
      toast({
        title: "Error de exportación",
        description: error instanceof Error ? error.message : `Error al exportar el reporte en formato ${format}`,
        variant: "destructive",
      })
    } finally {
      setExportLoading(null)
    }
  }

  // 🎯 FUNCIÓN ALTERNATIVA USANDO EL MÉTODO UNIFICADO
  const handleExportReportUnified = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(format)
      
      if (!date?.from || !date?.to) {
        toast({
          title: "Error",
          description: "Selecciona un rango de fechas válido",
          variant: "destructive",
        })
        return
      }

      const blob = await ReportesService.exportarReporte(format, {
        fechaInicio: date.from.toISOString(),
        fechaFin: date.to.toISOString()
      })
      
      const fechaHoy = new Date().toISOString().split('T')[0]
      const extension = format === 'excel' ? 'xlsx' : 'pdf'
      const nombreArchivo = `reporte_creditos_${fechaHoy}.${extension}`
      
      ReportesService.descargarArchivo(blob, nombreArchivo)
      
      toast({
        title: "Exportación exitosa",
        description: `Reporte exportado en formato ${format.toUpperCase()}`,
        variant: "default",
      })

    } catch (error) {
      console.error('Error al exportar reporte:', error)
      toast({
        title: "Error de exportación",
        description: error instanceof Error ? error.message : `Error al exportar el reporte en formato ${format}`,
        variant: "destructive",
      })
    } finally {
      setExportLoading(null)
    }
  }

  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const totalItems = reportData.asesores.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return reportData.asesores.slice(startIndex, endIndex)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
        <div className="flex flex-wrap gap-2">
          {/* 🎯 BOTONES MEJORADOS CON LOADING INDIVIDUAL Y PERMISOS */}
          {canCreateModule('reportes') && (
            <>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('pdf')} 
                disabled={loading || exportLoading !== null}
                className="min-w-[130px]"
              >
                {exportLoading === 'pdf' ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportReport('excel')} 
                disabled={loading || exportLoading !== null}
                className="min-w-[140px]"
              >
                {exportLoading === 'excel' ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 🎯 SOLO FILTRO DE FECHAS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rango de Fechas
          </CardTitle>
          <CardDescription>
            Selecciona el período para generar el reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Solo Selector de Fechas */}
            <div className="max-w-sm">
              <label className="text-sm font-medium text-foreground block mb-2">
                Período del Reporte
              </label>
              <DatePickerWithRange 
                date={date}
                onDateChange={handleDateChange}
                className="w-full"
              />
              {date?.from && date?.to && (
                <p className="text-xs text-muted-foreground mt-2">
                  📅 {date.from.toLocaleDateString('es-ES')} - {date.to.toLocaleDateString('es-ES')}
                </p>
              )}
            </div>

            {/* Botón de Actualizar */}
            <div className="flex justify-start">
              <Button 
                onClick={loadReportData} 
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Actualizar Reporte
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de Carga */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Generando reporte...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Reportes */}
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Resumen Ejecutivo
          </TabsTrigger>
          <TabsTrigger value="creditos" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis de Créditos
          </TabsTrigger>
          <TabsTrigger value="rendimiento" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Rendimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          {/* KPIs del Período */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.periodo ? reportData.periodo.creditosAprobados + reportData.periodo.creditosRechazados + reportData.periodo.creditosPendientes : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {date?.from && date?.to ? 
                    `${date.from.toLocaleDateString('es-ES')} - ${date.to.toLocaleDateString('es-ES')}` 
                    : 'Período seleccionado'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monto Desembolsado</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${reportData.periodo ? 
                    (reportData.periodo.montoTotal).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })  
                    : '0'
                  }              
                </div>
                <p className="text-xs text-muted-foreground">
                  Monto total desembolsado
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reportData.periodo ? reportData.periodo.tasaAprobacion.toFixed(1) + '%' : '0%'}
                </div>
                <p className="text-xs text-muted-foreground">
                  De créditos procesados
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${reportData.periodo ? (reportData.periodo.comisionesTotal / 1000).toFixed(0) + 'K' : '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comisiones generadas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendencias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendencia de Créditos por Mes
              </CardTitle>
              <CardDescription>
                Evolución de aprobaciones, rechazos y pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reportData.creditosPorMes && reportData.creditosPorMes.length > 0 ? (
                  reportData.creditosPorMes.map((mes, index) => {
                    const aprobados = Number(mes.aprobados);
                    const rechazados = Number(mes.rechazados);
                    const pendientes = Number(mes.pendientes);
                    const total = aprobados + rechazados + pendientes || 1;

                    return (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{mes.mes}</div>
                          <div className="text-xs text-muted-foreground">
                            Total: {total} créditos
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Aprobados: {aprobados}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Rechazados: {rechazados}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              Pendientes: {pendientes}
                            </span>
                          </div>

                          <div className="flex rounded-lg overflow-hidden h-3 bg-muted">
                            <div
                              className="bg-green-500 transition-all duration-500"
                              style={{ width: `${(aprobados / total) * 100}%` }}
                            ></div>
                            <div
                              className="bg-red-500 transition-all duration-500"
                              style={{ width: `${(rechazados / total) * 100}%` }}
                            ></div>
                            <div
                              className="bg-yellow-500 transition-all duration-500"
                              style={{ width: `${(pendientes / total) * 100}%` }}
                            ></div>
                          </div>

                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{((aprobados / total) * 100).toFixed(1)}%</span>
                            <span>{((rechazados / total) * 100).toFixed(1)}%</span>
                            <span>{((pendientes / total) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay datos disponibles para el período seleccionado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creditos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Distribución por Banco */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Banco</CardTitle>
                <CardDescription>Volumen de créditos por institución</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.resumenBancos.map((banco, index) => {
                    const montoMillones = parseFloat(banco.total_monto) ;
                    const participacion = (parseFloat(banco.total_monto) / reportData.resumenBancos.reduce((acc, curr) => acc + parseFloat(curr.total_monto), 0)) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{banco.banco}</span>
                          <span className="text-sm text-muted-foreground">{banco.total_creditos} créditos</span>
                        </div>
                        <Progress value={participacion} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${montoMillones.toFixed()}</span>
                          <span>{participacion.toFixed()}% del total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por Financiera */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por financiera</CardTitle>
                <CardDescription>Volumen de créditos por institución</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.resumenFinancieras.map((financiera, index) => {
                    const montoMillones = parseFloat(financiera.total_monto);
                    const participacion = (parseFloat(financiera.total_monto) / reportData.resumenFinancieras.reduce((acc, curr) => acc + parseFloat(curr.total_monto), 0)) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{financiera.banco}</span>
                          <span className="text-sm text-muted-foreground">{financiera.total_creditos} créditos</span>
                        </div>
                        <Progress value={participacion} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>${montoMillones.toFixed()}</span>
                          <span>{participacion.toFixed()}% del total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Estados de Créditos */}
            <Card>
              <CardHeader>
                <CardTitle>Estados de Créditos</CardTitle>
                <CardDescription>Distribución actual de estados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.resumenEstados.map((estado, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${estado.estado === 'Aprobado' ? 'bg-green-500' : estado.estado === 'En Revisión' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm">{estado.estado}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{estado.cantidad}</div>
                        <div className="text-xs text-muted-foreground">{estado.porcentaje}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Asesores</CardTitle>
                <CardDescription>Rendimiento por asesor en el período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posición</TableHead>
                      <TableHead>Asesor</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Monto Gestionado</TableHead>
                      <TableHead>Comisiones</TableHead>
                      <TableHead>Rendimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageData().map((asesor, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge variant={asesor.Posicion <= 3 ? "default" : "secondary"}>
                            #{asesor.Posicion}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{asesor.Asesor}</TableCell>
                        <TableCell>{asesor.Creditos}</TableCell>
                        <TableCell>{asesor['Monto Gestionado']}</TableCell>
                        <TableCell>{asesor.Comisiones}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 text-xs">{asesor.Rendimiento}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
