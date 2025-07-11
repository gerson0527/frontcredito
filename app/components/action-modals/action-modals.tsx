import { useState,useEffect } from "react"
import { Eye, Edit, Trash, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ActionModalsProps {
  type: "cliente" | "banco" | "asesor" | "financiera_edit" | "credito" | "objetivo"
  action: "view" | "edit" | "delete" | null
  data: any
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  onDelete: () => void
}

export function ActionModals({ type, action, data, isOpen, onClose, onSave, onDelete }: ActionModalsProps) {
  const [editData, setEditData] = useState({})

  // 🎯 FUNCIÓN PARA FORMATEAR FECHAS
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    
    try {
      const date = new Date(dateString)
      // Verificar si es una fecha válida
      if (isNaN(date.getTime())) return ''
      
      // Formatear para input date (YYYY-MM-DD)
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }

  // 🎯 FUNCIÓN PARA PROCESAR DATOS DE CRÉDITO
  const processEditData = (rawData: any) => {
    if (!rawData || type !== 'credito') return { ...rawData }

    console.log('Datos originales del crédito:', rawData)

    const processedData = {
      ...rawData,
      // 🎯 PROCESAR CLIENTE
      cliente: rawData.cliente 
        ? (typeof rawData.cliente === 'string' 
            ? rawData.cliente 
            : `${rawData.cliente.nombre || ''} ${rawData.cliente.apellido || ''}`.trim())
        : '',
      
      // 🎯 PROCESAR BANCO/FINANCIERA
      banco: rawData.banco 
        ? (typeof rawData.banco === 'string' 
            ? rawData.banco 
            : rawData.banco.nombre || '')
        : (rawData.financiera 
            ? (typeof rawData.financiera === 'string' 
                ? rawData.financiera 
                : rawData.financiera.nombre || '')
            : ''),
      
      // 🎯 PROCESAR ASESOR
      asesor: rawData.asesor 
        ? (typeof rawData.asesor === 'string' 
            ? rawData.asesor 
            : rawData.asesor.nombre || '')
        : '',
      
      // 🎯 PROCESAR FECHAS
      fechaSolicitud: formatDateForInput(rawData.fechaSolicitud),
      fechaAprobacion: formatDateForInput(rawData.fechaAprobacion),
      fechaVencimiento: formatDateForInput(rawData.fechaVencimiento),
      
      // 🎯 PROCESAR MONTO
      monto: rawData.monto 
        ? (typeof rawData.monto === 'string' 
            ? parseFloat(rawData.monto) 
            : rawData.monto)
        : '',
      
      // 🎯 PROCESAR PLAZO
      plazo: rawData.plazo 
        ? (typeof rawData.plazo === 'string' 
            ? parseInt(rawData.plazo) 
            : rawData.plazo)
        : '',
      
      // 🎯 ASEGURAR QUE OTROS CAMPOS SEAN STRINGS
      tipo: rawData.tipo || '',
      estado: rawData.estado || '',
      tasa: rawData.tasa || '',
      garantia: rawData.garantia || '',
      observaciones: rawData.observaciones || ''
    }

    console.log('Datos procesados para edición:', processedData)
    return processedData
  }

  // 🎯 ACTUALIZAR editData cuando cambie data o se abra el modal
  useEffect(() => {
    if (isOpen && data) {
      if (type === 'credito') {
        const processedData = processEditData(data)
        setEditData(processedData)
      } else {
        setEditData({ ...data })
      }
    }
  }, [isOpen, data, type])

  const handleSave = () => {
    console.log('Guardando datos:', editData)
    onSave(editData)
    onClose()
  }

  const handleDelete = () => {
    onDelete()
    onClose()
  }

  const handleClose = () => {
    setEditData({})
    onClose()
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(monto)
  }

  const formatearComision = (comision: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(comision)
  }

  const renderViewContent = () => {
    switch (type) {
      case "cliente":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nombre</Label>
                <p className="text-sm text-muted-foreground">{data?.nombre}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Apellido</Label>
                <p className="text-sm text-muted-foreground">{data?.apellido}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">DNI</Label>
                <p className="text-sm text-muted-foreground">{data?.dni}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{data?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Teléfono</Label>
                <p className="text-sm text-muted-foreground">{data?.telefono}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <p className="text-sm text-muted-foreground">{data?.estado}</p>
              </div>
            </div>
          </div>
        )
      case "banco":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Banco</Label>
                <p className="text-sm text-muted-foreground">{data?.nombre}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <p className="text-sm text-muted-foreground">{data?.tipo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Persona de Contacto</Label>
                <p className="text-sm text-muted-foreground">{data?.personaContacto}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Teléfono</Label>
                <p className="text-sm text-muted-foreground">{data?.telefono}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{data?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tasa Base</Label>
                <p className="text-sm text-muted-foreground">{data?.tasaBase}%</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Comisión por Millón</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.comisionban ? formatearComision(Number(data.comisionban)) : 'No definida'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <p className="text-sm text-muted-foreground">{data?.estado ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Dirección</Label>
              <p className="text-sm text-muted-foreground">{data?.direccion}</p>
            </div>
          </div>
        )
      case "credito":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">ID del Crédito</Label>
                <p className="text-sm text-muted-foreground">{data?.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Cliente</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.cliente 
                    ? (typeof data.cliente === 'string' 
                        ? data.cliente 
                        : `${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim())
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Monto</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.monto ? formatearMonto(typeof data.monto === 'string' ? parseFloat(data.monto) : data.monto) : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Banco/Financiera</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.banco 
                    ? (typeof data.banco === 'string' ? data.banco : data.banco.nombre)
                    : (data?.financiera 
                        ? (typeof data.financiera === 'string' ? data.financiera : data.financiera.nombre)
                        : 'N/A')}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Asesor</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.asesor 
                    ? (typeof data.asesor === 'string' ? data.asesor : data.asesor.nombre)
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <p className="text-sm text-muted-foreground">{data?.tipo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <p className="text-sm text-muted-foreground">{data?.estado}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tasa</Label>
                <p className="text-sm text-muted-foreground">{data?.tasa}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Plazo</Label>
                <p className="text-sm text-muted-foreground">{data?.plazo} meses</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Garantía</Label>
                <p className="text-sm text-muted-foreground">{data?.garantia}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de Solicitud</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.fechaSolicitud ? new Date(data.fechaSolicitud).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de Aprobación</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.fechaAprobacion ? new Date(data.fechaAprobacion).toLocaleDateString() : "Pendiente"}
                </p>
              </div>
            </div>
          </div>
        )
      case "asesor":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nombre</Label>
                <p className="text-sm text-muted-foreground">{data?.nombre}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Cargo</Label>
                <p className="text-sm text-muted-foreground">{data?.cargo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{data?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Teléfono</Label>
                <p className="text-sm text-muted-foreground">{data?.telefono}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Sucursal</Label>
                <p className="text-sm text-muted-foreground">{data?.sucursal}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha de Ingreso</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.fechaIngreso ? new Date(data.fechaIngreso).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Créditos este mes</Label>
                <p className="text-sm text-muted-foreground">{data?.creditos}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Rendimiento</Label>
                <p className="text-sm text-muted-foreground">{data?.rendimiento}</p>
              </div>
            </div>
          </div>
        )
      case "objetivo":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-sm text-muted-foreground">{data?.titulo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <p className="text-sm text-muted-foreground">{data?.tipo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Meta</Label>
                <p className="text-sm text-muted-foreground">{data?.meta}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Actual</Label>
                <p className="text-sm text-muted-foreground">{data?.actual}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Responsable</Label>
                <p className="text-sm text-muted-foreground">{data?.responsable}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Fecha Límite</Label>
                <p className="text-sm text-muted-foreground">
                  {data?.fechaLimite ? new Date(data.fechaLimite).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado</Label>
                <p className="text-sm text-muted-foreground">{data?.estado}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Prioridad</Label>
                <p className="text-sm text-muted-foreground">{data?.prioridad}</p>
              </div>
            </div>
            {data?.descripcion && (
              <div>
                <Label className="text-sm font-medium">Descripción</Label>
                <p className="text-sm text-muted-foreground">{data?.descripcion}</p>
              </div>
            )}
          </div>
        )
      default:
        return <p>Información no disponible</p>
    }
  }

  const renderEditContent = () => {
    switch (type) {
      case "cliente":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={editData.nombre || ""}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={editData.apellido || ""}
                  onChange={(e) => setEditData({ ...editData, apellido: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dni">Identificacion</Label>
                <Input
                  id="dni"
                  value={editData.dni || ""}
                  onChange={(e) => setEditData({ ...editData, dni: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={editData.telefono || ""}
                  onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={editData.direccion || ""}
                  onChange={(e) => setEditData({ ...editData, direccion: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fechanacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechanacimiento"
                  type="date"
                  value={editData.fechanacimiento || ""}
                  onChange={(e) => setEditData({ ...editData, fechanacimiento: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ingresosMensuales">Ingresos Mensuales</Label>
                <Input
                  id="ingresosMensuales"
                  type="number"
                  value={editData.ingresosMensuales || ""}
                  onChange={(e) => setEditData({ ...editData, ingresosMensuales: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={editData.estado || ""}
                  onValueChange={(value) => setEditData({ ...editData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
      case "banco":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del Banco *</Label>
                <Input
                  id="nombre"
                  value={editData.nombre || ""}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={editData.tipo || ""}
                  onValueChange={(value) => setEditData({ ...editData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                    <SelectItem value="Internacional">Internacional</SelectItem>
                    <SelectItem value="Cooperativo">Cooperativo</SelectItem>
                    <SelectItem value="Especializado">Especializado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="personaContacto">Persona de Contacto</Label>
                <Input
                  id="personaContacto"
                  value={editData.personaContacto || ""}
                  onChange={(e) => setEditData({ ...editData, personaContacto: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={editData.telefono || ""}
                  onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tasaBase">Tasa Base (%)</Label>
                <Input
                  id="tasaBase"
                  type="number"
                  step="0.01"
                  value={editData.tasaBase || ""}
                  onChange={(e) => setEditData({ ...editData, tasaBase: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="comisionban">Comisión por Millón (COP) *</Label>
                <Input
                  id="comisionban"
                  type="number"
                  step="1000"
                  placeholder="50000"
                  value={editData.comisionban || ""}
                  onChange={(e) => setEditData({ ...editData, comisionban: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comisión que se paga por cada millón de pesos gestionado
                </p>
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={editData.estado?.toString() || "true"}
                  onValueChange={(value) => setEditData({ ...editData, estado: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={editData.direccion || ""}
                onChange={(e) => setEditData({ ...editData, direccion: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        )
      case "financiera":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Financiera *</Label>
                <Input
                  id="nombre"
                  value={editData.nombre || ""}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="especializacion">Especialización</Label>
                <Select
                  value={editData.especializacion || ""}
                  onValueChange={(value) => setEditData({ ...editData, especializacion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Créditos personales">Créditos personales</SelectItem>
                    <SelectItem value="Microcréditos">Microcréditos</SelectItem>
                    <SelectItem value="Créditos vehiculares">Créditos vehiculares</SelectItem>
                    <SelectItem value="Créditos hipotecarios">Créditos hipotecarios</SelectItem>
                    <SelectItem value="Créditos empresariales">Créditos empresariales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="personaContacto">Persona de Contacto</Label>
                <Input
                  id="personaContacto"
                  value={editData.personaContacto || ""}
                  onChange={(e) => setEditData({ ...editData, personaContacto: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={editData.telefono || ""}
                  onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tasaPromedio">Tasa Promedio (%)</Label>
                <Input
                  id="tasaPromedio"
                  type="number"
                  step="0.01"
                  value={editData.tasaPromedio || ""}
                  onChange={(e) => setEditData({ ...editData, tasaPromedio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="comisionfin">Comisión por Millón (COP) *</Label>
                <Input
                  id="comisionfin"
                  type="number"
                  step="1000"
                  placeholder="45000"
                  value={editData.comisionfin || ""}
                  onChange={(e) => setEditData({ ...editData, comisionfin: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comisión que se paga por cada millón de pesos gestionado
                </p>
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={editData.estado?.toString() || "true"}
                  onValueChange={(value) => setEditData({ ...editData, estado: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activa</SelectItem>
                    <SelectItem value="false">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={editData.descripcion || ""}
                onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        )
      case "financiera_edit":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Financiera</Label>
                <Input
                  id="nombre"
                  value={editData.nombre || ""}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="especializacion">Especialización</Label>
                <Select
                  value={editData.especializacion || ""}
                  onValueChange={(value) => setEditData({ ...editData, especializacion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Créditos personales">Créditos personales</SelectItem>
                    <SelectItem value="Microcréditos">Microcréditos</SelectItem>
                    <SelectItem value="Créditos vehiculares">Créditos vehiculares</SelectItem>
                    <SelectItem value="Créditos hipotecarios">Créditos hipotecarios</SelectItem>
                    <SelectItem value="Créditos empresariales">Créditos empresariales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tasaPromedio">Tasa Promedio</Label>
                <Input
                  id="tasaPromedio"
                  value={editData.tasaPromedio || ""}
                  onChange={(e) => setEditData({ ...editData, tasaPromedio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={editData.estado || ""}
                  onValueChange={(value) => setEditData({ ...editData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activa">Activa</SelectItem>
                    <SelectItem value="Revisión">Revisión</SelectItem>
                    <SelectItem value="Inactiva">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )
      case "credito":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  placeholder="Nombre del cliente"
                  value={editData.cliente || ""}
                  onChange={(e) => setEditData({ ...editData, cliente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monto">Monto solicitado *</Label>
                <Input
                  id="monto"
                  type="number"
                  placeholder="50000"
                  value={editData.monto || ""}
                  onChange={(e) => setEditData({ ...editData, monto: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de crédito *</Label>
                <Select
                  value={editData.tipo || ""}
                  onValueChange={(value) => setEditData({ ...editData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Vehicular">Vehicular</SelectItem>
                    <SelectItem value="Hipotecario">Hipotecario</SelectItem>
                    <SelectItem value="Empresarial">Empresarial</SelectItem>
                    <SelectItem value="Microcrédito">Microcrédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banco">Banco/Financiera *</Label>
                <Select
                  value={editData.banco || ""}
                  onValueChange={(value) => setEditData({ ...editData, banco: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar institución" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Banco Nacional">Banco Nacional</SelectItem>
                    <SelectItem value="Banco Popular">Banco Popular</SelectItem>
                    <SelectItem value="Banco Internacional">Banco Internacional</SelectItem>
                    <SelectItem value="Banco Regional">Banco Regional</SelectItem>
                    <SelectItem value="Financiera ABC">Financiera ABC</SelectItem>
                    <SelectItem value="Hogar Financiera">Hogar Financiera</SelectItem>
                    <SelectItem value="MicroFinanzas Plus">MicroFinanzas Plus</SelectItem>
                    <SelectItem value="Financiera Rápida">Financiera Rápida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asesor">Asesor asignado *</Label>
                <Select
                  value={editData.asesor || ""}
                  onValueChange={(value) => setEditData({ ...editData, asesor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar asesor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ana Rodríguez">Ana Rodríguez</SelectItem>
                    <SelectItem value="Carlos Mendoza">Carlos Mendoza</SelectItem>
                    <SelectItem value="Roberto Silva">Roberto Silva</SelectItem>
                    <SelectItem value="Laura Martínez">Laura Martínez</SelectItem>
                    <SelectItem value="Patricia Gómez">Patricia Gómez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plazo">Plazo (meses) *</Label>
                <Select
                  value={editData.plazo?.toString() || ""}
                  onValueChange={(value) => setEditData({ ...editData, plazo: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                    <SelectItem value="36">36 meses</SelectItem>
                    <SelectItem value="48">48 meses</SelectItem>
                    <SelectItem value="60">60 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasa">Tasa de interés (%)</Label>
                <Input
                  id="tasa"
                  type="text"
                  placeholder="12.5%"
                  value={editData.tasa || ""}
                  onChange={(e) => setEditData({ ...editData, tasa: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="garantia">Tipo de garantía</Label>
                <Select
                  value={editData.garantia || ""}
                  onValueChange={(value) => setEditData({ ...editData, garantia: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar garantía" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nómina">Nómina</SelectItem>
                    <SelectItem value="Aval">Aval</SelectItem>
                    <SelectItem value="Hipotecaria">Hipotecaria</SelectItem>
                    <SelectItem value="Vehículo">Vehículo</SelectItem>
                    <SelectItem value="Inmueble">Inmueble</SelectItem>
                    <SelectItem value="Sin garantía">Sin garantía</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={editData.estado || ""}
                  onValueChange={(value) => setEditData({ ...editData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En Revisión">En Revisión</SelectItem>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Desembolsado">Desembolsado</SelectItem>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
                    <SelectItem value="Documentos Pendientes">Documentos Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaSolicitud">Fecha de solicitud</Label>
                <Input
                  id="fechaSolicitud"
                  type="date"
                  value={editData.fechaSolicitud || ""}
                  onChange={(e) => setEditData({ ...editData, fechaSolicitud: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaAprobacion">Fecha de aprobación</Label>
                <Input
                  id="fechaAprobacion"
                  type="date"
                  value={editData.fechaAprobacion || ""}
                  onChange={(e) => setEditData({ ...editData, fechaAprobacion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
                <Input
                  id="fechaVencimiento"
                  type="date"
                  value={editData.fechaVencimiento || ""}
                  onChange={(e) => setEditData({ ...editData, fechaVencimiento: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas adicionales sobre el crédito..."
                value={editData.observaciones || ""}
                onChange={(e) => setEditData({ ...editData, observaciones: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )
      case "asesor":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  value={editData.nombre || ""}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={editData.telefono || ""}
                  onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Select
                  value={editData.cargo || ""}
                  onValueChange={(value) => setEditData({ ...editData, cargo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asesor Junior">Asesor Junior</SelectItem>
                    <SelectItem value="Asesor">Asesor</SelectItem>
                    <SelectItem value="Asesora">Asesora</SelectItem>
                    <SelectItem value="Asesor Senior">Asesor Senior</SelectItem>
                    <SelectItem value="Asesora Senior">Asesora Senior</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Gerente">Gerente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sucursal">Sucursal</Label>
                <Select
                  value={editData.sucursal || ""}
                  onValueChange={(value) => setEditData({ ...editData, sucursal: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principal">Principal</SelectItem>
                    <SelectItem value="Norte">Norte</SelectItem>
                    <SelectItem value="Sur">Sur</SelectItem>
                    <SelectItem value="Centro">Centro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
                <Input
                  id="fechaIngreso"
                  type="date"
                  value={editData.fechaIngreso || ""}
                  onChange={(e) => setEditData({ ...editData, fechaIngreso: e.target.value })}
                />
              </div>
            </div>
          </div>
        )
      case "objetivo":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título del objetivo</Label>
                <Input
                  id="titulo"
                  value={editData.titulo || ""}
                  onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={editData.tipo || ""}
                  onValueChange={(value) => setEditData({ ...editData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Créditos">Créditos</SelectItem>
                    <SelectItem value="Monto">Monto</SelectItem>
                    <SelectItem value="Clientes">Clientes</SelectItem>
                    <SelectItem value="Tasa">Tasa</SelectItem>
                    <SelectItem value="Comisiones">Comisiones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meta">Meta</Label>
                <Input
                  id="meta"
                  type="number"
                  value={editData.meta || ""}
                  onChange={(e) => setEditData({ ...editData, meta: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="actual">Valor actual</Label>
                <Input
                  id="actual"
                  type="number"
                  value={editData.actual || ""}
                  onChange={(e) => setEditData({ ...editData, actual: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="responsable">Responsable</Label>
                <Select
                  value={editData.responsable || ""}
                  onValueChange={(value) => setEditData({ ...editData, responsable: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipo completo">Equipo completo</SelectItem>
                    <SelectItem value="Ana Rodríguez">Ana Rodríguez</SelectItem>
                    <SelectItem value="Carlos Mendoza">Carlos Mendoza</SelectItem>
                    <SelectItem value="Roberto Silva">Roberto Silva</SelectItem>
                    <SelectItem value="Laura Martínez">Laura Martínez</SelectItem>
                    <SelectItem value="Patricia Gómez">Patricia Gómez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fechaLimite">Fecha límite</Label>
                <Input
                  id="fechaLimite"
                  type="date"
                  value={editData.fechaLimite || ""}
                  onChange={(e) => setEditData({ ...editData, fechaLimite: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={editData.estado || ""}
                  onValueChange={(value) => setEditData({ ...editData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En progreso">En progreso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={editData.prioridad || ""}
                  onValueChange={(value) => setEditData({ ...editData, prioridad: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={editData.descripcion || ""}
                onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        )
      default:
        return <p>Formulario no disponible</p>
    }
  }

  const getTitle = () => {
    const actionText = action === "view" ? "Ver" : action === "edit" ? "Editar" : "Eliminar"
    const typeText =
      {
        cliente: "Cliente",
        banco: "Banco",
        asesor: "Asesor",
        financiera: "Financiera",
        credito: "Crédito",
        objetivo: "Objetivo",
      }[type] || "Registro"
    return `${actionText} ${typeText}`
  }

  const getDescription = () => {
    if (action === "delete") {
      return `¿Estás seguro de que deseas eliminar este ${type}? Esta acción no se puede deshacer.`
    }
    return `${action === "view" ? "Información detallada" : "Modifica la información"} del ${type}.`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === "view" && <Eye className="h-5 w-5" />}
            {action === "edit" && <Edit className="h-5 w-5" />}
            {action === "delete" && <Trash className="h-5 w-5" />}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {action === "view" && renderViewContent()}
        {action === "edit" && renderEditContent()}
        {action === "delete" && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta acción eliminará permanentemente el registro y toda la información asociada.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          {action === "edit" && (
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
          )}
          {action === "delete" && type !== "banco" && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}