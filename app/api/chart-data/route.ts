import { type NextRequest, NextResponse } from "next/server"
import { getAggregatedData, getYearlyTrendData, getSectorTimeSeries, getRegionTimeSeries } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const groupBy = searchParams.get("groupBy") || "SektorUtama"
    const year = searchParams.get("year") ? Number.parseInt(searchParams.get("year")!) : null
    const sector = searchParams.get("sector")
    const region = searchParams.get("region")
    const status = searchParams.get("status")
    const type = searchParams.get("type") || "aggregated"

    // Get data based on type
    let data
    if (type === "trend") {
      data = await getYearlyTrendData({ year, sector, region, status })
    } else if (type === "sector-time-series" && sector) {
      data = await getSectorTimeSeries(sector)
    } else if (type === "region-time-series" && region) {
      data = await getRegionTimeSeries(region)
    } else {
      data = await getAggregatedData(groupBy, { year, sector, region, status })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("API Error fetching chart data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch chart data",
        details: error instanceof Error ? error.message : String(error),
        data: [], // Return empty data array as fallback
      },
      { status: 200 }, // Return 200 with empty data instead of 500
    )
  }
}
