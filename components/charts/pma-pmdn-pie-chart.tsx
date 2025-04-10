"use client"

import { useMemo } from "react"
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts"
import type { InvestmentData } from "@/lib/types"
import { useTheme } from "next-themes"

interface PmaPmdnPieChartProps {
  data: InvestmentData[]
  selectedYear: number | null
}

export function PmaPmdnPieChart({ data, selectedYear }: PmaPmdnPieChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const pieData = useMemo(() => {
    if (!data.length) return []

    // Filter by selected year if provided
    const filteredData = selectedYear ? data.filter((item) => item.Tahun === selectedYear) : data

    // Calculate total PMA and PMDN
    let totalPMA = 0
    let totalPMDN = 0

    filteredData.forEach((item) => {
      if (item.Status === "PMA") {
        // Convert USD to IDR for consistent comparison
        const exchangeRate = 15000 // Approximate exchange rate
        totalPMA += (item.TambahanInvestasiDalamUSDRibu * exchangeRate) / 1000000 // Convert to billions IDR
      } else if (item.Status === "PMDN") {
        totalPMDN += item.InvestasiRpJuta / 1000000 // Convert to billions IDR
      }
    })

    // Create pie chart data
    return [
      { name: "PMDN", value: totalPMDN },
      { name: "PMA", value: totalPMA },
    ]
  }, [data, selectedYear])

  if (pieData.length === 0 || (pieData[0].value === 0 && pieData[1].value === 0)) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</div>
  }

  // Calculate total for percentage
  const total = pieData.reduce((sum, item) => sum + item.value, 0)

  // Colors for the pie chart - make them clearly distinct
  const COLORS = ["#2563eb", "#f97316"] // Blue for PMDN, Orange for PMA

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              `${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })} B IDR (${((value / total) * 100).toFixed(1)}%)`,
              "",
            ]}
            contentStyle={{
              backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
              border: `1px solid ${isDark ? "#333333" : "#e5e5e5"}`,
              borderRadius: "0.5rem",
              color: isDark ? "#e5e5e5" : "#333333",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
