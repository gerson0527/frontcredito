"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableFilter } from "@/components/table-filter/table-filter"
import { TableActions } from "@/components/table-actions/table-actions"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { ActionModals } from "@/components/action-modals/action-modals"
import { AddModal } from "@/components/add-modals/add-modals"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { useEffect } from "react"
import { CreditoService, type Credito } from "@/services/credito.service"
import { Upload, Download, FileSpreadsheet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS
import { PermissionGuard } from "@/components/permission-guard/permission-guard" // 🎯 IMPORTAR GUARD
  
  const filterOptions = [
    {
      key: "estado",
      label: "Estado",
      options: [
        { label: "Pendiente", value: "Pendiente" },
        { label: "En Revisión", value: "En Revisión" },
        { label: "Aprobado", value: "Aprobado" },
        { label: "Desembolsado", value: "Desembolsado" },
        { label: "Activo", value: "Activo" },
        { label: "Rechazado", value: "Rechazado" },
        { label: "Documentos Pendientes", value: "Documentos Pendientes" },
      ],
    },
    {
      key: "tipo",
      label: "Tipo de Crédito",
      options: [
        { label: "Personal", value: "Personal" },
        { label: "Vehicular", value: "Vehicular" },
        { label: "Hipotecario", value: "Hipotecario" },
        { label: "Empresarial", value: "Empresarial" },
        { label: "Microcrédito", value: "Microcrédito" },
      ],
    },
    {
      key: "banco",
      label: "Banco/Financiera",
      options: [
        { label: "Banco Nacional", value: "Banco Nacional" },
        { label: "Banco Popular", value: "Banco Popular" },
        { label: "Banco Internacional", value: "Banco Internacional" },
        { label: "Banco Regional", value: "Banco Regional" },
        { label: "Financiera ABC", value: "Financiera ABC" },
        { label: "Hogar Financiera", value: "Hogar Financiera" },
        { label: "MicroFinanzas Plus", value: "MicroFinanzas Plus" },
        { label: "Financiera Rápida", value: "Financiera Rápida" },
      ],
    },
    {
      key: "asesor",
      label: "Asesor",
      options: [
        { label: "Ana Rodríguez", value: "Ana Rodríguez" },
        { label: "Carlos Mendoza", value: "Carlos Mendoza" },
        { label: "Roberto Silva", value: "Roberto Silva" },
        { label: "Laura Martínez", value: "Laura Martínez" },
        { label: "Patricia Gómez", value: "Patricia Gómez" },
      ],
    },
    {
      key: "rangoMonto",
      label: "Rango de Monto",
      options: [
        { label: "Hasta $25K", value: "bajo" },
        { label: "$25K - $75K", value: "medio" },
        { label: "$75K - $150K", value: "alto" },
        { label: "Más de $150K", value: "premium" },
      ],
    },
  ]
  
  interface CreditosContentProps {
    onAddNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  }
    export function CreditosContent({ onAddNotification }: CreditosContentProps) {
    // 🎯 USAR HOOK DE PERMISOS
    const { canViewModule, canCreateModule, canEditModule, canDeleteFromModule } = usePermissions()

    // 🎯 VERIFICAR ACCESO AL MÓDULO
    if (!canViewModule('creditos')) {
      return (
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Acceso Denegado</CardTitle>
              <CardDescription>
                No tienes permisos para ver el módulo de créditos.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )
    }

  // 🎯 VERIFICAR ACCESO AL MÓDULO
  if (!canViewModule('creditos')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para ver el módulo de créditos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
    
    const [creditosData, setCreditosData] = useState<Credito[]>([])
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [loading, setLoading] = useState(false)
    const [modalState, setModalState] = useState<{
      isOpen: boolean
      action: "view" | "edit" | "delete" | null
      data: Credito | null
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
  
    // Generar estadoVariant basado en el estado
    const getEstadoVariant = (estado: string) => {
      switch (estado) {
        case "Aprobado":
        case "Desembolsado":
        case "Activo":
          return "default" as const
        case "Rechazado":
          return "destructive" as const
        default:
          return "secondary" as const
      }
    }
  
    // Filtrar datos
    const filteredData = creditosData.filter((credito) => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const clienteNombre = credito.cliente ? `${credito.cliente.nombre} ${credito.cliente.apellido}`.toLowerCase() : ''
        const bancoNombre = credito.banco ? credito.banco.nombre.toLowerCase() : ''
        const financieraNombre = credito.financiera ? credito.financiera.nombre.toLowerCase() : ''
        const creditoId = credito.id ? credito.id.toLowerCase() : ''

        if (!clienteNombre.includes(searchTerm) &&
            !creditoId.includes(searchTerm) &&
            !bancoNombre.includes(searchTerm) &&
            !financieraNombre.includes(searchTerm)) {
          return false
        }
      }

      // Filtro de estado
      if (filters.estado && credito.estado !== filters.estado) {
        return false
      }

      // Filtro de tipo
      if (filters.tipo && credito.tipo !== filters.tipo) {
        return false
      }

      // Filtro de banco/financiera
      if (filters.banco) {
        const entidadNombre = (credito.banco ? credito.banco.nombre : '') || (credito.financiera ? credito.financiera.nombre : '')
        if (entidadNombre !== filters.banco) {
          return false
        }
      }

      // Filtro de asesor
      if (filters.asesor && (!credito.asesor || credito.asesor.nombre !== filters.asesor)) {
        return false
      }

      // Filtro de rango de monto
      if (filters.rangoMonto) {
        const monto = typeof credito.monto === 'string' ? parseFloat(credito.monto) : credito.monto
        if (filters.rangoMonto === "bajo" && monto > 25000) return false
        if (filters.rangoMonto === "medio" && (monto <= 25000 || monto > 75000)) return false
        if (filters.rangoMonto === "alto" && (monto <= 75000 || monto > 150000)) return false
        if (filters.rangoMonto === "premium" && monto <= 150000) return false
      }

      return true
    })
  
    // Paginación
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  
    // Formatear monto
    const formatearMonto = (monto: number) => {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
      }).format(monto)
    }
  
    // Generar nuevo ID
    const generateNewId = () => {
      const maxId = Math.max(...creditosData.map((c) => c.id ? Number.parseInt(c.id.split("-")[1]) : 0))
      return `CR-${String(maxId + 1).padStart(3, "0")}`
    }
  
    // Handlers para acciones
    const handleViewCredito = (credito: Credito) => {
      setModalState({ isOpen: true, action: "view", data: credito })
    }
  
    const handleEditCredito = (credito: Credito) => {
      setModalState({ isOpen: true, action: "edit", data: credito })
    }
  
    const handleDeleteCredito = (credito: Credito) => {
      setModalState({ isOpen: true, action: "delete", data: credito })
    }
  
    useEffect(() => {
      loadCreditos()
    }, [])
  
    const loadCreditos = async () => {
      try {
        setLoading(true)
        const data = await CreditoService.getCreditos()
        setCreditosData(data.map(credito => ({
          ...credito,
          estadoVariant: getEstadoVariant(credito.estado)
        })))
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los créditos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
  
    const handleSaveCredito = async (data: Partial<Credito>) => {
      try {
        let updatedCredito
        if (data.id) {
          updatedCredito = await CreditoService.updateCredito(data.id, data)
        } else {
          updatedCredito = await CreditoService.createCredito(data as Omit<Credito, 'id'>)
        }
  
        await loadCreditos()
  
        toast({
          title: "Crédito actualizado",
          description: `El crédito ${updatedCredito.id} ha sido actualizado correctamente.`,
          variant: "success",
        })
  
        onAddNotification({
          type: "success",
          title: "Crédito actualizado",
          description: `Se actualizó el crédito ${updatedCredito.id}`,
          read: false,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al guardar el crédito",
          variant: "destructive",
        })
      }
    }
  
    const handleDeleteConfirm = async () => {
      if (!modalState.data?.id) return
  
      try {
        await CreditoService.deleteCredito(modalState.data.id)
        await loadCreditos()
  
        toast({
          title: "Crédito eliminado",
          description: `El crédito ${modalState.data.id} ha sido eliminado del sistema.`,
          variant: "destructive",
        })
  
        onAddNotification({
          type: "warning",
          title: "Crédito eliminado",
          description: `Se eliminó el crédito ${modalState.data.id}`,
          read: false,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al eliminar el crédito",
          variant: "destructive",
        })
      }
    }
  
    const handleAddCredito = async (data: Omit<Credito, 'id'>) => {
      try {
        const newCredito = await CreditoService.createCredito(data)
        await loadCreditos()

        toast({
          title: "Crédito creado",
          description: `Se ha creado el crédito ${newCredito.id} correctamente.`,
          variant: "success",
        })

        onAddNotification({
          type: "success",
          title: "Nuevo crédito creado",
          description: `Se registró el crédito ${newCredito.id}`,
          read: false,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al crear el crédito",
          variant: "destructive",
        })
      }
    }

    // Función para descargar template
    const handleDownloadTemplate = async () => {
      try {
        const blob = await CreditoService.downloadTemplate()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'template_creditos.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Template descargado",
          description: "El archivo template de créditos ha sido descargado correctamente.",
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
        const result = await CreditoService.uploadExcel(selectedFile)
        
        // Recargar la lista de créditos
        await loadCreditos()

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
          title: "Carga masiva de créditos completada",
          description: `${exitosos.length} créditos agregados, ${errores.length} errores`,
          read: false,
        })

        // Limpiar archivo seleccionado
        setSelectedFile(null)
        setUploadModalOpen(false)
        
        // Si hay errores, mostrarlos en consola para debugging
        if (errores.length > 0) {
          console.log("Errores detallados en la carga de créditos:", errores)
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
          <h2 className="text-2xl font-bold">Gestión de Créditos</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar Template
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Cargar Excel
            </Button>
            {canCreateModule('creditos') && (
              <Button onClick={() => setAddModalOpen(true)}>Nuevo Crédito</Button>
            )}
          </div>
        </div>
  
        {/* Resumen de Estados */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{creditosData.length}</div>
              <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {creditosData.filter((c) => c.estado === "Activo" || c.estado === "Desembolsado").length}
              </div>
              <p className="text-xs text-muted-foreground">Créditos vigentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {
                  creditosData.filter(
                    (c) => c.estado === "Pendiente" || c.estado === "En Revisión" || c.estado === "Documentos Pendientes",
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Pendientes de aprobación</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatearMonto(creditosData.reduce((sum, c) => {
                  const monto = typeof c.monto === 'string' ? parseFloat(c.monto) : c.monto
                  return sum + monto
                }, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Valor total de cartera</p>
            </CardContent>
          </Card>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Lista de Créditos</CardTitle>
            <CardDescription>Administra todos los créditos del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TableFilter
              onFilterChange={setFilters}
              filterOptions={filterOptions}
              placeholder="Buscar por ID, cliente o banco..."
            />
  
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Banco/Financiera</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tasa</TableHead>
                    <TableHead className="w-[80px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((credito) => (
                      <TableRow key={credito.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{credito.id}</TableCell>
                        <TableCell>{credito.cliente ? `${credito.cliente.nombre} ${credito.cliente.apellido}` : 'N/A'}</TableCell>
                        <TableCell>{formatearMonto(typeof credito.monto === 'string' ? parseFloat(credito.monto) : credito.monto)}</TableCell>
                        <TableCell>{credito.banco ? credito.banco.nombre : (credito.financiera ? credito.financiera.nombre : 'N/A')}</TableCell>
                        <TableCell>{credito.asesor ? credito.asesor.nombre : 'N/A'}</TableCell>
                        <TableCell>{credito.tipo}</TableCell>
                        <TableCell>
                          <Badge variant={credito.estadoVariant}>{credito.estado}</Badge>
                        </TableCell>
                        <TableCell>{credito.tasa}</TableCell>
                        <TableCell>
                          <TableActions
                            row={credito}
                            onView={handleViewCredito}
                            onEdit={canEditModule('creditos') ? handleEditCredito : undefined}
                            onDelete={canDeleteFromModule('creditos') ? handleDeleteCredito : undefined}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
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
          type="credito"
          action={modalState.action}
          data={modalState.data}
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, action: null, data: null })}
          onSave={handleSaveCredito}
          onDelete={handleDeleteConfirm}
        />
  
        <AddModal type="credito" isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddCredito} />

        {/* Modal para carga de Excel */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Cargar Créditos desde Excel
                </CardTitle>
                <CardDescription>
                  Selecciona un archivo Excel para cargar múltiples créditos
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
                  <p className="font-medium mb-2">Instrucciones:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Descarga el template primero</li>
                    <li>Llena los datos de los créditos</li>
                    <li>Asegúrate de que los clientes, asesores, bancos y financieras existan</li>
                    <li>Usa solo banco O financiera, no ambos</li>
                    <li>Guarda el archivo y súbelo aquí</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                  <p className="font-medium text-amber-800 mb-1">⚠️ Importante:</p>
                  <p className="text-amber-700">
                    El sistema validará que existan los clientes (por DNI), asesores, bancos y financieras antes de crear los créditos.
                  </p>
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
