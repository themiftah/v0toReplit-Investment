"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

export default function DatabaseCheckPage() {
  const [yearCounts, setYearCounts] = useState<Record<string, number>>({})
  const [investmentTypes, setInvestmentTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rawData, setRawData] = useState<any[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [loadingStage, setLoadingStage] = useState<string>("Initializing...")

  useEffect(() => {
    checkDatabase()
  }, [])

  async function checkDatabase() {
    try {
      setLoading(true)
      setLoadingProgress(0)
      setLoadingStage("Initializing connection...")

      // Check database status
      const statusResponse = await fetch("/api/db-status")
      if (!statusResponse.ok) {
        throw new Error(`Failed to check database status: ${statusResponse.statusText}`)
      }
      const statusData = await statusResponse.json()

      if (!statusData.success) {
        throw new Error(statusData.message || "Database connection failed")
      }

      setTotalRecords(statusData.recordCount || 0)
      setLoadingProgress(20)

      // Fetch metadata to get year distribution
      setLoadingStage("Fetching metadata...")
      const metadataResponse = await fetch("/api/metadata")
      if (!metadataResponse.ok) {
        throw new Error(`Failed to fetch metadata: ${metadataResponse.statusText}`)
      }
      const metadata = await metadataResponse.json()
      setLoadingProgress(40)

      // Fetch sample data
      setLoadingStage("Fetching sample data...")
      const dataResponse = await fetch("/api/investment-data?pageSize=10")
      if (!dataResponse.ok) {
        throw new Error(`Failed to fetch data: ${dataResponse.statusText}`)
      }
      const dataResult = await dataResponse.json()
      setRawData(dataResult.data || [])
      setLoadingProgress(60)

      // Process year counts
      setLoadingStage("Processing year distribution...")
      const years = metadata.years || []
      const yearCountsObj: Record<string, number> = {}

      // Fetch year counts
      const yearCountsResponse = await fetch("/api/chart-data?groupBy=Tahun&type=trend")
      if (!yearCountsResponse.ok) {
        throw new Error(`Failed to fetch year counts: ${yearCountsResponse.statusText}`)
      }
      const yearCountsData = await yearCountsResponse.json()

      // Process year counts
      if (yearCountsData.data && Array.isArray(yearCountsData.data)) {
        yearCountsData.data.forEach((item: any) => {
          if (item.year) {
            yearCountsObj[item.year] = Number.parseInt(item.count || "0")
          }
        })
      }

      setYearCounts(yearCountsObj)
      setLoadingProgress(80)

      // Process investment types
      setLoadingStage("Processing investment types...")
      const statusResponse2 = await fetch("/api/chart-data?groupBy=Status")
      if (!statusResponse2.ok) {
        throw new Error(`Failed to fetch status data: ${statusResponse2.statusText}`)
      }
      const statusData2 = await statusResponse2.json()

      if (statusData2.data && Array.isArray(statusData2.data)) {
        const typesData = statusData2.data.map((item: any) => {
          const count = Number.parseInt(item.count || "0")
          return {
            type: item.name,
            count,
            percentage: totalRecords > 0 ? `${((count / totalRecords) * 100).toFixed(1)}%` : "0%",
          }
        })
        setInvestmentTypes(typesData)
      }

      setLoadingProgress(100)
      setLoadingStage("Data processing complete")
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Connection Check</h1>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>{loadingStage}</p>
              </div>
              <Progress value={loadingProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{loadingProgress}% complete</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">Connection Error</h2>
            <p className="mt-2">{error}</p>
            <Button onClick={checkDatabase} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
                <div className="text-muted-foreground">Total records in database</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Year Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(yearCounts).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(yearCounts).map(([year, count]) => (
                    <div key={year} className="bg-muted p-4 rounded-lg">
                      <div className="text-2xl font-bold">{year}</div>
                      <div className="text-muted-foreground">{count.toLocaleString()} records</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No year data found. Your database might be empty.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investment Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {investmentTypes.map((item) => (
                  <div key={item.type} className="bg-muted p-4 rounded-lg">
                    <div className="text-lg font-semibold">{item.type}</div>
                    <div className="text-2xl font-bold">{item.count.toLocaleString()}</div>
                    <div className="text-muted-foreground">{item.percentage} of total</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sample Data (First 5 Records)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-96">
                <pre className="text-xs bg-muted p-4 rounded">{JSON.stringify(rawData.slice(0, 5), null, 2)}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
