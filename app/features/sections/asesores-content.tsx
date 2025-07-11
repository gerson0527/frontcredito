
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TableFilter } from "@/components/table-filter/table-filter"
import { TableActions } from "@/components/table-actions/table-actions"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/components/notifications-panel/notifications-panel"
import { AddModal } from "@/components/add-modals/add-modals"
import { ActionModals } from "@/components/action-modals/action-modals"
import { AsesorService, type Asesor } from "@/services/asesores.service"
import { usePermissions } from "@/hooks/use-permissions" // 🎯 IMPORTAR HOOK DE PERMISOS

const filterOptions = [
  {
    key: "cargo",
    label: "Cargo",
    options: [
      { label: "Senior", value: "Senior" },
      { label: "Asesor", value: "Asesor" },
      { label: "Junior", value: "Junior" },
    ],
  },
  {
    key: "rendimiento",
    label: "Rendimiento",
    options: [
      { label: "Alto", value: "Alto" },
      { label: "Medio", value: "Medio" },
      { label: "Bajo", value: "Bajo" },
    ],
  },
  {
    key: "sucursal",
    label: "Sucursal",
    options: [
      { label: "Principal", value: "Principal" },
      { label: "Norte", value: "Norte" },
      { label: "Sur", value: "Sur" },
      { label: "Centro", value: "Centro" },
    ],
  },
]

interface AsesoresContentProps {
  onAddNotification?: (notification: Omit<Notification, "id" | "timestamp">) => void
}

export function AsesoresContent({ onAddNotification }: AsesoresContentProps) {
  const [asesoresData, setAsesoresData] = useState<Asesor[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    action: "view" | "edit" | "delete" | null
    data: Asesor | null
  }>({ isOpen: false, action: null, data: null })
  const [addModalOpen, setAddModalOpen] = useState(false)
  const { toast } = useToast()
  
  // 🎯 USAR HOOK DE PERMISOS
  const { canViewModule, canCreateModule, canEditModule, canDeleteFromModule } = usePermissions()

  // 🎯 VERIFICAR ACCESO AL MÓDULO
  if (!canViewModule('asesores')) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para ver el módulo de asesores.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    loadAsesores()
  }, [])

  const loadAsesores = async () => {
    try {
      const data = await AsesorService.getAsesores()
      setAsesoresData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los asesores",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar datos
  const filteredData = asesoresData.filter((asesor) => {
    // Filtro de búsqueda
    if (filters.search && !asesor.nombre.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Filtro de cargo
    if (filters.cargo) {
      if (filters.cargo === "Senior" && !asesor.cargo.includes("Senior")) return false
      if (filters.cargo === "Asesor" && asesor.cargo !== "Asesor" && asesor.cargo !== "Asesora") return false
      if (filters.cargo === "Junior" && !asesor.cargo.includes("Junior")) return false
    }

    // Filtro de rendimiento
    if (filters.rendimiento && asesor.rendimiento !== filters.rendimiento) {
      return false
    }

    // Filtro de sucursal
    if (filters.sucursal && asesor.sucursal !== filters.sucursal) {
      return false
    }

    return true
  })

  // Generar nuevo ID
  const generateNewId = () => {
    const maxId = Math.max(...asesoresData.map((a) => Number.parseInt(a.id)))
    return (maxId + 1).toString()
  }

  // Handlers para acciones
  const handleViewAsesor = (asesor: any) => {
    setModalState({ isOpen: true, action: "view", data: asesor })
  }

  const handleEditAsesor = (asesor: any) => {
    setModalState({ isOpen: true, action: "edit", data: asesor })
  }

  const handleDeleteAsesor = (asesor: any) => {
    setModalState({ isOpen: true, action: "delete", data: asesor })
  }

  const handleSaveAsesor = async (data: Asesor) => {
    try {
      if (data.id) {
        await AsesorService.updateAsesor(data.id, data)
        setAsesoresData(prev => prev.map(asesor => asesor.id === data.id ? data : asesor))
      }

      toast({
        title: "Asesor actualizado",
        description: `Los datos de ${data.nombre} han sido actualizados correctamente.`,
        variant: "success",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "success",
          title: "Asesor actualizado",
          description: `Se actualizó la información de ${data.nombre}`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el asesor",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!modalState.data?.id) return

    try {
      await AsesorService.deleteAsesor(modalState.data.id)
      setAsesoresData(prev => prev.filter(asesor => asesor.id !== modalState.data?.id))

      toast({
        title: "Asesor eliminado",
        description: `${modalState.data.nombre} ha sido eliminado del sistema.`,
        variant: "destructive",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "warning",
          title: "Asesor eliminado",
          description: `Se eliminó a ${modalState.data.nombre} del equipo`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el asesor",
        variant: "destructive",
      })
    }
  }

  const handleAddAsesor = async (data: Omit<Asesor, 'id'>) => {
    try {
      const newAsesor = await AsesorService.createAsesor({
        ...data,
        creditos: 0,
        tasaAprobacion: 0,
        rendimiento: "Nuevo"
      })

      setAsesoresData(prev => [newAsesor, ...prev])

      toast({
        title: "Asesor agregado",
        description: `${data.nombre} ha sido agregado al equipo correctamente.`,
        variant: "success",
      })

      if (onAddNotification) {
        onAddNotification({
          type: "success",
          title: "Nuevo asesor agregado",
          description: `Se registró a ${data.nombre} en el equipo`,
          read: false,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el asesor",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Equipo de Asesores</h2>
        {canCreateModule('asesores') && (
          <Button onClick={() => setAddModalOpen(true)}>Nuevo Asesor</Button>
        )}
      </div>

      <div className="space-y-4">
        <TableFilter onFilterChange={setFilters} filterOptions={filterOptions} placeholder="Buscar por nombre..." />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((asesor) => (
            <Card key={asesor.id} className="relative">
              <div className="absolute right-2 top-2">
                <TableActions
                  row={asesor}
                  onView={handleViewAsesor}
                  onEdit={canEditModule('asesores') ? handleEditAsesor : undefined}
                  onDelete={canDeleteFromModule('asesores') ? handleDeleteAsesor : undefined}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{asesor.nombre}</CardTitle>
                <CardDescription>{asesor.cargo}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Sucursal:</span>
                    <span className="font-medium">{asesor.sucursal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Créditos este mes:</span>
                    <span className="font-medium">{asesor.creditos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monto gestionado:</span>
                    <span className="font-medium">{asesor.monto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tasa de aprobación:</span>
                    <span className="font-medium">{asesor.tasaAprobacion}%</span>
                  </div>
                  <Progress value={asesor.tasaAprobacion} className="mt-2" />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Rendimiento:</span>
                    <span
                      className={`font-medium ${
                        asesor.rendimiento === "Alto"
                          ? "text-green-600"
                          : asesor.rendimiento === "Medio"
                            ? "text-amber-600"
                            : asesor.rendimiento === "Nuevo"
                              ? "text-blue-600"
                              : "text-red-600"
                      }`}
                    >
                      {asesor.rendimiento}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No se encontraron asesores con los filtros seleccionados.
          </div>
        )}
      </div>

      <ActionModals
        type="asesor"
        action={modalState.action}
        data={modalState.data}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, data: null })}
        onSave={handleSaveAsesor}
        onDelete={handleDeleteConfirm}
      />

      <AddModal type="asesor" isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddAsesor} />
    </div>
  )
}
