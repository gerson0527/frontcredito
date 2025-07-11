"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme, hasChanges } = useTheme()

  // 🎯 SOLO CAMBIAR TEMA VISUAL - NO GUARDAR EN BD
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme) // 🎯 SOLO CAMBIO VISUAL, NO BD
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
          {/* 🎯 INDICADOR DE CAMBIOS PENDIENTES */}
          {hasChanges && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-500 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          ☀️ Claro {theme === 'light' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          🌙 Oscuro {theme === 'dark' && '✓'}
        </DropdownMenuItem>
        {/* 🎯 INFORMACIÓN SOBRE CAMBIOS PENDIENTES */}
        {hasChanges && (
          <div className="px-2 py-1 text-xs text-muted-foreground border-t">
            💡 Ve a Configuración para guardar
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
