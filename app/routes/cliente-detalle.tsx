import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Phone, FileText, MapPin } from "lucide-react"
import { ClienteService } from '@/services/cliente.service'
import { useParams } from "react-router"

export default function ClienteDetalle() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        const data = await ClienteService.getClienteById(id);
        setCliente(data);
      } catch (err) {
        setError("Error al cargar los datos del cliente");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCliente();
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

  if (!cliente) return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <span>Cliente no encontrado</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Detalles del Cliente</h2>
      </div>

      {/* Resumen de Información */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-lg">{cliente.estado}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cliente.creditos_activos || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total en Créditos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${new Intl.NumberFormat().format(cliente.total_creditos || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(cliente.updatedAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Datos personales del cliente</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Nombre Completo</p>
              <p className="text-lg">{cliente.nombre} {cliente.apellido}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{cliente.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Teléfono</p>
              <p className="text-lg">{cliente.telefono}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">DNI</p>
              <p className="text-lg">{cliente.dni}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">Dirección</p>
              <p className="text-lg">{cliente.direccion}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}