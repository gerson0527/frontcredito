import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableFilter } from "@/components/table-filter/table-filter"
import { TableActions } from "@/components/table-actions/table-actions"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { useToast } from "@/hooks/use-toast"
import { ActionModals } from "@/components/action-modals/action-modals"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { AddModal } from "@/components/add-modals/add-modals"
import { ClienteService, type Cliente } from '@/services/cliente.service'
import { Upload, Download, FileSpreadsheet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS
import { PermissionGuard } from "@/components/permission-guard/permission-guard" // 🎯 IMPORTAR GUARD

const filterOptions = [
  {
    key: "estado",
    label: "Estado",
    options: [
      { label: "Activo", value: "Activo" },
      { label: "Pendiente", value: "Pendiente" },
      { label: "Inactivo", value: "Inactivo" },
    ],
  },
  {
    key: "creditosActivos",
    label: "Créditos Activos",
    options: [
      { label: "Sin créditos", value: "0" },
      { label: "1 crédito", value: "1" },
      { label: "2 o más", value: "2+" },
    ],
  },
]

interface ClientesContentProps {
  onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
}

interface ClienteWithVariant extends Cliente {
  estadoVariant: "default" | "destructive" | "secondary"
  creditosActivos?: number
}

export function ClientesContent({ onAddNotification }: ClientesContentProps) {
  const [clientesData, setClientesData] = useState<ClienteWithVariant[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: "view" | "edit" | "delete" | null
    data: any
  }>({
    isOpen: false,
    action: null,
    data: null,
  })
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const { toast } = useToast()
  
  // 🎯 USAR HOOK DE PERMISOS
  const { canViewModule, canCreateModule, canEditModule, canDeleteFromModule } = usePermissions()

  // 🎯 VERIFICAR ACCESO AL MÓDULO
  if (!canViewModule('clientes')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para ver el módulo de clientes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Generar estadoVariant basado en el estado
  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case "Activo":
        return "default" as const
      case "Inactivo":
        return "destructive" as const
      default:
        return "secondary" as const
    }
  }

  // Filtrar datos
  const filteredData = clientesData.filter((cliente) => {
    // Filtro de búsqueda
    if (
      filters.search &&
      !cliente.nombre.toLowerCase().includes(filters.search.toLowerCase()) &&
      !cliente.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Filtro de estado
    if (filters.estado && cliente.estado !== filters.estado) {
      return false
    }

    // Filtro de créditos activos
    if (filters.creditosActivos) {
      const creditosActivos = cliente.creditosActivos || 0
      if (filters.creditosActivos === "0" && creditosActivos !== 0) return false
      if (filters.creditosActivos === "1" && creditosActivos !== 1) return false
      if (filters.creditosActivos === "2+" && creditosActivos < 2) return false
    }

    return true
  })

  // Paginación
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handlers para acciones
  const handleViewCliente = (cliente: any) => {
    setModalState({ isOpen: true, action: "view", data: cliente })
  }

  const handleEditCliente = (cliente: any) => {
    setModalState({ isOpen: true, action: "edit", data: cliente })
  }

  const handleDeleteCliente = (cliente: any) => {
    setModalState({ isOpen: true, action: "delete", data: cliente })
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await ClienteService.getClientes()
        setClientesData(data.map(cliente => ({
          ...cliente,
          estadoVariant: getEstadoVariant(cliente.estado)
        })))
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      }
    }
    loadClientes()
  }, [])

  const handleSaveCliente = async (data: any) => {
    try {
      const updatedCliente = await ClienteService.updateCliente(data.id, data)
      setClientesData(prev =>
        prev.map(cliente =>
          cliente.id === data.id
            ? { ...updatedCliente, estadoVariant: getEstadoVariant(updatedCliente.estado) }
            : cliente
        )
      )

      toast({
        title: "Cliente actualizado",
        description: `Los datos de ${data.nombre} han sido actualizados correctamente.`,
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Cliente actualizado",
        description: `Se actualizó la información de ${data.nombre}`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      const clienteName = modalState.data?.nombre
      const clienteId = modalState.data?.id

      await ClienteService.deleteCliente(clienteId)
      setClientesData(prev => prev.filter(cliente => cliente.id !== clienteId))

      toast({
        title: "Cliente eliminado",
        description: `${clienteName} ha sido eliminado del sistema.`,
        variant: "destructive",
      })

      onAddNotification({
        type: "warning",
        title: "Cliente eliminado",
        description: `Se eliminó a ${clienteName} del sistema`,
        read: false,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    }
  }

  const handleAddCliente = async (data: any) => {
    try {
      const newCliente = await ClienteService.createCliente({
        nombre: data.nombre,
        apellido: data.apellido, // Cambiar de Apellido a apellido
        email: data.email,
        dni: data.dni,
        telefono: data.telefono,
        direccion: data.direccion,
        fechanacimiento: data.fechanacimiento,
        ingresosMensuales: parseFloat(data.ingresos), // Cambiar de ingresos a ingresosMensuales
        estado: data.estado,
      })
      setClientesData(prev => [
        { ...newCliente, estadoVariant: getEstadoVariant(newCliente.estado) },
        ...prev
      ])

      toast({
        title: "Cliente agregado",
        description: `${data.nombre} ha sido agregado al sistema correctamente.`,
        variant: "success",
      })

      onAddNotification({
        type: "success",
        title: "Nuevo cliente agregado",
        description: `Se registró a ${data.nombre} en el sistema`,
        read: false,
      })
    } catch (error) {
      console.error(error)  // Agrega esta línea para imprimir el error en la consola
      toast({
        title: "Error",
        description: "No se pudo agregar el cliente",
        variant: "destructive",
      })
    }
  }

  // Función para descargar template
  const handleDownloadTemplate = async () => {
    try {
      const blob = await ClienteService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'template_clientes.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Template descargado",
        description: "El archivo template ha sido descargado correctamente.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descargar el template",
        variant: "destructive",
      })
    }
  }

  // Función para manejar la selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar que sea un archivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ]
      
      if (validTypes.includes(file.type)) {
        setSelectedFile(file)
      } else {
        toast({
          title: "Archivo inválido",
          description: "Por favor selecciona un archivo Excel (.xlsx o .xls)",
          variant: "destructive",
        })
        event.target.value = ''
      }
    }
  }

  // Función para subir el archivo Excel
  const handleUploadExcel = async () => {
    if (!selectedFile) {
      toast({
        title: "No hay archivo",
        description: "Por favor selecciona un archivo Excel primero",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const result = await ClienteService.uploadExcel(selectedFile)
      
      // Recargar la lista de clientes
      const data = await ClienteService.getClientes()
      setClientesData(data.map(cliente => ({
        ...cliente,
        estadoVariant: getEstadoVariant(cliente.estado)
      })))

      // Mostrar resultados
      const { exitosos, errores, total } = result.resultados
      
      // Crear mensaje detallado
      let mensaje = `Total procesados: ${total}`
      if (exitosos.length > 0) {
        mensaje += `\n✅ Exitosos: ${exitosos.length}`
      }
      if (errores.length > 0) {
        mensaje += `\n❌ Con errores: ${errores.length}`
        // Mostrar primeros 3 errores
        const primerosErrores = errores.slice(0, 3)
        mensaje += '\n\nPrimeros errores:'
        primerosErrores.forEach((error: any) => {
          mensaje += `\n• Fila ${error.fila}: ${error.error}`
        })
        if (errores.length > 3) {
          mensaje += `\n... y ${errores.length - 3} errores más`
        }
      }
      
      toast({
        title: "Carga completada",
        description: mensaje,
        variant: exitosos.length > 0 ? "success" : "destructive",
      })

      onAddNotification({
        type: exitosos.length > 0 ? "success" : "warning",
        title: "Carga masiva completada",
        description: `${exitosos.length} clientes agregados, ${errores.length} errores`,
        read: false,
      })

      // Limpiar archivo seleccionado
      setSelectedFile(null)
      setUploadModalOpen(false)
      
      // Si hay errores, mostrarlos en consola para debugging
      if (errores.length > 0) {
        console.log("Errores detallados en la carga:", errores)
      }

    } catch (error) {
      toast({
        title: "Error en la carga",
        description: "No se pudo procesar el archivo Excel. Verifica que el formato sea correcto.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Template
          </Button>
          {canCreateModule('clientes') && (
            <Button 
              variant="outline" 
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Cargar Excel
            </Button>
          )}
          {canCreateModule('clientes') && (
            <Button onClick={() => setAddModalOpen(true)}>Nuevo Cliente</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Administra la información de tus clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableFilter
            onFilterChange={setFilters}
            filterOptions={filterOptions}
            placeholder="Buscar por nombre o email..."
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Identificacion</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell className="font-medium">{cliente.apellido}</TableCell>
                      <TableCell className="font-medium">{cliente.dni}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefono}</TableCell>
                      <TableCell>
                        <Badge variant={cliente.estadoVariant}>{cliente.estado}</Badge>
                      </TableCell>
                      <TableCell>
                        <TableActions
                          row={cliente}
                          onView={handleViewCliente}
                          onEdit={canEditModule('clientes') ? handleEditCliente : undefined}
                          onDelete={canDeleteFromModule('clientes') ? handleDeleteCliente : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

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
        </CardContent>
      </Card>

      <ActionModals
        type="cliente"
        action={modalState.action}
        data={modalState.data}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, data: null })}
        onSave={handleSaveCliente}
        onDelete={handleDeleteConfirm}
      />

      <AddModal type="cliente" isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddCliente} />

      {/* Modal para carga de Excel */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Cargar Clientes desde Excel
              </CardTitle>
              <CardDescription>
                Selecciona un archivo Excel para cargar múltiples clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Archivo Excel</label>
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={uploading}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Instrucciones:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Descarga el template primero</li>
                  <li>Llena los datos de los clientes</li>
                  <li>Guarda el archivo y súbelo aquí</li>
                </ul>
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadModalOpen(false)
                    setSelectedFile(null)
                  }}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUploadExcel}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? "Subiendo..." : "Subir Archivo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
