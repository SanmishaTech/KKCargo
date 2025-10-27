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
  value?: string // Format: YYYY-MM-DD or YYYY-MM or status value or date
  onValueChange?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  companyType?: string
  onCompanyTypeChange?: (value: string) => void
  showCompanyTypeFilter?: boolean
  city?: string
  onCityChange?: (value: string) => void
  showCityFilter?: boolean
  status?: string
  onStatusChange?: (value: string) => void
  showStatusFilter?: boolean
  createdAt?: string
  onCreatedAtChange?: (value: string) => void
  showCreatedAtFilter?: boolean
  day?: string
  onDayChange?: (value: string) => void
  month?: string
  onMonthChange?: (value: string) => void
  year?: string
  onYearChange?: (value: string) => void
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
  city,
  onCityChange,
  showCityFilter = false,
  status,
  onStatusChange,
  showStatusFilter = false,
  createdAt,
  onCreatedAtChange,
  showCreatedAtFilter = false,
  day,
  onDayChange,
  month,
  onMonthChange,
  year,
  onYearChange,
}: DateFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedYear, setSelectedYear] = React.useState<string>("")
  const [selectedMonth, setSelectedMonth] = React.useState<string>("")
  const [selectedDay, setSelectedDay] = React.useState<string>("")
  const [selectedCompanyType, setSelectedCompanyType] = React.useState<string>(companyType || "all")
  const [selectedCity, setSelectedCity] = React.useState<string>(city || "all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>(status || "all")

  // Fetch company types
  const { data: companyTypesResponse } = useGetData({
    endpoint: '/api/company-types',
    params: {
      queryKey: ['companyTypes'],
      enabled: showCompanyTypeFilter,
    },
  })

  // Fetch company cities
  const { data: companyCitiesResponse } = useGetData({
    endpoint: '/api/company-cities',
    params: {
      queryKey: ['companyCities'],
      enabled: showCityFilter,
    },
  })

  const companyTypes = Array.isArray(companyTypesResponse?.data) ? companyTypesResponse.data : []
  const companyCities = Array.isArray(companyCitiesResponse?.data) ? companyCitiesResponse.data : []

  // Extract year, month, and day from value when it changes
  React.useEffect(() => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = value.split('-')
      setSelectedYear(year)
      setSelectedMonth(month)
      setSelectedDay(day)
    } else if (value && value.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = value.split('-')
      setSelectedYear(year)
      setSelectedMonth(month)
      setSelectedDay("")
    } else if (!value) {
      setSelectedYear("")
      setSelectedMonth("")
      setSelectedDay("")
    }
  }, [value])

  // Update selected company type when prop changes
  React.useEffect(() => {
    setSelectedCompanyType(companyType || "all")
  }, [companyType])

  // Update selected city when prop changes
  React.useEffect(() => {
    setSelectedCity(city || "all")
  }, [city])

  // Update selected status when prop changes
  React.useEffect(() => {
    setSelectedStatus(status || "all")
  }, [status])

  // Extract year, month, and day for createdAt filter
  React.useEffect(() => {
    if (showCreatedAtFilter && createdAt && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = createdAt.split('-')
      setSelectedYear(year)
      setSelectedMonth(month)
      setSelectedDay(day)
    } else if (showCreatedAtFilter && createdAt && createdAt.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = createdAt.split('-')
      setSelectedYear(year)
      setSelectedMonth(month)
      setSelectedDay("")
    } else if (showCreatedAtFilter && !createdAt) {
      // Don't clear if using for regular date filter
    }
  }, [createdAt, showCreatedAtFilter])

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

  const statusOptions = [
    { value: "interested", label: "Interested" },
    { value: "not_interested", label: "Not Interested" },
    { value: "not_answering", label: "Not Answering the Call" },
    { value: "wrong_number", label: "Wrong Number" },
    { value: "busy_on_call", label: "Busy on Another Call" },
  ]

  const handleApply = () => {
    // Apply independent day/month/year filters
    onDayChange?.(selectedDay || '')
    onMonthChange?.(selectedMonth || '')
    onYearChange?.(selectedYear || '')
    
    // Apply combined date filter for backward compatibility
    if (selectedYear && selectedMonth) {
      let dateValue = `${selectedYear}-${selectedMonth}`
      if (selectedDay) {
        dateValue += `-${selectedDay}`
      }
      if (showCreatedAtFilter) {
        onCreatedAtChange?.(dateValue)
      } else {
        onValueChange?.(dateValue)
      }
    } else {
      if (showCreatedAtFilter) {
        onCreatedAtChange?.('')
      } else {
        onValueChange?.('')
      }
    }
    
    if (showCompanyTypeFilter) {
      onCompanyTypeChange?.(selectedCompanyType === 'all' ? '' : selectedCompanyType)
    }
    if (showCityFilter) {
      onCityChange?.(selectedCity === 'all' ? '' : selectedCity)
    }
    if (showStatusFilter) {
      onStatusChange?.(selectedStatus === 'all' ? '' : selectedStatus)
    }
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedYear("")
    setSelectedMonth("")
    setSelectedDay("")
    setSelectedCompanyType("all")
    setSelectedCity("all")
    setSelectedStatus("all")
    
    // Clear all filters
    onValueChange?.("")
    onDayChange?.("")
    onMonthChange?.("")
    onYearChange?.("")
    
    if (showCompanyTypeFilter) {
      onCompanyTypeChange?.("")
    }
    if (showCityFilter) {
      onCityChange?.("")
    }
    if (showStatusFilter) {
      onStatusChange?.("")
    }
    if (showCreatedAtFilter) {
      onCreatedAtChange?.("")
    }
    onClear?.()
    setOpen(false)
  }

  const getDisplayValue = () => {
    const parts = []
    
    // Show individual date components if any are selected
    const dateParts = []
    if (selectedDay) dateParts.push(`Day: ${selectedDay}`)
    if (selectedMonth) {
      const monthName = months.find(m => m.value === selectedMonth)?.label
      dateParts.push(`Month: ${monthName}`)
    }
    if (selectedYear) dateParts.push(`Year: ${selectedYear}`)
    
    if (dateParts.length > 0) {
      parts.push(dateParts.join(', '))
    } else if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = value.split('-')
      const monthName = months.find(m => m.value === month)?.label
      parts.push(`${monthName} ${day}, ${year}`)
    } else if (value && value.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = value.split('-')
      const monthName = months.find(m => m.value === month)?.label
      parts.push(`${monthName} ${year}`)
    }
    
    if (showCompanyTypeFilter && companyType && companyType !== 'all') {
      parts.push(`Type: ${companyType}`)
    }
    
    if (showCityFilter && city && city !== 'all') {
      parts.push(`City: ${city}`)
    }

    if (showStatusFilter && status && status !== 'all') {
      const statusLabel = statusOptions.find(s => s.value === status)?.label
      parts.push(`Status: ${statusLabel || status}`)
    }

    if (showCreatedAtFilter && createdAt && createdAt.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = createdAt.split('-')
      const monthName = months.find(m => m.value === month)?.label
      parts.push(`Created: ${monthName} ${day}, ${year}`)
    } else if (showCreatedAtFilter && createdAt && createdAt.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = createdAt.split('-')
      const monthName = months.find(m => m.value === month)?.label
      parts.push(`Created: ${monthName} ${year}`)
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
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{getDisplayValue()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="start">
          <div className="space-y-4">
            {/* Default Date Filter (Day, Month & Year) */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Day</label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = (i + 1).toString().padStart(2, '0')
                      return (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
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

            {showCityFilter && (
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {companyCities.map((cityName: string) => (
                      <SelectItem key={cityName} value={cityName}>
                        {cityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Status Filter */}
            {showStatusFilter && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleApply}
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
      
      {(value || selectedDay || selectedMonth || selectedYear || (companyType && companyType !== 'all') || (city && city !== 'all') || (status && status !== 'all')) && (
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
