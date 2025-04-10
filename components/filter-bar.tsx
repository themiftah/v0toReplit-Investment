"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { FilterX, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FilterState } from "@/lib/types"

interface FilterBarProps {
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  metadata: any
}

export function FilterBar({ filters, setFilters, metadata }: FilterBarProps) {
  const [open, setOpen] = useState(false)

  // Safely count active filters
  const activeFilterCount = [
    filters?.sektorUtama?.length || 0,
    filters?.sektor23?.length || 0,
    filters?.wilayah?.length || 0,
    filters?.provinsi?.length || 0,
    filters?.kabkot?.length || 0,
    filters?.negara?.length || 0,
    filters?.status?.length || 0,
    filters?.tahun?.length || 0,
  ].reduce((a, b) => a + b, 0)

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      sektorUtama: [],
      sektor23: [],
      wilayah: [],
      provinsi: [],
      kabkot: [],
      negara: [],
      status: [],
      tahun: [],
      investmentRange: metadata?.investmentRange || [0, 1000],
    })
    setOpen(false)
  }

  // Toggle a filter value
  const toggleFilter = (key: keyof FilterState, value: string | number) => {
    const currentValues = (filters[key] as (string | number)[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    setFilters({ [key]: newValues })
  }

  return (
    <div className="flex items-center gap-2">
      <Tabs
        value={filters?.currency || "IDR"}
        onValueChange={(value) => setFilters({ currency: value as "IDR" | "USD" })}
      >
        <TabsList>
          <TabsTrigger value="IDR">IDR</TabsTrigger>
          <TabsTrigger value="USD">USD</TabsTrigger>
        </TabsList>
      </Tabs>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 px-3 lg:px-4">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full px-1 font-normal lg:px-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0" align="end">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <h4 className="font-medium">Filters</h4>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={resetFilters}>
                <FilterX className="mr-2 h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              <div className="space-y-4">
                {/* Year Filter */}
                <div className="space-y-2">
                  <h5 className="font-medium">Year</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {metadata?.tahun?.map((year: number) => (
                      <Badge
                        key={year}
                        variant={filters?.tahun?.includes(year) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter("tahun", year)}
                      >
                        {year}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sector Filter */}
                <div className="space-y-2">
                  <h5 className="font-medium">Main Sector</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {metadata?.sektorUtama?.slice(0, 6)?.map((sector: string) => (
                      <Badge
                        key={sector}
                        variant={filters?.sektorUtama?.includes(sector) ? "default" : "outline"}
                        className="cursor-pointer truncate"
                        onClick={() => toggleFilter("sektorUtama", sector)}
                      >
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Region Filter */}
                <div className="space-y-2">
                  <h5 className="font-medium">Region</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {metadata?.wilayah?.map((region: string) => (
                      <Badge
                        key={region}
                        variant={filters?.wilayah?.includes(region) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter("wilayah", region)}
                      >
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Province Filter */}
                <div className="space-y-2">
                  <h5 className="font-medium">Province</h5>
                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {metadata?.provinsi?.map((province: string) => (
                      <Badge
                        key={province}
                        variant={filters?.provinsi?.includes(province) ? "default" : "outline"}
                        className="cursor-pointer truncate"
                        onClick={() => toggleFilter("provinsi", province)}
                      >
                        {province}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Investment Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Investment Range (Billion IDR)</h5>
                    <span className="text-xs text-muted-foreground">
                      {filters?.investmentRange?.[0]?.toLocaleString("en-US") || 0} -{" "}
                      {filters?.investmentRange?.[1]?.toLocaleString("en-US") || 1000}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[filters?.investmentRange?.[0] || 0, filters?.investmentRange?.[1] || 1000]}
                    min={metadata?.investmentRange?.[0] || 0}
                    max={metadata?.investmentRange?.[1] || 1000}
                    step={10}
                    onValueChange={(value) => setFilters({ investmentRange: value as [number, number] })}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
