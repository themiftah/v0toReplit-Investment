"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { ShadcnInvestmentChart } from "@/components/charts/shadcn-investment-chart"
import { ShadcnDistributionChart } from "@/components/charts/shadcn-distribution-chart"
import { ShadcnPieChart } from "@/components/charts/shadcn-pie-chart"

interface OverviewTabProps {
  data: any[]
  metadata: any
  selectedYear: number | null
  setSelectedYear: (year: number | null) => void
  currency: "IDR" | "USD"
  setCurrency: (currency: "IDR" | "USD") => void
}

export function OverviewTab({
  data,
  metadata,
  selectedYear,
  setSelectedYear,
  currency,
  setCurrency,
}: OverviewTabProps) {
  const [investmentData, setInvestmentData] = useState<any[]>([])
  const [sectorData, setSectorData] = useState<any[]>([])
  const [provinceData, setProvinceData] = useState<any[]>([])
  const [regionData, setRegionData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalInvestment: 0,
    pmaInvestment: 0,
    pmdnInvestment: 0,
    totalProjects: 0,
  })

  useEffect(() => {
    // Process the data
    setIsLoading(true)

    // Calculate metrics
    let totalInvestment = 0
    let pmaInvestment = 0
    let pmdnInvestment = 0
    let totalProjects = 0

    // Filter data by selected year if needed
    const filteredData = selectedYear ? data.filter((item) => item.Tahun === selectedYear) : data

    filteredData.forEach((item) => {
      if (item.Status === "PMA") {
        pmaInvestment += item.TambahanInvestasiDalamUSDRibu
      } else {
        pmdnInvestment += item.InvestasiRpJuta
      }
      totalProjects += item.Proyek
    })

    // Convert PMA to IDR for total calculation
    const pmaInIDR = pmaInvestment * 15 // Simplified conversion
    totalInvestment = pmdnInvestment + pmaInIDR

    setMetrics({
      totalInvestment,
      pmaInvestment,
      pmdnInvestment,
      totalProjects,
    })

    // Group by year for investment trend data
    const yearMap = new Map()
    data.forEach((item) => {
      const year = item.Tahun.toString()
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          pma: 0,
          pmdn: 0,
        })
      }

      const yearData = yearMap.get(year)
      if (item.Status === "PMA") {
        yearData.pma += item.TambahanInvestasiDalamUSDRibu
      } else {
        yearData.pmdn += item.InvestasiRpJuta
      }
    })

    // Convert to array and sort by year
    const yearlyData = Array.from(yearMap.values()).sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year))
    setInvestmentData(yearlyData)

    // Group by sector
    const sectorMap = new Map()
    const provinceMap = new Map()
    const regionMap = new Map()

    filteredData.forEach((item) => {
      // Process sector data
      if (item.SektorUtama) {
        if (!sectorMap.has(item.SektorUtama)) {
          sectorMap.set(item.SektorUtama, {
            sector: item.SektorUtama,
            pma: 0,
            pmdn: 0,
          })
        }

        const sectorData = sectorMap.get(item.SektorUtama)
        if (item.Status === "PMA") {
          sectorData.pma += item.TambahanInvestasiDalamUSDRibu
        } else {
          sectorData.pmdn += item.InvestasiRpJuta
        }
      }

      // Process province data
      if (item.Provinsi) {
        if (!provinceMap.has(item.Provinsi)) {
          provinceMap.set(item.Provinsi, {
            province: item.Provinsi,
            pma: 0,
            pmdn: 0,
          })
        }

        const provinceData = provinceMap.get(item.Provinsi)
        if (item.Status === "PMA") {
          provinceData.pma += item.TambahanInvestasiDalamUSDRibu
        } else {
          provinceData.pmdn += item.InvestasiRpJuta
        }
      }

      // Process region data
      if (item.Wilayah) {
        if (!regionMap.has(item.Wilayah)) {
          regionMap.set(item.Wilayah, {
            region: item.Wilayah,
            pma: 0,
            pmdn: 0,
          })
        }

        const regionData = regionMap.get(item.Wilayah)
        if (item.Status === "PMA") {
          regionData.pma += item.TambahanInvestasiDalamUSDRibu
        } else {
          regionData.pmdn += item.InvestasiRpJuta
        }
      }
    })

    setSectorData(Array.from(sectorMap.values()))
    setProvinceData(Array.from(provinceMap.values()))
    setRegionData(Array.from(regionMap.values()))
    setIsLoading(false)
  }, [data, selectedYear])

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currency === "IDR"
                ? formatCurrency(metrics.totalInvestment, "IDR")
                : formatCurrency(metrics.totalInvestment / 15, "USD")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PMA (Foreign)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.pmaInvestment, "USD")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PMDN (Domestic)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.pmdnInvestment, "IDR")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalProjects)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={selectedYear === null ? "lg:col-span-2" : ""}>
          <ShadcnInvestmentChart
            data={investmentData}
            title="Investment Trends"
            description={
              selectedYear === null
                ? "PMA and PMDN Investment Trends (All Years)"
                : `PMA and PMDN Investment Trends (${selectedYear})`
            }
            selectedYear={selectedYear?.toString()}
            currency={currency}
          />
        </div>

        {selectedYear !== null && (
          <div>
            <ShadcnPieChart
              data={investmentData}
              title="PMA vs PMDN Distribution"
              description={`Distribution for ${selectedYear}`}
              selectedYear={selectedYear?.toString()}
              currency={currency}
            />
          </div>
        )}
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ShadcnDistributionChart
          data={sectorData}
          title="Top Sectors"
          description={selectedYear === null ? "All Years" : `Data for ${selectedYear}`}
          categoryKey="sector"
          selectedYear={selectedYear?.toString()}
          currency={currency}
        />

        <ShadcnDistributionChart
          data={provinceData}
          title="Top Provinces"
          description={selectedYear === null ? "All Years" : `Data for ${selectedYear}`}
          categoryKey="province"
          selectedYear={selectedYear?.toString()}
          currency={currency}
        />

        <ShadcnDistributionChart
          data={regionData}
          title="Top Regions"
          description={selectedYear === null ? "All Years" : `Data for ${selectedYear}`}
          categoryKey="region"
          selectedYear={selectedYear?.toString()}
          currency={currency}
        />
      </div>
    </div>
  )
}
