"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardContent } from "@/components/dashboard-content"
import { BarChart3, Compass, Database, LayoutDashboard, LightbulbIcon, Settings } from "lucide-react"
import type { DashboardState } from "@/lib/types"
import { fetchMetadataWithCaching } from "@/lib/advanced-data-fetcher"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThemeProvider } from "@/components/theme-provider"
import { checkDatabaseOptimization, EXPECTED_TOTAL_RECORDS } from "@/lib/db-optimization"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [state, setState] = useState<DashboardState>({
    activeTab: "overview",
    filters: {
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
    },
    chartConfig: {
      type: "bar",
      colorScheme: "category10",
      showLegend: true,
      showGrid: true,
      stacked: false,
      normalized: false,
    },
    queryHistory: [],
  })

  const [metadata, setMetadata] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [verifyingCount, setVerifyingCount] = useState(true)
  const [countProgress, setCountProgress] = useState(0)
  const [verificationMessage, setVerificationMessage] = useState<string>("")
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "warning" | "error">("pending")
  const [dataCompleteness, setDataCompleteness] = useState<number>(0)
  const [optimizationStatus, setOptimizationStatus] = useState<{
    viewsOptimized: boolean
    indexesOptimized: boolean
    recommendations: string[]
  }>({
    viewsOptimized: false,
    indexesOptimized: false,
    recommendations: [],
  })
  const [optimizationInProgress, setOptimizationInProgress] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    async function initializeDashboard() {
      try {
        setVerifyingCount(true)
        setCountProgress(10)
        setVerificationMessage("Checking database connection...")

        // Skip optimization checks initially to avoid potential errors
        setCountProgress(30)

        // Step 2: Fetch metadata first to ensure we can connect to the database
        setVerificationMessage("Loading metadata...")
        setCountProgress(50)

        let metadataResult
        try {
          metadataResult = await fetchMetadataWithCaching()
          setMetadata(metadataResult)
          setTotalRecords(metadataResult.totalRecords || EXPECTED_TOTAL_RECORDS)

          // Now that we know we can connect, try to check optimization status
          try {
            const optimizationResult = await checkDatabaseOptimization()
            setOptimizationStatus(optimizationResult)
          } catch (optimizationError) {
            console.error("Error checking optimization status:", optimizationError)
            // Continue with default optimization status
            setOptimizationStatus({
              viewsOptimized: false,
              indexesOptimized: false,
              recommendations: [
                "Create optimized views for complex queries",
                "Add indexes on frequently queried columns",
              ],
            })
          }
        } catch (metadataError) {
          console.error("Error fetching metadata:", metadataError)
          throw new Error("Failed to connect to the database. Please check your connection settings.")
        }

        // Set data completeness based on available years
        const expectedYears = [2019, 2020, 2021, 2022, 2023]
        const availableYears = metadataResult.tahun || []
        const yearCompleteness = (availableYears.length / expectedYears.length) * 100
        setDataCompleteness(yearCompleteness)

        if (yearCompleteness < 100) {
          setVerificationStatus("warning")
          const missingYears = expectedYears.filter((year) => !availableYears.includes(year))
          setVerificationMessage(`Missing data for years: ${missingYears.join(", ")}`)
        } else {
          setVerificationStatus("success")
          setVerificationMessage("All expected years are available")
        }

        // Update filters with available years
        setState((prev) => ({
          ...prev,
          filters: {
            ...prev.filters,
            tahun: metadataResult.tahun || [],
          },
        }))

        setCountProgress(100)
      } catch (error: any) {
        console.error("Error initializing dashboard:", error)
        setConnectionError(error.message || "Failed to initialize dashboard")
        setVerificationStatus("error")
      } finally {
        setVerifyingCount(false)
        setLoading(false)
      }
    }

    initializeDashboard()

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const setActiveTab = (tab: "overview" | "explore" | "insights" | "settings") => {
    setState((prev) => ({ ...prev, activeTab: tab }))
  }

  const setFilters = (filters: Partial<typeof state.filters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }))
  }

  const setChartConfig = (config: Partial<typeof state.chartConfig>) => {
    setState((prev) => ({
      ...prev,
      chartConfig: { ...prev.chartConfig, ...config },
    }))
  }

  const addQueryToHistory = (query: string, response: string, visualization: any) => {
    const newQuery = {
      id: Date.now().toString(),
      query,
      response,
      visualization,
      timestamp: Date.now(),
    }

    setState((prev) => ({
      ...prev,
      queryHistory: [newQuery, ...prev.queryHistory].slice(0, 20),
    }))
  }

  const retryConnection = () => {
    setLoading(true)
    setConnectionError(null)
    setVerifyingCount(true)
    setCountProgress(0)
    setVerificationStatus("pending")
    setVerificationMessage("Retrying connection...")

    // Create a new abort controller
    abortControllerRef.current = new AbortController()

    // Re-run the initialization process
    async function reinitializeDashboard() {
      try {
        // Skip optimization checks initially
        setCountProgress(30)

        setCountProgress(50)
        setVerificationMessage("Loading metadata...")

        // Fetch metadata
        const metadataResult = await fetchMetadataWithCaching()
        setMetadata(metadataResult)
        setTotalRecords(metadataResult.totalRecords || EXPECTED_TOTAL_RECORDS)

        // Try to check optimization status
        try {
          const optimizationResult = await checkDatabaseOptimization()
          setOptimizationStatus(optimizationResult)
        } catch (optimizationError) {
          console.error("Error checking optimization status:", optimizationError)
          // Continue with default optimization status
          setOptimizationStatus({
            viewsOptimized: false,
            indexesOptimized: false,
            recommendations: [
              "Create optimized views for complex queries",
              "Add indexes on frequently queried columns",
            ],
          })
        }

        // Set data completeness based on available years
        const expectedYears = [2019, 2020, 2021, 2022, 2023]
        const availableYears = metadataResult.tahun || []
        const yearCompleteness = (availableYears.length / expectedYears.length) * 100
        setDataCompleteness(yearCompleteness)

        if (yearCompleteness < 100) {
          setVerificationStatus("warning")
          const missingYears = expectedYears.filter((year) => !availableYears.includes(year))
          setVerificationMessage(`Missing data for years: ${missingYears.join(", ")}`)
        } else {
          setVerificationStatus("success")
          setVerificationMessage("All expected years are available")
        }

        // Update filters with available years
        setState((prev) => ({
          ...prev,
          filters: {
            ...prev.filters,
            tahun: metadataResult.tahun || [],
          },
        }))

        setCountProgress(100)
      } catch (error: any) {
        console.error("Error reinitializing dashboard:", error)
        setConnectionError(error.message || "Failed to reinitialize dashboard")
        setVerificationStatus("error")
      } finally {
        setVerifyingCount(false)
        setLoading(false)
      }
    }

    reinitializeDashboard()
  }

  // If there's a connection error, show an alert
  if (connectionError) {
    return (
      <ThemeProvider defaultTheme="dark" attribute="class">
        <div className="flex h-screen flex-col items-center justify-center p-4 bg-background">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {connectionError}
              <div className="mt-4">
                <Button onClick={retryConnection}>Retry Connection</Button>
                <Button variant="outline" className="ml-2" asChild>
                  <a href="/database-diagnostic">Run Diagnostics</a>
                </Button>
                <Button variant="outline" className="ml-2" asChild>
                  <a href="/robust-fetch">Robust Fetch Test</a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </ThemeProvider>
    )
  }

  // Show loading state while verifying record count
  if (verifyingCount) {
    return (
      <ThemeProvider defaultTheme="dark" attribute="class">
        <div className="flex h-screen flex-col items-center justify-center p-4 bg-background">
          <div className="text-center max-w-md w-full">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Preparing Your Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              {verificationMessage || "Preparing your investment dashboard..."}
            </p>
            <Progress value={countProgress} className="w-full mb-2" />
            <p className="text-sm text-muted-foreground">
              {countProgress < 30
                ? "Checking database status..."
                : countProgress < 50
                  ? "Preparing data access..."
                  : "Loading metadata..."}
            </p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader className="flex items-center h-16 px-4">
              <div className="flex items-center gap-2 font-semibold">
                <BarChart3 className="h-6 w-6 text-primary" />
                <span>Investment Analyzer</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab("overview")}
                    isActive={state.activeTab === "overview"}
                    tooltip="Overview"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab("explore")}
                    isActive={state.activeTab === "explore"}
                    tooltip="Explore"
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    <span>Explore</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab("insights")}
                    isActive={state.activeTab === "insights"}
                    tooltip="Insights"
                  >
                    <LightbulbIcon className="h-4 w-4 mr-2" />
                    <span>Insights</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>

              <SidebarSeparator />

              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab("settings")}
                    isActive={state.activeTab === "settings"}
                    tooltip="Settings"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium">Records: {totalRecords.toLocaleString()}</p>
                    {verificationStatus === "success" && <CheckCircle className="h-3 w-3 text-green-500" />}
                    {verificationStatus === "warning" && <AlertCircle className="h-3 w-3 text-yellow-500" />}
                    {verificationStatus === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">Data: {dataCompleteness.toFixed(1)}% complete</p>
                </div>
              </div>
            </SidebarFooter>
            <SidebarTrigger />
          </Sidebar>

          <SidebarInset>
            <div className="flex flex-col h-full">
              <DashboardHeader />
              {verificationStatus === "warning" && (
                <Alert variant="warning" className="mx-6 mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Data Integrity Warning</AlertTitle>
                  <AlertDescription>{verificationMessage}</AlertDescription>
                </Alert>
              )}
              <DashboardContent
                state={state}
                metadata={metadata}
                loading={loading}
                setFilters={setFilters}
                setChartConfig={setChartConfig}
                addQueryToHistory={addQueryToHistory}
                totalRecords={totalRecords}
                dataCompleteness={dataCompleteness}
                optimizationStatus={optimizationStatus}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
