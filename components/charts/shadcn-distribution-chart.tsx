"use client"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useTheme } from "next-themes"

interface DistributionChartProps {
  data: any[]
  title: string
  description?: string
  categoryKey: string
  selectedYear?: string
  currency?: "IDR" | "USD"
}

export function ShadcnDistributionChart({
  data,
  title,
  description,
  categoryKey,
  selectedYear,
  currency = "IDR",
}: DistributionChartProps) {
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
          <CardDescription>{description || "No data available"}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] bg-muted/20">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  // Format data for the chart - take top 5 items
  const sortedData = [...data].sort((a, b) => {
    // For IDR, convert PMA from USD to IDR
    const aTotal = currency === "IDR" ? a.pmdn + a.pma * 15 : a.pmdn / 15 + a.pma
    const bTotal = currency === "IDR" ? b.pmdn + b.pma * 15 : b.pmdn / 15 + b.pma

    return bTotal - aTotal
  })

  const topItems = sortedData.slice(0, 5)

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

  // Add total to each data item
  const chartData = topItems.map((item) => {
    // For IDR, convert PMA from USD to IDR
    const pmaValue = currency === "IDR" ? item.pma * 15 : item.pma
    const pmdnValue = currency === "IDR" ? item.pmdn : item.pmdn / 15

    const pmaFormatted = currency === "IDR" ? pmaValue / 1000000 : pmaValue / 1000 // Convert to billions IDR or millions USD
    const pmdnFormatted = currency === "IDR" ? pmdnValue / 1000000 : pmdnValue / 1000 // Convert to billions IDR or millions USD

    return {
      name: item[categoryKey],
      pma: pmaFormatted,
      pmdn: pmdnFormatted,
      total: pmaFormatted + pmdnFormatted,
      pmaLabel: formatCurrency(pmaFormatted, "PMA"),
      pmdnLabel: formatCurrency(pmdnFormatted, "PMDN"),
    }
  })

  // Calculate total
  const totalValue = chartData.reduce((sum, item) => sum + item.pma + item.pmdn, 0)

  // Format Y-axis ticks
  const formatYAxisTick = (value: number) => {
    if (value === 0) return "0"
    if (currency === "IDR") {
      return `${value.toFixed(1)}B`
    } else {
      return `${value.toFixed(1)}M`
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
    return label
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description || (selectedYear !== "All Years" ? `Data for ${selectedYear}` : "All Years")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.length > 0 ? chartData : [{ name: "No Data", pma: 0, pmdn: 0 }]}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={4}
              barCategoryGap={16}
            >
              <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                type="number"
                domain={[0, "dataMax"]}
                tickFormatter={formatYAxisTick}
                tick={{ fill: textColor }}
                stroke={gridColor}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={100}
                tick={{ fill: textColor, fontSize: 12 }}
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
                fill={chartConfig.pmdn.color}
                radius={[0, 4, 4, 0]}
                name="pmdn"
                isAnimationActive={false}
              />
              <Bar
                dataKey="pma"
                fill={chartConfig.pma.color}
                radius={[0, 4, 4, 0]}
                name="pma"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Total: {currency === "IDR" ? `${totalValue.toFixed(2)} B IDR` : `${totalValue.toFixed(2)} M USD`}
        </div>
      </CardFooter>
    </Card>
  )
}
