import { Menu, Search, UserCheck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar/sidebar"
import { NotificationsPanel, type Notification } from "@/components/notifications-panel/notifications-panel"
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle"
import { ActionModals } from "@/components/action-modals/action-modals" // 🎯 IMPORTAR MODALES
import { useState } from 'react'
import { SearchService, type SearchResult } from '@/services/search.service'
import { useNavigate } from 'react-router'
import { useTheme } from '@/contexts/ThemeContext'

interface HeaderProps {
  activeSection: string
  onSectionChange: (section: string) => void
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRemoveNotification: (id: string) => void
}

export function Header({
  activeSection,
  onSectionChange,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRemoveNotification,
}: HeaderProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const { theme } = useTheme()

  // 🎯 ESTADOS PARA LOS MODALES
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    type: "cliente" | "credito" | null
    action: "view" | "edit" | "delete" | null
    data: any
  }>({
    isOpen: false,
    type: null,
    action: null,
    data: null
  })

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      setResults([])
      return
    }
    try {
      const searchResults = await SearchService.search(value)
      setResults(searchResults)
      console.log('Resultados de búsqueda:', searchResults) // 🎯 DEBUG: Ver qué datos llegan
    } catch (error) {
      console.error('Error en la búsqueda:', error)
    }
  }

  // 🎯 USAR LOS DATOS REALES DEL RESULT
  const handleSelect = (result: SearchResult) => {
    console.log('Datos completos del resultado seleccionado:', result) // 🎯 DEBUG: Ver todos los datos
    
    // Cerrar búsqueda
    setResults([])
    setIsSearching(false)

    // 🎯 USAR DIRECTAMENTE LOS DATOS DEL RESULT
    setModalState({
      isOpen: true,
      type: result.type as "cliente" | "credito",
      action: "view",
      data: result // 🎯 USAR DIRECTAMENTE EL RESULT COMPLETO
    })
  }

  // 🎯 FUNCIÓN PARA CERRAR MODAL
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      action: null,
      data: null
    })
  }

  // 🎯 FUNCIONES DUMMY PARA EL MODAL
  const handleSave = (data: any) => {
    console.log('Guardar datos:', data)
    handleCloseModal()
  }

  const handleDelete = () => {
    console.log('Eliminar elemento')
    handleCloseModal()
  }

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
          </SheetContent>
        </Sheet>
        
        <div className="w-full flex-1 relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar clientes, créditos..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              onChange={handleSearch}
              onFocus={() => setIsSearching(true)}
              onBlur={() => setTimeout(() => setIsSearching(false), 200)}
            />
          </div>

          {isSearching && results.length > 0 && (
            <div className="absolute top-full mt-1 w-full md:w-2/3 lg:w-1/3 bg-background rounded-md border shadow-lg overflow-hidden z-50">
              {results.filter(result => result.type === 'cliente').length > 0 && (
                <div className="p-2">
                  <div className="text-sm font-medium text-muted-foreground px-2 py-1">Clientes</div>
                  {results
                    .filter(result => result.type === 'cliente')
                    .map(result => (
                      <div
                        key={result.id}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted cursor-pointer rounded-sm transition-colors"
                        onClick={() => handleSelect(result)}
                      >
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{result.title}</div>
                          <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          👁️ Ver
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {results.filter(result => result.type === 'credito').length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-sm font-medium text-muted-foreground px-2 py-1">Créditos</div>
                  {results
                    .filter(result => result.type === 'credito')
                    .map(result => (
                      <div
                        key={result.id}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted cursor-pointer rounded-sm transition-colors"
                        onClick={() => handleSelect(result)}
                      >
                        <CreditCard className="h-4 w-4 text-green-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{result.title}</div>
                          <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          👁️ Ver
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden md:block">
            Tema: {theme}
          </span>
          <ThemeToggle />
          <NotificationsPanel
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onRemoveNotification={onRemoveNotification}
          />
        </div>
      </header>

      {/* 🎯 MODAL PARA MOSTRAR DETALLES CON DATOS REALES */}
      {modalState.type && (
        <ActionModals
          type={modalState.type}
          action={modalState.action}
          data={modalState.data} // 🎯 DATOS REALES DEL RESULT
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}

