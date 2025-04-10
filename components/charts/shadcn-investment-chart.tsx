"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useTheme } from "next-themes"

interface InvestmentChartProps {
  data: any[]
  title?: string
  description?: string
  selectedYear?: string
  currency?: "IDR" | "USD"
}

export function ShadcnInvestmentChart({
  data,
  title = "Investment Trends",
  description = "PMA and PMDN Investment Trends",
  selectedYear,
  currency = "IDR",
}: InvestmentChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const textColor = isDark ? "#E5E7EB" : "#374151"
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"

  // Check if data is available and valid
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] bg-muted/20">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  // Update the chartConfig to use grey colors
  const chartConfig = {
    pma: {
      label: "PMA",
      color: isDark ? "#9CA3AF" : "#6B7280", // dark grey
    },
    pmdn: {
      label: "PMDN",
      color: isDark ? "#4B5563" : "#E5E7EB", // light grey
    },
  } satisfies ChartConfig

  // Format currency values
  const formatCurrency = (value: number, name: string) => {
    if (currency === "IDR") {
      return `${value.toFixed(2)} B IDR`
    } else {
      return `${value.toFixed(2)} M USD`
    }
  }

  // Add total to each data item for the tooltip
  const chartData = data.map((item) => {
    // For IDR, convert PMA from USD to IDR
    const pmaValue = currency === "IDR" ? item.pma * 15 : item.pma
    const pmdnValue = currency === "IDR" ? item.pmdn : item.pmdn / 15

    const pmaFormatted = currency === "IDR" ? pmaValue / 1000000 : pmaValue / 1000 // Convert to billions IDR or millions USD
    const pmdnFormatted = currency === "IDR" ? pmdnValue / 1000000 : pmdnValue / 1000 // Convert to billions IDR or millions USD

    return {
      year: item.year,
      pma: pmaFormatted,
      pmdn: pmdnFormatted,
      total: pmaFormatted + pmdnFormatted,
      pmaLabel: formatCurrency(pmaFormatted, "PMA"),
      pmdnLabel: formatCurrency(pmdnFormatted, "PMDN"),
    }
  })

  // Calculate total and year-over-year change
  const totalInvestment = chartData.reduce((sum, item) => sum + item.pma + item.pmdn, 0)

  // Calculate YoY change if a specific year is selected
  let yoyChange = 0
  let yoyChangePercent = 0

  if (selectedYear && selectedYear !== "All Years") {
    const currentYearData = chartData.find((item) => item.year === selectedYear)
    const previousYearData = chartData.find((item) => item.year === (Number.parseInt(selectedYear) - 1).toString())

    if (currentYearData && previousYearData) {
      const currentTotal = currentYearData.pma + currentYearData.pmdn
      const previousTotal = previousYearData.pma + previousYearData.pmdn
      yoyChange = currentTotal - previousTotal
      yoyChangePercent = (yoyChange / previousTotal) * 100
    }
  }

  // Format Y-axis ticks
  const formatYAxisTick = (value: number) => {
    if (value === 0) return "0"
    if (currency === "IDR") {
      return `${value.toFixed(0)}B`
    } else {
      return `${value.toFixed(0)}M`
    }
  }

  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    if (name === "pma") return formatCurrency(value, "PMA")
    if (name === "pmdn") return formatCurrency(value, "PMDN")
    return formatCurrency(value, name)
  }

  // Custom label formatter for tooltip
  const labelFormatter = (label: string) => {
    return `Year: ${label}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.length > 0 ? chartData : [{ year: "No Data", pma: 0, pmdn: 0 }]}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={4}
              barCategoryGap={16}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: textColor }}
                stroke={gridColor}
              />
              <YAxis
                tickFormatter={formatYAxisTick}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: textColor }}
                width={40}
                stroke={gridColor}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    payload={payload}
                    label={label}
                    formatter={tooltipFormatter}
                    labelFormatter={labelFormatter}
                  />
                )}
                cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
              />
              <Legend
                formatter={(value) => (value === "pmdn" ? "PMDN" : "PMA")}
                wrapperStyle={{ paddingTop: "10px" }}
              />
              <Bar
                dataKey="pmdn"
                stackId="a"
                fill={chartConfig.pmdn.color}
                radius={[0, 0, 0, 0]}
                name="pmdn"
                isAnimationActive={false}
              />
              <Bar
                dataKey="pma"
                stackId="a"
                fill={chartConfig.pma.color}
                radius={[4, 4, 0, 0]}
                name="pma"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {selectedYear && selectedYear !== "All Years" ? (
          <div className="flex gap-2 font-medium leading-none">
            {yoyChangePercent > 0 ? (
              <>
                Trending up by {yoyChangePercent.toFixed(1)}% from previous year
                <TrendingUp className="h-4 w-4 text-green-500" />
              </>
            ) : (
              <>
                Trending down by {Math.abs(yoyChangePercent).toFixed(1)}% from previous year
                <TrendingDown className="h-4 w-4 text-red-500" />
              </>
            )}
          </div>
        ) : (
          <div className="leading-none text-muted-foreground">
            Total investment:{" "}
            {currency === "IDR" ? `${totalInvestment.toFixed(2)} B IDR` : `${totalInvestment.toFixed(2)} M USD`}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
