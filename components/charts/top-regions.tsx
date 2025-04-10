"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import type { InvestmentData } from "@/lib/types"
import { useTheme } from "next-themes"

interface TopRegionsProps {
  data: InvestmentData[]
}

export function TopRegions({ data }: TopRegionsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const regionData = useMemo(() => {
    if (!data.length) return []

    // Group by region and calculate total investment
    const regionMap = new Map<string, { pmdn: number; pma: number }>()

    data.forEach((item) => {
      if (!item.Wilayah) return

      const region = item.Wilayah

      if (!regionMap.has(region)) {
        regionMap.set(region, { pmdn: 0, pma: 0 })
      }

      const entry = regionMap.get(region)!

      if (item.Status === "PMDN") {
        entry.pmdn += item.InvestasiRpJuta / 1000000 // Convert to billions
      } else if (item.Status === "PMA") {
        // PMA - convert USD to IDR
        const exchangeRate = 15000 // Approximate exchange rate
        entry.pma += (item.TambahanInvestasiDalamUSDRibu * exchangeRate) / 1000000 // Convert to billions IDR
      }
    })

    // Convert to array and sort by total investment value (descending)
    return Array.from(regionMap.entries())
      .map(([name, values]) => ({
        name,
        pmdn: values.pmdn,
        pma: values.pma,
        total: values.pmdn + values.pma,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5) // Get top 5
  }, [data])

  if (regionData.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</div>
  }

  // Colors for the bars - make them clearly distinct
  const PMDN_COLOR = "#2563eb" // Darker blue for PMDN
  const PMA_COLOR = "#f97316" // Orange for PMA

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 60 }}>
          <XAxis
            type="number"
            tickFormatter={(value) => `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            tick={{ fill: isDark ? "#e5e5e5" : "#333333" }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: isDark ? "#e5e5e5" : "#333333" }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} B IDR`,
              "",
            ]}
            contentStyle={{
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              border: `1px solid ${isDark ? "#333333" : "#e5e5e5"}`,
              borderRadius: "0.5rem",
              color: isDark ? "#e5e5e5" : "#333333",
            }}
          />
          <Legend verticalAlign="bottom" height={50} wrapperStyle={{ paddingTop: "20px", bottom: "0px" }} />

          {/* Render bars side by side (not stacked) with explicit colors */}
          <Bar dataKey="pmdn" name="PMDN" fill={PMDN_COLOR} />
          <Bar dataKey="pma" name="PMA" fill={PMA_COLOR} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
