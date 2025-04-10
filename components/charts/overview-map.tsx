"use client"
import type { InvestmentData } from "@/lib/types"

interface OverviewMapProps {
  data: InvestmentData[] | undefined
  loading: boolean
}

export function OverviewMap({ data, loading }: OverviewMapProps) {
  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading map data...</p>
        </div>
      </div>
    )
  }

  // For now, we'll just show a placeholder
  // In a real implementation, you would use a mapping library like react-simple-maps
  return (
    <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-md">
      <p className="text-muted-foreground">Map visualization coming soon</p>
    </div>
  )
}
