"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import type { InvestmentData } from "@/lib/types"
import { useTheme } from "next-themes"

interface TopCountriesProps {
  data: InvestmentData[]
}

export function TopCountries({ data }: TopCountriesProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const countryData = useMemo(() => {
    if (!data.length) return []

    // Filter for PMA (foreign investment) only
    const pmaData = data.filter((item) => item.Status === "PMA")

    // Group by country and calculate total investment
    const countryMap = new Map<string, number>()

    pmaData.forEach((item) => {
      if (!item.Negara || item.Negara === "Indonesia") return

      const country = item.Negara

      if (!countryMap.has(country)) {
        countryMap.set(country, 0)
      }

      // Convert USD to IDR for consistent comparison
      const exchangeRate = 15000 // Approximate exchange rate
      const investmentValue = (item.TambahanInvestasiDalamUSDRibu * exchangeRate) / 1000000 // Convert to billions IDR

      countryMap.set(country, countryMap.get(country)! + investmentValue)
    })

    // Convert to array and sort by investment value (descending)
    return Array.from(countryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Get top 5
  }, [data])

  if (countryData.length === 0) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={countryData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 60 }}>
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
          <Bar dataKey="value" name="PMA Investment" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
