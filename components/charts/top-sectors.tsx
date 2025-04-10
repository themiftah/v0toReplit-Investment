"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import type { InvestmentData } from "@/lib/types"
import { useTheme } from "next-themes"

interface TopSectorsProps {
  data: InvestmentData[]
}

export function TopSectors({ data }: TopSectorsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const sectorData = useMemo(() => {
    if (!data.length) return []

    // Group by main sector and calculate total investment
    const sectorMap = new Map<string, { pmdn: number; pma: number }>()

    data.forEach((item) => {
      if (!item.SektorUtama) return

      const sector = item.SektorUtama

      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, { pmdn: 0, pma: 0 })
      }

      const entry = sectorMap.get(sector)!

      if (item.Status === "PMDN") {
        entry.pmdn += item.InvestasiRpJuta / 1000000 // Convert to billions
      } else if (item.Status === "PMA") {
        // PMA - convert USD to IDR
        const exchangeRate = 15000 // Approximate exchange rate
        entry.pma += (item.TambahanInvestasiDalamUSDRibu * exchangeRate) / 1000000 // Convert to billions IDR
      }
    })

    // Convert to array and sort by total investment value (descending)
    return Array.from(sectorMap.entries())
      .map(([name, values]) => ({
        name,
        pmdn: values.pmdn,
        pma: values.pma,
        total: values.pmdn + values.pma,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5) // Get top 5
  }, [data])

  if (sectorData.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</div>
  }

  // Truncate long sector names
  const processedData = sectorData.map((item) => ({
    ...item,
    shortName: item.name.length > 15 ? item.name.substring(0, 13) + "..." : item.name,
  }))

  // Colors for the bars - make them clearly distinct
  const PMDN_COLOR = "#2563eb" // Darker blue for PMDN
  const PMA_COLOR = "#f97316" // Orange for PMA

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }} // Increased bottom margin for legend
          layout="vertical"
        >
          <XAxis
            type="number"
            tickFormatter={(value) => `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
            tick={{ fill: isDark ? "#e5e5e5" : "#333333" }}
          />
          <YAxis
            dataKey="shortName"
            type="category"
            width={100}
            tick={{ fontSize: 12, fill: isDark ? "#e5e5e5" : "#333333" }}
          />
          <Tooltip
            formatter={(value: number) => [
              `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} B IDR`,
              "",
            ]}
            labelFormatter={(label) => {
              const item = processedData.find((item) => item.shortName === label)
              return item ? item.name : label
            }}
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
