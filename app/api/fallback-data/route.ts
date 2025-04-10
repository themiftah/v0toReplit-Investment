import { NextResponse } from "next/server"

export async function GET() {
  console.log("Using fallback data API")

  // Return empty data structure
  return NextResponse.json({
    data: [],
    pagination: {
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    },
    metadata: {
      years: [],
      sectors: [],
      regions: [],
      provinces: [],
      statuses: [],
      countries: [],
      totalRecords: 0,
      lastUpdated: new Date().toISOString(),
    },
  })
}
