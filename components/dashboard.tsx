"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InvestmentData, FilterState } from "@/lib/types"
import { OverviewTab } from "./tabs/overview-tab"
import { ExploreTab } from "./tabs/explore-tab"
import { InsightsTab } from "./tabs/insights-tab"
import { Badge } from "./ui/badge"
import { SidePanel } from "./side-panel"
import { Button } from "./ui/button"
import { BarChart3, Database, Filter, Menu, Search, SlidersHorizontal, X } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { Input } from "./ui/input"
import { FilterPanel } from "./filter-panel"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<InvestmentData[]>([])
  const [filteredData, setFilteredData] = useState<InvestmentData[]>([])
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    sektorUtama: [],
    sektor23: [],
    wilayah: [],
    provinsi: [],
    kabkot: [],
    negara: [],
    status: [],
    tahun: [],
    investmentRange: [0, 1000],
    currency: "IDR",
  })
  const [error, setError] = useState<string | null>(null)
  const [totalRecords, setTotalRecords] = useState(0)

  // Load real data from Neon database
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        // Try to fetch metadata
        console.log("Fetching metadata...")
        let metadataResult

        try {
          const metadataResponse = await fetch("/api/metadata")

          if (!metadataResponse.ok) {
            console.warn("Metadata fetch failed, trying fallback:", metadataResponse.status)
            throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`)
          }

          metadataResult = await metadataResponse.json()
        } catch (metadataError) {
          console.warn("Using fallback metadata due to error:", metadataError)
          // Use fallback API
          const fallbackResponse = await fetch("/api/fallback-data")
          const fallbackData = await fallbackResponse.json()
          metadataResult = fallbackData.metadata || {}
        }

        console.log("Metadata available:", metadataResult)
        setMetadata(metadataResult)
        setTotalRecords(metadataResult.totalRecords || 0)

        // Try to fetch investment data
        console.log("Fetching investment data...")
        let dataResult

        try {
          const dataResponse = await fetch("/api/investment-data?pageSize=100")

          if (!dataResponse.ok) {
            console.warn("Data fetch failed, trying fallback:", dataResponse.status)
            throw new Error(`Failed to fetch data: ${dataResponse.status}`)
          }

          dataResult = await dataResponse.json()
        } catch (dataError) {
          console.warn("Using fallback data due to error:", dataError)
          // Use fallback API
          const fallbackResponse = await fetch("/api/fallback-data")
          dataResult = await fallbackResponse.json()
        }

        console.log("Data available, records:", dataResult.data?.length || 0)

        setData(dataResult.data || [])
        setFilteredData(dataResult.data || [])
      } catch (err: any) {
        console.error("Error loading data:", err)
        setError(err.message || "Failed to load data")

        // Set empty arrays as fallback
        setData([])
        setFilteredData([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    if (!data.length) return

    let filtered = [...data]

    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter((item) => item.year === selectedYear)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.sector && item.sector.toLowerCase().includes(query)) ||
          (item.province && item.province.toLowerCase().includes(query)) ||
          (item.region && item.region.toLowerCase().includes(query)) ||
          (item.status && item.status.toLowerCase().includes(query)) ||
          (item.country && item.country.toLowerCase().includes(query)),
      )
    }

    // Apply other filters
    if (filters.sektorUtama && filters.sektorUtama.length) {
      filtered = filtered.filter((item) => filters.sektorUtama.includes(item.sector))
    }

    if (filters.wilayah && filters.wilayah.length) {
      filtered = filtered.filter((item) => filters.wilayah.includes(item.region))
    }

    if (filters.provinsi && filters.provinsi.length) {
      filtered = filtered.filter((item) => filters.provinsi.includes(item.province))
    }

    if (filters.negara && filters.negara.length) {
      filtered = filtered.filter((item) => filters.negara.includes(item.country))
    }

    if (filters.status && filters.status.length) {
      filtered = filtered.filter((item) => filters.status.includes(item.status))
    }

    setFilteredData(filtered)
  }, [data, selectedYear, searchQuery, filters])

  // Reset all filters
  const resetFilters = () => {
    setSelectedYear(null)
    setSearchQuery("")
    setFilters({
      sektorUtama: [],
      sektor23: [],
      wilayah: [],
      provinsi: [],
      kabkot: [],
      negara: [],
      status: [],
      tahun: [],
      investmentRange: [0, 1000],
      currency: "IDR",
    })
  }

  // Open filter panel
  const openFilterPanel = () => {
    setShowFilterPanel(true)
  }

  // Update filters
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Side panel for mobile */}
      <SidePanel show={showSidePanel} onClose={() => setShowSidePanel(false)}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">InvestAnalyzer</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowSidePanel(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 p-4">
            <nav className="space-y-2">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("overview")
                  setShowSidePanel(false)
                }}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Overview
              </Button>

              <Button
                variant={activeTab === "explore" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("explore")
                  setShowSidePanel(false)
                }}
              >
                <Search className="mr-2 h-5 w-5" />
                Explore
              </Button>

              <Button
                variant={activeTab === "insights" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("insights")
                  setShowSidePanel(false)
                }}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Insights
              </Button>
            </nav>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{totalRecords.toLocaleString()} Records</span>
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </SidePanel>

      {/* Filter panel for mobile */}
      <FilterPanel
        show={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        metadata={metadata}
        filters={filters}
        setFilters={updateFilters}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        resetFilters={resetFilters}
      />

      {/* Main content */}
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="container px-4 mx-auto flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowSidePanel(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo - desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">InvestAnalyzer</h1>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md mx-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search investments..."
                className="pl-8 bg-background/50 border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter button - mobile */}
            <Button variant="outline" size="icon" className="md:hidden" onClick={openFilterPanel}>
              <Filter className="h-5 w-5" />
            </Button>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="border rounded-md overflow-hidden flex">
                <Button
                  variant={filters.currency === "IDR" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none border-0"
                  onClick={() => updateFilters({ currency: "IDR" })}
                >
                  IDR
                </Button>
                <Button
                  variant={filters.currency === "USD" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none border-0"
                  onClick={() => updateFilters({ currency: "USD" })}
                >
                  USD
                </Button>
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={openFilterPanel}>
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <ModeToggle />
            </div>
          </div>

          {/* Tabs */}
          <div className="container px-4 mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full sm:w-auto mt-1 mb-3">
                <TabsTrigger value="overview" className="flex-1 sm:flex-none">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="explore" className="flex-1 sm:flex-none">
                  <Search className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Explore</span>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex-1 sm:flex-none">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 container px-4 mx-auto py-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md mb-6">
              <h3 className="text-red-800 dark:text-red-300 font-medium">Error Loading Data</h3>
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              {!loading && !error && filteredData.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md mb-6">
                  <h3 className="text-yellow-800 dark:text-yellow-300 font-medium">No Data Found</h3>
                  <p className="text-yellow-700 dark:text-yellow-400">
                    No investment data was found in the database. Please make sure your database is properly set up and
                    contains data.
                  </p>
                  <Button variant="outline" className="mt-2" asChild>
                    <a href="/database-setup">Check Database Setup</a>
                  </Button>
                </div>
              )}
              {activeTab === "overview" && (
                <OverviewTab
                  data={filteredData}
                  metadata={metadata}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  currency={filters.currency}
                  setCurrency={(currency) => updateFilters({ currency })}
                />
              )}

              {activeTab === "explore" && (
                <ExploreTab data={filteredData} isLoading={false} currency={filters.currency} />
              )}

              {activeTab === "insights" && <InsightsTab data={filteredData} metadata={metadata} />}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t py-4">
          <div className="container px-4 mx-auto">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalRecords.toLocaleString()} investment records from Neon database
              </p>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs">
                  v1.0.0
                </Badge>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
