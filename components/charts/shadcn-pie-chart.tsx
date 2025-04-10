"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { useTheme } from "next-themes"

interface PieChartProps {
  data: any[]
  title?: string
  description?: string
  selectedYear?: string
  currency?: "IDR" | "USD"
}

export function ShadcnPieChart({
  data,
  title = "Investment Distribution",
  description,
  selectedYear,
  currency = "IDR",
}: PieChartProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const textColor = isDark ? "#E5E7EB" : "#374151"

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

  // Filter data for the selected year
  const yearData = selectedYear && selectedYear !== "All Years" ? data.find((item) => item.year === selectedYear) : null

  // If no specific year is selected or no data for the year, calculate totals
  let pmaTotal = 0
  let pmdnTotal = 0

  if (yearData) {
    // For IDR, convert PMA from USD to IDR
    pmaTotal = currency === "IDR" ? (yearData.pma * 15) / 1000000 : yearData.pma / 1000 // Convert to billions IDR or millions USD
    pmdnTotal = currency === "IDR" ? yearData.pmdn / 1000000 : yearData.pmdn / 15 / 1000 // Convert to billions IDR or millions USD
  } else {
    data.forEach((item) => {
      // For IDR, convert PMA from USD to IDR
      pmaTotal += currency === "IDR" ? (item.pma * 15) / 1000000 : item.pma / 1000 // Convert to billions IDR or millions USD
      pmdnTotal += currency === "IDR" ? item.pmdn / 1000000 : item.pmdn / 15 / 1000 // Convert to billions IDR or millions USD
    })
  }

  const chartData = [
    { name: "PMA", value: pmaTotal },
    { name: "PMDN", value: pmdnTotal },
  ]

  const total = pmaTotal + pmdnTotal
  const pmaPercentage = total > 0 ? (pmaTotal / total) * 100 : 0
  const pmdnPercentage = total > 0 ? (pmdnTotal / total) * 100 : 0

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

  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    return `${formatCurrency(value, name)} (${((value / total) * 100).toFixed(1)}%)`
  }

  // Custom label formatter for tooltip
  const labelFormatter = (label: string) => {
    return label
  }

  // Custom label renderer for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill={textColor}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    )
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
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={
                  chartData.length > 0 && chartData.some((item) => item.value > 0)
                    ? chartData
                    : [{ name: "No Data", value: 1 }]
                }
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={renderCustomizedLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                <Cell key="cell-0" fill={chartConfig.pma.color} /> {/* Dark grey for PMA */}
                <Cell key="cell-1" fill={chartConfig.pmdn.color} /> {/* Light grey for PMDN */}
              </Pie>
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
              />
              <Legend
                formatter={(value) => (value === "PMDN" ? "PMDN" : "PMA")}
                wrapperStyle={{ paddingTop: "20px", bottom: "0px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div>
            <div className="text-xs text-muted-foreground">PMA</div>
            <div className="font-medium">{pmaPercentage.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">{formatCurrency(pmaTotal, "PMA")}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">PMDN</div>
            <div className="font-medium">{pmdnPercentage.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">{formatCurrency(pmdnTotal, "PMDN")}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
