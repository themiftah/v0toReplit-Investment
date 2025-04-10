"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
import { ArrowUpDown, Download, Search, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchDataWithRetries } from "@/lib/advanced-data-fetcher"

interface ExploreTabProps {
  data: any[]
  isLoading: boolean
  currency: "IDR" | "USD"
}

export function ExploreTab({ data: initialData, isLoading: initialLoading, currency }: ExploreTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState<any[]>(initialData || [])
  const [loading, setLoading] = useState(initialLoading)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [paginationMode, setPaginationMode] = useState<"offset" | "cursor">("offset")
  const [cursors, setCursors] = useState<string[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API with pagination
  const fetchData = async (page: number, size: number, sort: string | null, direction: "asc" | "desc") => {
    setLoading(true)
    setError(null)

    try {
      // Build API URL
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
      })

      if (sort) {
        params.append("sortBy", sort)
        params.append("sortOrder", direction)
      }

      // Add cursor if using cursor-based pagination
      if (paginationMode === "cursor" && cursors.length > 0 && page > 1) {
        params.append("cursor", cursors[page - 2])
        params.append("useCursor", "true")
      }

      const response = await fetch(`/api/investment-data?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      setData(result.data || [])

      if (paginationMode === "offset") {
        setTotalItems(result.pagination?.total || 0)
        setTotalPages(result.pagination?.totalPages || 1)
      } else {
        // For cursor-based pagination
        setHasMore(result.pagination?.hasMore || false)

        if (result.pagination?.nextCursor) {
          setCursors((prev) => {
            const newCursors = [...prev]
            newCursors[page - 1] = result.pagination.nextCursor
            return newCursors
          })
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")

      // Use initial data as fallback
      setData(initialData || [])
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    if (initialData.length === 0) {
      fetchData(currentPage, pageSize, sortField, sortDirection)
    }
  }, [])

  // Refetch when pagination or sorting changes
  useEffect(() => {
    if (!initialLoading) {
      fetchData(currentPage, pageSize, sortField, sortDirection)
    }
  }, [currentPage, pageSize, sortField, sortDirection, paginationMode])

  // Safely filter data based on search term
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()

    // Safely check each property before calling toLowerCase()
    const provinceMatch =
      item.province && typeof item.province === "string" ? item.province.toLowerCase().includes(searchLower) : false

    const sectorMatch =
      item.sector && typeof item.sector === "string" ? item.sector.toLowerCase().includes(searchLower) : false

    const yearMatch = item.year && item.year.toString().includes(searchLower)

    return provinceMatch || sectorMatch || yearMatch
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }

    // Reset to first page when sorting changes
    setCurrentPage(1)
  }

  const exportToCSV = async () => {
    setLoading(true)

    try {
      // Fetch all data for export
      const allData = await fetchDataWithRetries({
        pageSize: 1000,
        filters: {},
        sortBy: sortField || "Tahun",
        sortOrder: sortDirection,
      })

      // Create CSV content
      const headers = [
        "Year",
        "Province",
        "Sector",
        "Region",
        "Country",
        "Status",
        currency === "IDR" ? "Investment (Billion IDR)" : "Investment (Million USD)",
        "Projects",
        "TKI",
        "TKA",
      ]

      const csvContent = [
        headers.join(","),
        ...allData.map((item) =>
          [
            item.year || "",
            `"${item.province || ""}"`,
            `"${item.sector || ""}"`,
            `"${item.region || ""}"`,
            `"${item.country || ""}"`,
            `"${item.status || ""}"`,
            currency === "IDR" ? (item.investment_idr || 0).toFixed(2) : (item.investment_usd || 0).toFixed(2),
            item.projects || 0,
            item.tki || 0,
            item.tka || 0,
          ].join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `investment_data_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Error exporting data:", err)
      setError(err instanceof Error ? err.message : "Failed to export data")
    } finally {
      setLoading(false)
    }
  }

  // Handle cursor-based pagination
  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tabs
            value={paginationMode}
            onValueChange={(value) => {
              setPaginationMode(value as "offset" | "cursor")
              setCurrentPage(1)
              setCursors([])
            }}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="offset">Standard</TabsTrigger>
              <TabsTrigger value="cursor">Cursor</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fetchData(currentPage, pageSize, sortField, sortDirection)}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("year")} className="cursor-pointer">
                Year
                <ArrowUpDown className="ml-2 inline-block h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("province")} className="cursor-pointer">
                Province
                <ArrowUpDown className="ml-2 inline-block h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("sector")} className="cursor-pointer">
                Sector
                <ArrowUpDown className="ml-2 inline-block h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("region")} className="cursor-pointer">
                Region
                <ArrowUpDown className="ml-2 inline-block h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("status")} className="cursor-pointer">
                Status
                <ArrowUpDown className="ml-2 inline-block h-4 w-4" />
              </TableHead>
              <TableHead
                onClick={() => handleSort(currency === "IDR" ? "investment_idr" : "investment_usd")}
                className="cursor-pointer"
              >
                Investment {currency === "IDR" ? "(Billion IDR)" : "(Million USD)"}
                <ArrowUpDown className="ml-2 inline-block h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("projects")} className="cursor-pointer">
                Projects
                <ArrowUpDown className="ml-2 inline-block h-4 w-4" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell>{item.year || "N/A"}</TableCell>
                  <TableCell>{item.province || "N/A"}</TableCell>
                  <TableCell>{item.sector || "N/A"}</TableCell>
                  <TableCell>{item.region || "N/A"}</TableCell>
                  <TableCell>{item.status || "N/A"}</TableCell>
                  <TableCell className="formatted-number">
                    {currency === "IDR" ? (item.investment_idr || 0).toFixed(2) : (item.investment_usd || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>{item.projects || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setCurrentPage(1)
        }}
        nextCursor={cursors[currentPage - 1]}
        hasMore={hasMore}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        useCursor={paginationMode === "cursor"}
      />
    </div>
  )
}
