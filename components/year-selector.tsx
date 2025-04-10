"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { InvestmentData } from "@/lib/types"

interface YearSelectorProps {
  data: InvestmentData[]
  selectedYear: number | null
  onYearChange: (year: number | null) => void
  onViewAllClick: () => void
  className?: string
}

export function YearSelector({ data, selectedYear, onYearChange, onViewAllClick, className }: YearSelectorProps) {
  const years = useMemo(() => {
    if (!data.length) return []
    return [...new Set(data.map((item) => item.Tahun))].filter(Boolean).sort((a, b) => b - a) // Sort descending (newest first)
  }, [data])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`justify-between ${className}`}>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {selectedYear ? (
              <span>
                Year:{" "}
                <Badge variant="secondary" className="ml-1 font-normal">
                  {selectedYear}
                </Badge>
              </span>
            ) : (
              <span>All Years</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        <DropdownMenuItem onClick={onViewAllClick} className="flex items-center justify-between">
          <span>All Years</span>
          {!selectedYear && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {years.map((year) => (
          <DropdownMenuItem key={year} onClick={() => onYearChange(year)} className="flex items-center justify-between">
            <span>{year}</span>
            {selectedYear === year && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
