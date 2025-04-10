"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FilterX, CalendarIcon, BarChart3, MapPin, Activity, Globe, Building } from "lucide-react"
import type { FilterState } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

interface FilterPanelProps {
  show: boolean
  onClose: () => void
  metadata: any
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  selectedYear: number | null
  setSelectedYear: (year: number | null) => void
  resetFilters: () => void
}

export function FilterPanel({
  show,
  onClose,
  metadata,
  filters,
  setFilters,
  selectedYear,
  setSelectedYear,
  resetFilters,
}: FilterPanelProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [provinceSearch, setProvinceSearch] = useState("")
  const [filteredProvinces, setFilteredProvinces] = useState<string[]>([])

  // Filter provinces based on search term
  useEffect(() => {
    if (!metadata?.provinces) {
      setFilteredProvinces([])
      return
    }

    if (!provinceSearch.trim()) {
      setFilteredProvinces(metadata.provinces)
      return
    }

    const searchTerm = provinceSearch.toLowerCase()
    const filtered = metadata.provinces.filter((province: string) => province.toLowerCase().includes(searchTerm))
    setFilteredProvinces(filtered)
  }, [provinceSearch, metadata?.provinces])

  // Toggle a sector
  const toggleSector = (sector: string) => {
    const currentSectors = filters.sektorUtama || []
    if (currentSectors.includes(sector)) {
      setFilters({
        sektorUtama: currentSectors.filter((s) => s !== sector),
      })
    } else {
      setFilters({
        sektorUtama: [...currentSectors, sector],
      })
    }
  }

  // Toggle a region
  const toggleRegion = (region: string) => {
    const currentRegions = filters.wilayah || []
    if (currentRegions.includes(region)) {
      setFilters({
        wilayah: currentRegions.filter((r) => r !== region),
      })
    } else {
      setFilters({
        wilayah: [...currentRegions, region],
      })
    }
  }

  // Toggle a province
  const toggleProvince = (province: string) => {
    const currentProvinces = filters.provinsi || []
    if (currentProvinces.includes(province)) {
      setFilters({
        provinsi: currentProvinces.filter((p) => p !== province),
      })
    } else {
      setFilters({
        provinsi: [...currentProvinces, province],
      })
    }
  }

  // Toggle a status
  const toggleStatus = (status: string) => {
    const currentStatuses = filters.status || []
    if (currentStatuses.includes(status)) {
      setFilters({
        status: currentStatuses.filter((s) => s !== status),
      })
    } else {
      setFilters({
        status: [...currentStatuses, status],
      })
    }
  }

  // Toggle a country
  const toggleCountry = (country: string) => {
    const currentCountries = filters.negara || []
    if (currentCountries.includes(country)) {
      setFilters({
        negara: currentCountries.filter((c) => c !== country),
      })
    } else {
      setFilters({
        negara: [...currentCountries, country],
      })
    }
  }

  // Handle reset filters
  const handleResetFilters = () => {
    resetFilters()
    // Close the filter panel after reset
    onClose()
  }

  if (!show) return null

  return (
    <Sheet open={show} onOpenChange={onClose}>
      <SheetContent className="w-[320px] sm:w-[540px] sm:max-w-md p-0 flex flex-col bg-card">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">Filters</div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1 text-muted-foreground"
              onClick={handleResetFilters}
            >
              <FilterX className="h-4 w-4" />
              Reset
            </Button>
          </SheetTitle>
          <SheetDescription>Filter investment data by various criteria</SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-6 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="year" className="flex-1">
                Year
              </TabsTrigger>
              <TabsTrigger value="region" className="flex-1">
                Region
              </TabsTrigger>
              <TabsTrigger value="province" className="flex-1">
                Province
              </TabsTrigger>
              <TabsTrigger value="country" className="flex-1">
                Country
              </TabsTrigger>
              <TabsTrigger value="sector" className="flex-1">
                Sector
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="all" className="mt-0">
                <Accordion type="multiple" defaultValue={["year", "sector", "region", "status"]}>
                  {/* Year Section */}
                  <AccordionItem value="year">
                    <AccordionTrigger className="gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Year</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={selectedYear === null ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedYear(null)}
                        >
                          All Years
                        </Button>
                        {metadata?.years?.map((year: number) => (
                          <Button
                            key={year}
                            variant={selectedYear === year ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedYear(year)}
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Sector Section */}
                  <AccordionItem value="sector">
                    <AccordionTrigger className="gap-2">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>Sector</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2">
                        {metadata?.sectors?.map((sector: string) => (
                          <Button
                            key={sector}
                            variant={filters.sektorUtama?.includes(sector) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleSector(sector)}
                            className="justify-start overflow-hidden"
                          >
                            <span className="truncate">{sector}</span>
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Region Section */}
                  <AccordionItem value="region">
                    <AccordionTrigger className="gap-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Region</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2">
                        {metadata?.regions?.map((region: string) => (
                          <Button
                            key={region}
                            variant={filters.wilayah?.includes(region) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleRegion(region)}
                          >
                            {region}
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Status Section */}
                  <AccordionItem value="status">
                    <AccordionTrigger className="gap-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2">
                        {metadata?.statuses?.map((status: string) => (
                          <Button
                            key={status}
                            variant={filters.status?.includes(status) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleStatus(status)}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="year" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Select Year
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={selectedYear === null ? "default" : "outline"}
                      onClick={() => setSelectedYear(null)}
                    >
                      All Years
                    </Button>
                    {metadata?.years?.map((year: number) => (
                      <Button
                        key={year}
                        variant={selectedYear === year ? "default" : "outline"}
                        onClick={() => setSelectedYear(year)}
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="region" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Select Regions
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {metadata?.regions?.map((region: string) => (
                      <Button
                        key={region}
                        variant={filters.wilayah?.includes(region) ? "default" : "outline"}
                        onClick={() => toggleRegion(region)}
                      >
                        {region}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="province" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Select Provinces
                  </h3>

                  <Input
                    placeholder="Search provinces..."
                    value={provinceSearch}
                    onChange={(e) => setProvinceSearch(e.target.value)}
                    className="mb-4"
                  />

                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {filteredProvinces?.map((province: string) => (
                      <Button
                        key={province}
                        variant={filters.provinsi?.includes(province) ? "default" : "outline"}
                        onClick={() => toggleProvince(province)}
                        className="justify-start overflow-hidden"
                        size="sm"
                      >
                        <span className="truncate">{province}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="country" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Select Countries
                  </h3>

                  <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                    {metadata?.countries?.map((country: string) => (
                      <Button
                        key={country}
                        variant={filters.negara?.includes(country) ? "default" : "outline"}
                        onClick={() => toggleCountry(country)}
                        className="justify-start overflow-hidden"
                        size="sm"
                      >
                        <span className="truncate">{country}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sector" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Select Sectors
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    {metadata?.sectors?.map((sector: string) => (
                      <Button
                        key={sector}
                        variant={filters.sektorUtama?.includes(sector) ? "default" : "outline"}
                        onClick={() => toggleSector(sector)}
                        className="justify-start overflow-hidden"
                        size="sm"
                      >
                        <span className="truncate">{sector}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <SheetFooter className="p-6 border-t">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset All
            </Button>
            <SheetClose asChild>
              <Button>Apply Filters</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
