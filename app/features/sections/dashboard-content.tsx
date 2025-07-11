import { useEffect, useState } from "react"
import { TrendingUp, Wallet, Clock, CheckCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/kpi-card/kpi-card"
import { ActivityItem } from "@/components/activity-item/activity-item"
import { DashboardService } from "@/services/dashboard.service"
import type { DashboardKPI, UltimaSolicitud, DistribucionItem } from "@/services/dashboard.service"

export function DashboardContent() {
  const [creditosProceso, setCreditosProceso] = useState<DashboardKPI | null>(null)
  const [montoSolicitudes, setMontoSolicitudes] = useState<DashboardKPI | null>(null)
  const [tasaAprobacion, setTasaAprobacion] = useState<DashboardKPI | null>(null)
  const [tiempoPromedio, setTiempoPromedio] = useState<DashboardKPI | null>(null)
  const [ultimasSolicitudes, setUltimasSolicitudes] = useState<UltimaSolicitud[]>([])
  const [distribucionTipos, setDistribucionTipos] = useState<DistribucionItem[]>([])
  const [distribucionEstados, setDistribucionEstados] = useState<DistribucionItem[]>([])
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false)
  const [loadingDistribucion, setLoadingDistribucion] = useState(false)

  // Función para obtener el color según el estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Aprobado':
      case 'Desembolsado':
      case 'Activo':
        return 'bg-green-500'
      case 'En Revisión':
        return 'bg-blue-500'
      case 'Pendiente':
      case 'Documentos Pendientes':
        return 'bg-yellow-500'
      case 'Rechazado':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingSolicitudes(true)
        setLoadingDistribucion(true)
        
        const [creditos, monto, tasa, tiempo, solicitudes, tipos, estados] = await Promise.all([
          DashboardService.getCreditosProceso(),
          DashboardService.getMontoSolicitudes(),
          DashboardService.getTasaAprobacion(),
          DashboardService.getTiempoPromedio(),
          DashboardService.getUltimasSolicitudes(5),
          DashboardService.getDistribucionTipos(),
          DashboardService.getDistribucionEstados()
        ])
        
        setCreditosProceso(creditos)
        setMontoSolicitudes(monto)
        setTasaAprobacion(tasa)
        setTiempoPromedio(tiempo)
        setUltimasSolicitudes(solicitudes)
        setDistribucionTipos(tipos)
        setDistribucionEstados(estados)
      } catch (error) {
        console.log(error);
        console.error('Error al cargar datos del dashboard:', error)
      } finally {
        setLoadingSolicitudes(false)
        setLoadingDistribucion(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Créditos en Proceso" 
          value={creditosProceso?.creditos_en_proceso?.toString() || '0'} 
          change={creditosProceso?.variacion_semanal || ''} 
          icon={Clock} 
        />
        <KpiCard 
          title="Monto en Solicitudes" 
          value={montoSolicitudes?.monto_en_solicitudes || '$0'} 
          change={montoSolicitudes?.variacion_mensual || ''} 
          icon={Wallet} 
        />
        <KpiCard 
          title="Tasa de Aprobación" 
          value={`${tasaAprobacion?.tasa_aprobacion || 0}%`} 
          change={tasaAprobacion?.variacion_mensual || ''} 
          icon={CheckCircle} 
        />
        <KpiCard 
          title="Tiempo Promedio" 
          value={`${Math.abs(Number(tiempoPromedio?.tiempo_promedio_dias || 0))} días`} 
          change={tiempoPromedio?.variacion_mensual || ''} 
          icon={TrendingUp} 
        />
      </div>

      {/* Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Solicitudes</CardTitle>
          <CardDescription>Actividad de las últimas solicitudes de crédito</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loadingSolicitudes ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : ultimasSolicitudes.length > 0 ? (
              ultimasSolicitudes.map((solicitud) => (
                <ActivityItem
                  key={solicitud.id}
                  type={solicitud.type}
                  title={solicitud.title}
                  description={solicitud.description}
                  time={solicitud.time}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay solicitudes recientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Créditos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
            <CardDescription>Porcentaje por tipo de crédito (últimos 30 días)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingDistribucion ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : distribucionTipos.length > 0 ? (
                distribucionTipos.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{item.tipo}</span>
                    <span className="text-muted-foreground">{item.porcentaje}%</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de distribución disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Solicitudes</CardTitle>
            <CardDescription>Distribución actual de solicitudes (últimos 30 días)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingDistribucion ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : distribucionEstados.length > 0 ? (
                distribucionEstados.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${getEstadoColor(item.estado || '')}`}></div>
                      <span className="font-medium">{item.estado}</span>
                    </div>
                    <span className="text-muted-foreground">{item.porcentaje}%</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de estados disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
