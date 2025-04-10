import { NextResponse } from "next/server"
import { getMetadata } from "@/lib/db"

export async function GET() {
  try {
    console.log("API: Fetching metadata")

    // Get metadata from the database with built-in retries
    const metadata = await getMetadata(3) // 3 retries

    console.log("API: Metadata fetched successfully")

    return NextResponse.json(metadata)
  } catch (error) {
    console.error("API Error fetching metadata:", error)

    // Return a more graceful error response with fallback data
    return NextResponse.json(
      {
        error: "Failed to fetch metadata",
        details: error instanceof Error ? error.message : String(error),
        // Provide fallback data
        years: [],
        sectors: [],
        regions: [],
        provinces: [],
        statuses: [],
        countries: [],
        totalRecords: 0,
        investmentRange: [0, 1000],
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }, // Return 200 with fallback data instead of 500
    )
  }
}
