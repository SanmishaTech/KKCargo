"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useGetData } from "@/Components/HTTP/GET"

interface DateFilterProps {
  value?: string // Format: YYYY-MM
  onValueChange?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  companyType?: string
  onCompanyTypeChange?: (value: string) => void
  showCompanyTypeFilter?: boolean
}

export function DateFilter({
  value,
  onValueChange,
  onClear,
  placeholder = "Filter by month/year",
  className,
  companyType,
  onCompanyTypeChange,
  showCompanyTypeFilter = false,
}: DateFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedYear, setSelectedYear] = React.useState<string>("")
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [selectedCompanyType, setSelectedCompanyType] = React.useState<string>(companyType || "all")

  // Fetch company types
  const { data: companyTypesResponse } = useGetData({
    endpoint: '/api/company-types',
    params: {
      queryKey: ['companyTypes'],
      enabled: showCompanyTypeFilter,
    },
  })

  const companyTypes = Array.isArray(companyTypesResponse?.data) ? companyTypesResponse.data : []

  // Extract year and month from value when it changes
  React.useEffect(() => {
    if (value && value.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = value.split('-')
      setSelectedYear(year)
      setSelectedMonth(month)
    } else if (!value) {
      setSelectedYear("")
      setSelectedMonth("")
    }
  }, [value])

  // Update selected company type when prop changes
  React.useEffect(() => {
    setSelectedCompanyType(companyType || "all")
  }, [companyType])

  // Generate years array (current year + 5 years back)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 9 }, (_, i) => (currentYear - i).toString())

  // Months array
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const handleApply = () => {
    if (selectedYear && selectedMonth) {
      const dateValue = `${selectedYear}-${selectedMonth}`
      onValueChange?.(dateValue)
    }
    if (showCompanyTypeFilter) {
      // Send empty string if 'all' is selected to clear the filter
      onCompanyTypeChange?.(selectedCompanyType === 'all' ? '' : selectedCompanyType)
    }
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedYear("")
    setSelectedMonth("")
    setSelectedCompanyType("all")
    onValueChange?.("")
    if (showCompanyTypeFilter) {
      onCompanyTypeChange?.("")
    }
    onClear?.()
    setOpen(false)
  }

  const getDisplayValue = () => {
    const parts = []
    
    if (value && value.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = value.split('-')
      const monthName = months.find(m => m.value === month)?.label
      parts.push(`${monthName} ${year}`)
    }
    
    if (showCompanyTypeFilter && companyType && companyType !== 'all') {
      parts.push(`Type: ${companyType}`)
    }
    
    return parts.length > 0 ? parts.join(' | ') : placeholder
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Year & Month selectors in two columns */}
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

             
            </div>

            {showCompanyTypeFilter && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Type</label>
                <Select value={selectedCompanyType} onValueChange={setSelectedCompanyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {companyTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
                disabled={showCompanyTypeFilter ? false : (!selectedYear || !selectedMonth)}
                className="flex-1"
              >
                Apply Filter
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
