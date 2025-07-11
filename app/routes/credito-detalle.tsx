import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, FileText, Calendar, User, CreditCard, Building2, Percent } from "lucide-react"
import { CreditoService, type Credito } from '@/services/credito.service'
import { useParams } from "react-router"

export default function CreditoDetalle() {
  const { id } = useParams();
  const [credito, setCredito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCredito = async () => {
      try {
        setLoading(true);
        const data = await CreditoService.getCreditoById(id);
        setCredito(data);
      } catch (err) {
        setError("Error al cargar los datos del crédito");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCredito();
    }
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full text-destructive">
      <span>{error}</span>
    </div>
  );

  if (!credito) return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <span>Crédito no encontrado</span>
    </div>
  );

  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case "Aprobado":
      case "Desembolsado":
      case "Activo":
        return "default"
      case "Rechazado":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Detalles del Crédito</h2>
        <Badge variant={getEstadoVariant(credito.estado)}>{credito.estado}</Badge>
      </div>

      {/* Resumen de Información */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${new Intl.NumberFormat().format(credito.monto)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Interés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credito.tasa}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plazo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credito.plazo} meses</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fecha de Solicitud</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(credito.fecha_solicitud).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Crédito</CardTitle>
          <CardDescription>Detalles completos de la solicitud</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Tipo de Crédito</p>
              <p className="text-lg">{credito.tipo}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Entidad Financiera</p>
              <p className="text-lg">{credito.banco?.nombre || credito.financiera?.nombre}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Cliente</p>
              <p className="text-lg">{credito.cliente?.nombre} {credito.cliente?.apellido}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">DNI Cliente</p>
              <p className="text-lg">{credito.cliente?.dni}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Percent className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Cuota Mensual</p>
              <p className="text-lg">${new Intl.NumberFormat().format(credito.cuota_mensual)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}