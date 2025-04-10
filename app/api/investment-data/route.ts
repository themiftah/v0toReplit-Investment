import { type NextRequest, NextResponse } from "next/server"
import { getInvestmentData } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const year = searchParams.get("year") ? Number.parseInt(searchParams.get("year")!) : null
    const sector = searchParams.get("sector")
    const region = searchParams.get("region")
    const status = searchParams.get("status")
    const sortBy = searchParams.get("sortBy") || "Tahun"
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc"
    const cursor = searchParams.get("cursor")
    const useCursor = searchParams.get("useCursor") === "true"

    console.log("API: Fetching investment data with params:", {
      page,
      pageSize,
      year,
      sector,
      region,
      status,
      sortBy,
      sortOrder,
      cursor,
      useCursor,
    })

    // Get data from the database with retries
    let result
    const retries = 3
    let lastError

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        result = await getInvestmentData({
          page,
          pageSize,
          year,
          sector,
          region,
          status,
          sortBy,
          sortOrder,
          cursor,
          useCursor,
        })

        // If successful, break out of the retry loop
        break
      } catch (error) {
        console.error(`API Error fetching investment data (attempt ${attempt}/${retries}):`, error)
        lastError = error

        // If this was the last attempt, we'll throw the error after the loop
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
        }
      }
    }

    // If we exhausted all retries and still don't have a result, throw the last error
    if (!result) {
      throw lastError || new Error("Failed to fetch investment data after multiple attempts")
    }

    console.log(
      `API: Retrieved ${result.data?.length || 0} records out of ${result.pagination?.total || "unknown"} total`,
    )

    // Transform data to match the expected format in the frontend
    const transformedData = result.data.map((item) => ({
      id: item.id,
      year: item.Tahun,
      province: item.Provinsi,
      sector: item.SektorUtama,
      region: item.Wilayah,
      country: item.Negara,
      status: item.Status,
      investment_idr: Number.parseFloat(item.InvestasiRpJuta) / 1000, // Convert to billions
      investment_usd: Number.parseFloat(item.TambahanInvestasiDalamUSDRibu) / 1000, // Convert to millions
      projects: item.Proyek,
      tki: item.TKI,
      tka: item.TKA,
    }))

    return NextResponse.json({
      data: transformedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error("API Error fetching investment data:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch investment data",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
