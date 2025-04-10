"use client"

import { OverviewTab } from "@/components/tabs/overview-tab"
import { ExploreTab } from "@/components/tabs/explore-tab"
import { InsightsTab } from "@/components/tabs/insights-tab"
import { SettingsTab } from "@/components/tabs/settings-tab"
import type { DashboardState } from "@/lib/types"

interface DashboardContentProps {
  state: DashboardState
  metadata: any
  loading: boolean
  setFilters: (filters: any) => void
  setChartConfig: (config: any) => void
  addQueryToHistory: (query: string, response: string, visualization: any) => void
  totalRecords: number
  dataCompleteness: number
  optimizationStatus?: {
    viewsOptimized: boolean
    indexesOptimized: boolean
    recommendations: string[]
  }
}

export function DashboardContent({
  state,
  metadata,
  loading,
  setFilters,
  setChartConfig,
  addQueryToHistory,
  totalRecords,
  dataCompleteness,
  optimizationStatus,
}: DashboardContentProps) {
  // Make sure state and state.filters are defined
  const safeState = state || { activeTab: "overview", filters: {}, chartConfig: {}, queryHistory: [] }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      {safeState.activeTab === "overview" && (
        <OverviewTab
          filters={safeState.filters}
          setFilters={setFilters}
          metadata={metadata}
          totalRecords={totalRecords}
          dataCompleteness={dataCompleteness}
          optimizationStatus={optimizationStatus}
        />
      )}

      {safeState.activeTab === "explore" && (
        <ExploreTab
          filters={safeState.filters}
          chartConfig={safeState.chartConfig}
          setFilters={setFilters}
          setChartConfig={setChartConfig}
          metadata={metadata}
          dataCompleteness={dataCompleteness}
          optimizationStatus={optimizationStatus}
        />
      )}

      {safeState.activeTab === "insights" && (
        <InsightsTab
          addQueryToHistory={addQueryToHistory}
          queryHistory={safeState.queryHistory}
          dataCompleteness={dataCompleteness}
        />
      )}

      {safeState.activeTab === "settings" && (
        <SettingsTab
          dataCompleteness={dataCompleteness}
          totalRecords={totalRecords}
          optimizationStatus={optimizationStatus}
        />
      )}
    </main>
  )
}
