import type React from "react"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FilterOption {
  label: string
  value: string
}

interface TableFilterProps {
  onFilterChange: (filters: Record<string, string>) => void
  filterOptions: {
    key: string
    label: string
    options: FilterOption[]
  }[]
  placeholder?: string
}

export function TableFilter({ onFilterChange, filterOptions, placeholder = "Buscar..." }: TableFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onFilterChange({ ...activeFilters, search: value })
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFilterChange({ ...newFilters, search: searchTerm })
  }

  const clearFilter = (key: string) => {
    const { [key]: _, ...rest } = activeFilters
    setActiveFilters(rest)
    onFilterChange({ ...rest, search: searchTerm })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchTerm("")
    onFilterChange({})
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            className="w-full pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filtrar</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <h4 className="font-medium">Filtros</h4>
              {filterOptions.map((option) => (
                <div key={option.key} className="space-y-2">
                  <label className="text-sm font-medium">{option.label}</label>
                  <Select
                    value={activeFilters[option.key] || ""}
                    onValueChange={(value) => handleFilterChange(option.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {option.options.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {Object.keys(activeFilters).length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="w-full">
                  Limpiar filtros
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filterOption = filterOptions.find((option) => option.key === key)
            const optionLabel = filterOption?.options.find((opt) => opt.value === value)?.label || value

            return (
              <div key={key} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                <span>
                  {filterOption?.label}: {optionLabel}
                </span>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => clearFilter(key)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
