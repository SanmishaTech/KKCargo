"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface ComboboxWithDeleteProps {
  options: { value: string; label: string }[]
  value?: string
  onValueChange?: (value: string) => void
  onDelete?: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  showDelete?: boolean
}

export function ComboboxWithDelete({
  options = [],
  value,
  onValueChange,
  onDelete,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  className,
  disabled = false,
  showDelete = true,
}: ComboboxWithDeleteProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const handleDelete = React.useCallback((optionValue: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete && typeof onDelete === 'function') {
      onDelete(optionValue)
    }
  }, [onDelete])

  const handleSelect = React.useCallback((currentValue: string) => {
    const newValue = currentValue === selectedValue ? "" : currentValue
    setSelectedValue(newValue)
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(newValue)
    }
    setOpen(false)
  }, [selectedValue, onValueChange])

  if (!Array.isArray(options)) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedValue
            ? options.find((option) => option?.value === selectedValue)?.label || placeholder
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '200px' }}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {options.map((option) => {
              if (!option || typeof option.value !== 'string') {
                return null
              }
              return (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center flex-1">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </div>
                  {showDelete && option.value !== "Other" && (
                    <div 
                      className="h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 rounded cursor-pointer ml-2"
                      onClick={(e) => handleDelete(option.value, e)}
                    >
                      <X className="h-3 w-3" />
                    </div>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
