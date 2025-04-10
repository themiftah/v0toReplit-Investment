"use client"

import type { InvestmentData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, Users, Briefcase } from "lucide-react"
import { calculateTotalInvestment, calculatePmaInvestment, calculatePmdnInvestment } from "@/lib/data-processor"

interface OverviewMetricsProps {
  data: InvestmentData[] | undefined
  currency: "IDR" | "USD"
  selectedYear?: number | null
}

export function OverviewMetrics({ data, currency, selectedYear }: OverviewMetricsProps) {
  // Add null check to handle undefined data
  if (!data || !Array.isArray(data)) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Data Available</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">Waiting for data...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter data by selected year if provided
  const filteredData = selectedYear ? data.filter((item) => item.Tahun === selectedYear) : data

  // Calculate investments using our helper functions
  const totalInvestmentIDR = calculateTotalInvestment(filteredData)
  const pmaInvestmentUSD = calculatePmaInvestment(filteredData)
  const pmdnInvestmentIDR = calculatePmdnInvestment(filteredData)

  // Display value based on selected currency
  const displayValue =
    currency === "IDR"
      ? totalInvestmentIDR.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " B IDR"
      : pmaInvestmentUSD.toLocaleString("en-US", { maximumFractionDigits: 2 }) + " M USD"

  // Calculate total projects with null check
  const totalProjects = filteredData.reduce((sum, item) => sum + (item.Proyek || 0), 0)

  // Calculate total employment with null checks
  const totalTKI = filteredData.reduce((sum, item) => sum + (item.TKI || 0), 0)
  const totalTKA = filteredData.reduce((sum, item) => sum + (item.TKA || 0), 0)

  // Calculate year-over-year growth
  let growthRate = 0
  let pmaGrowthRate = 0
  let pmdnGrowthRate = 0
  let previousYearData: InvestmentData[] = []
  let previousYear = 0

  if (selectedYear) {
    // If a specific year is selected, compare with previous year
    previousYear = selectedYear - 1
    previousYearData = data.filter((item) => item.Tahun === previousYear)

    const previousYearInvestment = calculateTotalInvestment(previousYearData)
    growthRate =
      previousYearInvestment > 0 ? ((totalInvestmentIDR - previousYearInvestment) / previousYearInvestment) * 100 : 0

    // Calculate PMA growth
    const previousYearPMA = calculatePmaInvestment(previousYearData)
    pmaGrowthRate = previousYearPMA > 0 ? ((pmaInvestmentUSD - previousYearPMA) / previousYearPMA) * 100 : 0

    // Calculate PMDN growth
    const previousYearPMDN = calculatePmdnInvestment(previousYearData)
    pmdnGrowthRate = previousYearPMDN > 0 ? ((pmdnInvestmentIDR - previousYearPMDN) / previousYearPMDN) * 100 : 0
  } else {
    // If no specific year is selected, compare latest year with previous year
    const years = [...new Set(data.map((item) => item.Tahun))].sort((a, b) => b - a)
    if (years.length >= 2) {
      const latestYear = years[0]
      previousYear = years[1]

      const latestYearData = data.filter((item) => item.Tahun === latestYear)
      previousYearData = data.filter((item) => item.Tahun === previousYear)

      const latestYearInvestment = calculateTotalInvestment(latestYearData)
      const previousYearInvestment = calculateTotalInvestment(previousYearData)

      growthRate =
        previousYearInvestment > 0
          ? ((latestYearInvestment - previousYearInvestment) / previousYearInvestment) * 100
          : 0

      // Calculate PMA growth
      const latestYearPMA = calculatePmaInvestment(latestYearData)
      const previousYearPMA = calculatePmaInvestment(previousYearData)
      pmaGrowthRate = previousYearPMA > 0 ? ((latestYearPMA - previousYearPMA) / previousYearPMA) * 100 : 0

      // Calculate PMDN growth
      const latestYearPMDN = calculatePmdnInvestment(latestYearData)
      const previousYearPMDN = calculatePmdnInvestment(previousYearData)
      pmdnGrowthRate = previousYearPMDN > 0 ? ((latestYearPMDN - previousYearPMDN) / previousYearPMDN) * 100 : 0
    }
  }

  // Format YoY text
  const yoyText = selectedYear ? `vs ${previousYear}` : "from previous year"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayValue}</div>
          {previousYearData.length > 0 && (
            <p className="text-xs mt-1">
              {growthRate >= 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUpIcon className="mr-1 h-4 w-4" />+
                  {Math.abs(growthRate).toLocaleString("en-US", { maximumFractionDigits: 1 })}% {yoyText}
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDownIcon className="mr-1 h-4 w-4" />-
                  {Math.abs(growthRate).toLocaleString("en-US", { maximumFractionDigits: 1 })}% {yoyText}
                </span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investment Breakdown</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-md font-medium flex items-center">
            <span>PMDN: {pmdnInvestmentIDR.toLocaleString("en-US", { maximumFractionDigits: 2 })} B IDR</span>
            {previousYearData.length > 0 && (
              <span className={pmdnGrowthRate >= 0 ? "text-green-500 ml-2 text-xs" : "text-red-500 ml-2 text-xs"}>
                {pmdnGrowthRate >= 0 ? "+" : ""}
                {pmdnGrowthRate.toLocaleString("en-US", { maximumFractionDigits: 1 })}%
              </span>
            )}
          </div>
          <div className="text-md font-medium flex items-center">
            <span>PMA: {pmaInvestmentUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })} M USD</span>
            {previousYearData.length > 0 && (
              <span className={pmaGrowthRate >= 0 ? "text-green-500 ml-2 text-xs" : "text-red-500 ml-2 text-xs"}>
                {pmaGrowthRate >= 0 ? "+" : ""}
                {pmaGrowthRate.toLocaleString("en-US", { maximumFractionDigits: 1 })}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Combined in IDR: {totalInvestmentIDR.toLocaleString("en-US", { maximumFractionDigits: 2 })} B
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Across all sectors and regions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employment</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-md font-medium">TKI: {totalTKI.toLocaleString()}</div>
          <div className="text-md font-medium">TKA: {totalTKA.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ratio TKA/TKI:{" "}
            {totalTKI > 0 ? (totalTKA / totalTKI).toLocaleString("en-US", { maximumFractionDigits: 3 }) : "N/A"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
