"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { InvestmentData } from "@/lib/types"
import { LightbulbIcon, Loader2, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InsightsTabProps {
  data: InvestmentData[]
  metadata: any
}

export function InsightsTab({ data, metadata }: InsightsTabProps) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)

    // Simulate AI analysis response
    setTimeout(() => {
      setResult(generateInsight(query, data))
      setLoading(false)
    }, 1500)
  }

  // Function to generate a simulated insight based on the query
  const generateInsight = (query: string, data: InvestmentData[]) => {
    const lowerQuery = query.toLowerCase()

    // Calculate total investment
    const totalInvestment =
      data.reduce((total, item) => {
        if (item.Status === "PMDN") {
          return total + item.InvestasiRpJuta
        } else {
          // PMA
          return total + item.TambahanInvestasiDalamUSDRibu * 15 // Convert to IDR
        }
      }, 0) / 1000 // Convert to billions

    // Calculate PMA and PMDN totals
    const pmaTotal =
      data.reduce((total, item) => {
        if (item.Status === "PMA") {
          return total + item.TambahanInvestasiDalamUSDRibu * 15
        }
        return total
      }, 0) / 1000 // Convert to billions

    const pmdnTotal =
      data.reduce((total, item) => {
        if (item.Status === "PMDN") {
          return total + item.InvestasiRpJuta
        }
        return total
      }, 0) / 1000 // Convert to billions

    if (lowerQuery.includes("top") && lowerQuery.includes("sector")) {
      const sectors = data.reduce(
        (acc, item) => {
          const sector = item.SektorUtama
          if (!acc[sector]) {
            acc[sector] = {
              pma: 0,
              pmdn: 0,
              total: 0,
            }
          }

          if (item.Status === "PMA") {
            const pmaValue = (item.TambahanInvestasiDalamUSDRibu * 15) / 1000 // Convert to billions IDR
            acc[sector].pma += pmaValue
            acc[sector].total += pmaValue
          } else {
            // PMDN
            const pmdnValue = item.InvestasiRpJuta / 1000 // Convert to billions
            acc[sector].pmdn += pmdnValue
            acc[sector].total += pmdnValue
          }

          return acc
        },
        {} as Record<string, { pma: number; pmdn: number; total: number }>,
      )

      const topSector = Object.entries(sectors).sort((a, b) => b[1].total - a[1].total)[0]

      return `The top sector is ${topSector[0]} with total investment of ${topSector[1].total.toFixed(2)} Billion IDR (PMA: ${topSector[1].pma.toFixed(2)} B, PMDN: ${topSector[1].pmdn.toFixed(2)} B).`
    }

    if (lowerQuery.includes("growth") || lowerQuery.includes("trend")) {
      const yearlyData = data.reduce(
        (acc, item) => {
          const year = item.Tahun
          if (!acc[year]) {
            acc[year] = {
              pma: 0,
              pmdn: 0,
              total: 0,
            }
          }

          if (item.Status === "PMA") {
            const pmaValue = (item.TambahanInvestasiDalamUSDRibu * 15) / 1000 // Convert to billions IDR
            acc[year].pma += pmaValue
            acc[year].total += pmaValue
          } else {
            // PMDN
            const pmdnValue = item.InvestasiRpJuta / 1000 // Convert to billions
            acc[year].pmdn += pmdnValue
            acc[year].total += pmdnValue
          }

          return acc
        },
        {} as Record<number, { pma: number; pmdn: number; total: number }>,
      )

      const years = Object.keys(yearlyData).map(Number).sort()

      if (years.length < 2) {
        return "Not enough yearly data to analyze growth trends."
      }

      const latestYear = years[years.length - 1]
      const previousYear = years[years.length - 2]

      const growth =
        ((yearlyData[latestYear].total - yearlyData[previousYear].total) / yearlyData[previousYear].total) * 100

      return `From ${previousYear} to ${latestYear}, total investment ${growth >= 0 ? "grew" : "decreased"} by ${Math.abs(growth).toFixed(2)}%. PMA ${yearlyData[latestYear].pma > yearlyData[previousYear].pma ? "increased" : "decreased"} by ${Math.abs(((yearlyData[latestYear].pma - yearlyData[previousYear].pma) / yearlyData[previousYear].pma) * 100).toFixed(2)}%, while PMDN ${yearlyData[latestYear].pmdn > yearlyData[previousYear].pmdn ? "increased" : "decreased"} by ${Math.abs(((yearlyData[latestYear].pmdn - yearlyData[previousYear].pmdn) / yearlyData[previousYear].pmdn) * 100).toFixed(2)}%.`
    }

    if (lowerQuery.includes("average") || lowerQuery.includes("mean")) {
      const avgPMA = pmaTotal / data.filter((item) => item.Status === "PMA").length
      const avgPMDN = pmdnTotal / data.filter((item) => item.Status === "PMDN").length

      return `The average investment amount is ${(totalInvestment / data.length).toFixed(2)} Billion IDR. Average PMA investment is ${avgPMA.toFixed(2)} Billion IDR, while average PMDN investment is ${avgPMDN.toFixed(2)} Billion IDR.`
    }

    if (lowerQuery.includes("region") || lowerQuery.includes("province")) {
      const regions = data.reduce(
        (acc, item) => {
          const region = item.Wilayah
          if (!acc[region]) {
            acc[region] = {
              pma: 0,
              pmdn: 0,
              total: 0,
            }
          }

          if (item.Status === "PMA") {
            const pmaValue = (item.TambahanInvestasiDalamUSDRibu * 15) / 1000 // Convert to billions IDR
            acc[region].pma += pmaValue
            acc[region].total += pmaValue
          } else {
            // PMDN
            const pmdnValue = item.InvestasiRpJuta / 1000 // Convert to billions
            acc[region].pmdn += pmdnValue
            acc[region].total += pmdnValue
          }

          return acc
        },
        {} as Record<string, { pma: number; pmdn: number; total: number }>,
      )

      const topRegion = Object.entries(regions).sort((a, b) => b[1].total - a[1].total)[0]

      return `The region with the highest investment is ${topRegion[0]} with total investment of ${topRegion[1].total.toFixed(2)} Billion IDR (PMA: ${topRegion[1].pma.toFixed(2)} B, PMDN: ${topRegion[1].pmdn.toFixed(2)} B).`
    }

    if (lowerQuery.includes("pma") || lowerQuery.includes("foreign")) {
      const pmaPercentage = (pmaTotal / totalInvestment) * 100

      const countries = data
        .filter((item) => item.Status === "PMA")
        .reduce(
          (acc, item) => {
            const country = item.Negara
            if (!acc[country]) {
              acc[country] = 0
            }

            acc[country] += (item.TambahanInvestasiDalamUSDRibu * 15) / 1000 // Convert to billions IDR

            return acc
          },
          {} as Record<string, number>,
        )

      const topCountry = Object.entries(countries).sort((a, b) => b[1] - a[1])[0]

      return `PMA (foreign investment) accounts for ${pmaPercentage.toFixed(2)}% of total investment (${pmaTotal.toFixed(2)} Billion IDR). The top country for foreign investment is ${topCountry[0]} with ${topCountry[1].toFixed(2)} Billion IDR.`
    }

    if (lowerQuery.includes("pmdn") || lowerQuery.includes("domestic")) {
      const pmdnPercentage = (pmdnTotal / totalInvestment) * 100

      return `PMDN (domestic investment) accounts for ${pmdnPercentage.toFixed(2)}% of total investment (${pmdnTotal.toFixed(2)} Billion IDR).`
    }

    return "I'd need more specific information to provide insights on the investment data. Try asking about top sectors, growth trends, regional distribution, PMA vs PMDN breakdown, or average investments."
  }

  const suggestedQueries = [
    "What is the top investment sector?",
    "How has investment grown over time?",
    "What is the average investment amount?",
    "Which region has the highest investment?",
    "What is the breakdown of PMA investments by country?",
    "What is the ratio of PMA to PMDN investments?",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AI Insights</h1>
        <p className="text-muted-foreground">Ask questions about your investment data to get insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-yellow-500" />
            Data Assistant
          </CardTitle>
          <CardDescription>Ask any question about the investment data</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="e.g., What is the top investment sector?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Ask
            </Button>
          </form>

          {result && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md">
              <p>{result}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Suggested questions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map((q, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setQuery(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          Note: This is a simulated AI assistant for demonstration purposes
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium mb-1">Total Records</h3>
              <p className="text-2xl font-bold">{data.length.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium mb-1">Total Investment</h3>
              <p className="text-2xl font-bold">
                {(
                  data.reduce((total, item) => {
                    if (item.Status === "PMDN") {
                      return total + item.InvestasiRpJuta
                    } else {
                      // PMA
                      return total + item.TambahanInvestasiDalamUSDRibu * 15 // Convert to IDR
                    }
                  }, 0) / 1000
                ).toFixed(2)}{" "}
                B
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium mb-1">Year Range</h3>
              <p className="text-2xl font-bold">
                {Math.min(...data.map((item) => item.Tahun))} - {Math.max(...data.map((item) => item.Tahun))}
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium mb-1">PMA vs PMDN</h3>
              <p className="text-2xl font-bold">
                {data.filter((item) => item.Status === "PMA").length} /{" "}
                {data.filter((item) => item.Status === "PMDN").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
