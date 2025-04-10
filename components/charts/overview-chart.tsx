"use client"

import { useEffect, useState, useMemo } from "react"
import type { InvestmentData } from "@/lib/types"
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Bar,
  BarChart,
  Label,
} from "recharts"
import { APBN_RATES } from "@/lib/constants"
import { useTheme } from "next-themes"

interface OverviewChartProps {
  data: InvestmentData[] | undefined
  timeRange: "yearly"
  currency: "IDR" | "USD"
  loading: boolean
  highlightYear?: number | null
}

export function OverviewChart({ data, timeRange, currency, loading, highlightYear }: OverviewChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const processedData = useMemo(() => {
    // Add null check to handle undefined data
    if (loading || !data || !Array.isArray(data) || data.length === 0) {
      return []
    }

    // If a specific year is selected, only show that year's data
    if (highlightYear) {
      const yearData = data.filter((item) => item.Tahun === highlightYear)

      // Group by status (PMA/PMDN)
      const statusData = {
        name: highlightYear.toString(),
        PMDN: 0,
        PMA: 0,
        total: 0,
      }

      yearData.forEach((item) => {
        if (item.Status === "PMDN") {
          const pmdnValue = item.InvestasiRpJuta / 1000000 // Convert to billions IDR
          statusData.PMDN += pmdnValue
          statusData.total += pmdnValue
        } else if (item.Status === "PMA") {
          const exchangeRate = APBN_RATES[highlightYear.toString()] || 15000
          const pmaValue = (item.TambahanInvestasiDalamUSDRibu * 1000 * exchangeRate) / 1000000000 // Convert to billions IDR
          statusData.PMA += pmaValue
          statusData.total += pmaValue
        }
      })

      return [statusData]
    }

    // Group by year for all data
    const yearlyData = data.reduce(
      (acc, item) => {
        const year = item.Tahun?.toString() || "Unknown"
        if (!acc[year]) {
          acc[year] = {
            name: year,
            PMDN: 0,
            PMA: 0,
            total: 0,
            previousTotal: 0,
            growth: 0,
          }
        }

        // Add PMDN (domestic investment in IDR)
        if (item.Status === "PMDN") {
          const pmdnValue = item.InvestasiRpJuta / 1000000 // Convert to billions IDR
          acc[year].PMDN += pmdnValue

          // Add to total in IDR
          acc[year].total += pmdnValue
        }

        // Add PMA (foreign investment in USD)
        if (item.Status === "PMA") {
          const pmaValueUSD = item.TambahanInvestasiDalamUSDRibu / 1000 // Convert to millions USD

          if (currency === "USD") {
            acc[year].PMA += pmaValueUSD
          } else {
            // Convert to IDR for display
            const exchangeRate = APBN_RATES[year] || 14000
            const pmaValueIDR = (item.TambahanInvestasiDalamUSDRibu * 1000 * exchangeRate) / 1000000000 // Convert to billions IDR
            acc[year].PMA += pmaValueIDR
            acc[year].total += pmaValueIDR
          }
        }

        return acc
      },
      {} as Record<string, any>,
    )

    // Convert to array and sort by year
    const sortedData = Object.values(yearlyData).sort((a, b) => Number.parseInt(a.name) - Number.parseInt(b.name))

    // Calculate growth rates
    for (let i = 1; i < sortedData.length; i++) {
      const currentYear = sortedData[i]
      const previousYear = sortedData[i - 1]

      currentYear.previousTotal = previousYear.total

      if (previousYear.total > 0) {
        currentYear.growth = ((currentYear.total - previousYear.total) / previousYear.total) * 100
      }
    }

    return sortedData
  }, [data, loading, currency, highlightYear])

  useEffect(() => {
    setChartData(processedData)
  }, [processedData])

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading chart data...</p>
        </div>
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-muted-foreground">No data available for the selected filters</p>
      </div>
    )
  }

  // Colors for the bars - make them clearly distinct
  const PMDN_COLOR = "#2563eb" // Darker blue for PMDN
  const PMA_COLOR = "#f97316" // Orange for PMA

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
          <XAxis
            dataKey="name"
            stroke={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
            tick={{ fontSize: 12, fill: isDark ? "#e5e5e5" : "#333333" }}
          >
            <Label
              value="Year"
              position="insideBottom"
              offset={-10}
              style={{ textAnchor: "middle", fill: isDark ? "#e5e5e5" : "#333333" }}
            />
          </XAxis>
          <YAxis
            stroke={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
            tick={{ fontSize: 12, fill: isDark ? "#e5e5e5" : "#333333" }}
            tickFormatter={(value) => `${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            label={{
              value: currency === "IDR" ? "Billion IDR" : "Million USD",
              angle: -90,
              position: "insideLeft",
              style: { fill: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", fontSize: 12 },
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "PMDN")
                return [
                  `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency === "IDR" ? "B IDR" : "M USD"}`,
                  "PMDN",
                ]
              if (name === "PMA")
                return [
                  `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency === "IDR" ? "B IDR" : "M USD"}`,
                  "PMA",
                ]
              if (name === "growth")
                return [`${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`, "Growth"]
              return [
                `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency === "IDR" ? "B IDR" : "M USD"}`,
                name,
              ]
            }}
            contentStyle={{
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              borderColor: isDark ? "#333333" : "#e5e5e5",
              borderRadius: "0.5rem",
              color: isDark ? "#e5e5e5" : "#333333",
            }}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend verticalAlign="bottom" height={50} wrapperStyle={{ paddingTop: "20px", bottom: "0px" }} />

          {/* Render bars with explicit colors - PMDN at bottom, PMA on top */}
          <Bar dataKey="PMDN" name="PMDN" stackId="investment" fill={PMDN_COLOR} />
          <Bar dataKey="PMA" name="PMA" stackId="investment" fill={PMA_COLOR} />

          {highlightYear && (
            <ReferenceLine
              x={highlightYear.toString()}
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              strokeDasharray="3 3"
              label={{
                value: highlightYear.toString(),
                position: "top",
                fill: "hsl(var(--destructive))",
                fontSize: 12,
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
