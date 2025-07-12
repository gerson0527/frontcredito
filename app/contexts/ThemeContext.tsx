"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from './UserContext'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  originalTheme: Theme // 🎯 TEMA ORIGINAL DE LA BD
  setTheme: (theme: Theme) => void
  resetTheme: () => void // 🎯 RESETEAR AL TEMA ORIGINAL
  hasChanges: boolean // 🎯 SABER SI HAY CAMBIOS PENDIENTES
  updateOriginalTheme: (theme: Theme) => void // 🎯 ACTUALIZAR TEMA ORIGINAL
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser()
  const [theme, setTheme] = useState<Theme>('dark')
  const [originalTheme, setOriginalTheme] = useState<Theme>('dark') // 🎯 TEMA DE LA BD

  // 🎯 APLICAR TEMA VISUAL
  const applyTheme = (newTheme: Theme) => {    
    const html = document.documentElement
    const body = document.body
    
    // Remover clases anteriores
    html.classList.remove('light', 'dark')
    body.classList.remove('light', 'dark')
    
    // Aplicar nueva clase
    html.classList.add(newTheme)
    body.classList.add(newTheme)
    
    html.style.colorScheme = newTheme    
  }

  // 🎯 RESETEAR AL TEMA ORIGINAL
  const resetTheme = () => {
    setTheme(originalTheme)
  }

  // 🎯 VERIFICAR SI HAY CAMBIOS PENDIENTES
  const hasChanges = theme !== originalTheme

  // 🎯 EFECTO PARA CARGAR TEMA ORIGINAL DEL USUARIO
  useEffect(() => {
    
    if (!isLoading) {
      if (user?.theme && (user.theme === 'light' || user.theme === 'dark')) {
        const userTheme = user.theme as Theme
        setOriginalTheme(userTheme) // 🎯 GUARDAR TEMA ORIGINAL
        setTheme(userTheme) // 🎯 APLICAR TEMA ACTUAL
      } else {
        console.log('Usuario sin tema, usando dark por defecto')
        setOriginalTheme('dark')
        setTheme('dark')
      }
    }
  }, [user, isLoading])

  // 🎯 EFECTO PARA APLICAR TEMA VISUAL CUANDO CAMBIE
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // 🎯 FUNCIÓN PARA ACTUALIZAR TEMA ORIGINAL (SOLO CUANDO SE GUARDE EN BD)
  const updateOriginalTheme = (newTheme: Theme) => {
    setOriginalTheme(newTheme)
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      originalTheme,
      setTheme, 
      resetTheme, 
      hasChanges,
      updateOriginalTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // 🎯 MEJOR MANEJO DE ERRORES - Retornar valores por defecto
    console.warn('useTheme debe usarse dentro de ThemeProvider. Usando valores por defecto.')
    return {
      theme: 'dark' as Theme,
      originalTheme: 'dark' as Theme,
      setTheme: (theme: Theme) => {
        console.warn('setTheme llamado fuera de ThemeProvider')
      },
      resetTheme: () => {
        console.warn('resetTheme llamado fuera de ThemeProvider')
      },
      hasChanges: false,
      updateOriginalTheme: () => {
        console.warn('updateOriginalTheme llamado fuera de ThemeProvider')
      }
    }
  }
  return context
}