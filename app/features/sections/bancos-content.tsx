import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TableFilter } from "@/components/table-filter/table-filter"
import { TableActions } from "@/components/table-actions/table-actions"
import { TablePagination } from "@/components/table-pagination/table-pagination"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { AddModal } from "@/components/add-modals/add-modals"
import { ActionModals } from "@/components/action-modals/action-modals"
import { BancoService, type Banco } from "@/services/banco.service"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS
import { PermissionGuard } from "@/components/permission-guard/permission-guard" // 🎯 IMPORTAR GUARD

const filterOptions = [
  {
    key: "tipo",
    label: "Tipo",
    options: [
      { label: "Banca múltiple", value: "Banca múltiple" },
      { label: "Banca especializada", value: "Banca especializada" },
      { label: "Banca de inversión", value: "Banca de inversión" },
    ],
  },
  {
    key: "estado",
    label: "Estado",
    options: [
      { label: "Activo", value: "Activo" },
      { label: "Inactivo", value: "Inactivo" },
    ],
  },
]

interface BancosContentProps {
  onAddNotification?: (notification: Omit<Notification, "id" | "timestamp">) => void
}

export function BancosContent({ onAddNotification }: BancosContentProps) {
  const [bancosData, setBancosData] = useState<Banco[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: "view" | "edit" | "delete" | null
    data: Banco | null
  }>({
    isOpen: false,
    action: null,
    data: null,
  })
  const [addModalOpen, setAddModalOpen] = useState(false)
  const { toast } = useToast()
  
  // 🎯 USAR HOOK DE PERMISOS
  const { canViewModule, canCreateModule, canEditModule, canDeleteFromModule } = usePermissions()

  // 🎯 VERIFICAR ACCESO AL MÓDULO
  if (!canViewModule('bancos')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para ver el módulo de bancos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    loadBancos()
  }, [])

  const loadBancos = async () => {
    try {
      const data = await BancoService.getBancos()
      setBancosData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los bancos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generar estadoVariant basado en el estado
  const getEstadoVariant = (estado: boolean) => {
    return estado ? "default" as const : "destructive" as const
  }

  // Filtrar datos
  const filteredData = bancosData.filter((banco) => {
    // Filtro de búsqueda
    if (filters.search && !banco.nombre.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Filtro de tipo
    if (filters.tipo && banco.tipo !== filters.tipo) {
      return false
    }

    // Filtro de estado
    if (filters.estado && (banco.estado ? 'Activo' : 'Inactivo') !== filters.estado) {
      return false
    }

    return true
  })

  // Paginación
  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Handlers para acciones
  const handleViewBanco = (banco: Banco) => {
    setModalState({ isOpen: true, action: "view", data: banco })
  }

  const handleEditBanco = (banco: Banco) => {
    setModalState({ isOpen: true, action: "edit", data: banco })
  }

  // Eliminar el handler de eliminación ya que no se usará
  const handleDeleteBanco = (banco: Banco) => {
    setModalState({ isOpen: true, action: "delete", data: banco })
  }

  const handleSaveBanco = async (data: Banco) => {
    try {
      if (data.id) {
        await BancoService.updateBanco(data.id, data)
        setBancosData((prev) =>
          prev.map((banco) => (banco.id === data.id ? { ...data, estadoVariant: getEstadoVariant(data.estado) } : banco))
        )

        toast({
          title: "Banco actualizado",
          description: `Los datos de ${data.nombre} han sido actualizados correctamente.`,
          variant: "success",
        })

        if (onAddNotification) {
          onAddNotification({
            type: "success",
            title: "Banco actualizado",
            description: `Se actualizó la información de ${data.nombre}`,
            read: false,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar el banco",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!modalState.data?.id) return

    try {
      await BancoService.deleteBanco(modalState.data.id)
      const bancoName = modalState.data.nombre

      setBancosData((prev) => prev.filter((banco) => banco.id !== modalState.data?.id))

      toast({
        title: "Banco eliminado",
        description: `${bancoName} ha sido eliminado del sistema.`,
        variant: "destructive",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "warning",
          title: "Banco eliminado",
          description: `Se eliminó a ${bancoName} del sistema`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el banco",
        variant: "destructive",
      })
    }
  }

  const handleAddBanco = async (data: Omit<Banco, 'id'>) => {
    try {
      const newBanco = await BancoService.createBanco({
        ...data,
        estado: true, // Nuevo banco siempre inicia como activo
      })

      setBancosData((prev) => [{ ...newBanco, estadoVariant: getEstadoVariant(newBanco.estado) }, ...prev])

      toast({
        title: "Banco agregado",
        description: `${data.nombre} ha sido agregado como aliado comercial.`,
        variant: "success",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "success",
          title: "Nuevo banco agregado",
          description: `Se registró a ${data.nombre} como aliado comercial`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear el banco",
        variant: "destructive",
      })
    }
  }

  // NUEVA FUNCIÓN: Formatear comisión
  const formatearComision = (comision: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(comision)
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bancos Aliados</h2>
        {canCreateModule('bancos') && (
          <Button onClick={() => setAddModalOpen(true)}>Agregar Banco</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instituciones Bancarias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableFilter onFilterChange={setFilters} filterOptions={filterOptions} placeholder="Buscar por nombre..." />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banco</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Persona Contacto</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tasa Base</TableHead>
                  <TableHead>Comisión/Millón</TableHead> {/* NUEVA COLUMNA */}
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((banco) => (
                    <TableRow key={banco.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{banco.nombre}</TableCell>
                      <TableCell>{banco.tipo}</TableCell>
                      <TableCell>{banco.personaContacto}</TableCell>
                      <TableCell>{banco.telefono}</TableCell>
                      <TableCell>{banco.email}</TableCell>
                      <TableCell>{banco.tasaBase}%</TableCell>
                      <TableCell className="font-medium text-green-600"> {/* NUEVA CELDA */}
                        {banco.comisionban ? formatearComision(Number(banco.comisionban)) : 'No definida'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={banco.estado ? 'default' : 'destructive'}>
                          {banco.estado ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <TableActions
                          row={banco}
                          onView={handleViewBanco}
                          onEdit={canEditModule('bancos') ? handleEditBanco : undefined}
                          onDelete={canDeleteFromModule('bancos') ? handleDeleteBanco : undefined}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center"> {/* ACTUALIZAR COLSPAN */}
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
        type="banco"
        action={modalState.action}
        data={modalState.data}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, data: null })}
        onSave={handleSaveBanco}
        onDelete={handleDeleteConfirm}
      />

      <AddModal type="banco" isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddBanco} />
    </div>
  )
}
