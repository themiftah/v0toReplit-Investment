import { neon } from "@neondatabase/serverless"

// Create a SQL client with the Neon connection string
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to check if the database connection is working
export async function checkConnection() {
  try {
    console.log("Checking database connection...")
    // Use tagged template literal syntax
    const result = await sql`SELECT 1 as connection_test`
    console.log("Database connection successful")
    return { success: true, result }
  } catch (error) {
    console.error("Database connection error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    }
  }
}

// Enhanced function to get investment data with advanced pagination and filtering
export async function getInvestmentData({
  page = 1,
  pageSize = 10,
  year = null,
  sector = null,
  region = null,
  status = null,
  sortBy = "Tahun",
  sortOrder = "desc",
  cursor = null,
  useCursor = false,
}: {
  page?: number
  pageSize?: number
  year?: number | null
  sector?: string | null
  region?: string | null
  status?: string | null
  sortBy?: string
  sortOrder?: "asc" | "desc"
  cursor?: string | null
  useCursor?: boolean
}) {
  try {
    console.log("DB: Fetching investment data with params:", {
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

    // Build the WHERE clause for filtering
    const conditions = []
    const params = []
    let paramIndex = 1

    if (year) {
      conditions.push(`"Tahun" = $${paramIndex}`)
      params.push(year)
      paramIndex++
    }

    if (sector) {
      conditions.push(`"SektorUtama" = $${paramIndex}`)
      params.push(sector)
      paramIndex++
    }

    if (region) {
      conditions.push(`"Wilayah" = $${paramIndex}`)
      params.push(region)
      paramIndex++
    }

    if (status) {
      conditions.push(`"Status" = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    // Add cursor-based pagination if requested
    if (useCursor && cursor) {
      const decodedCursor = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"))
      const cursorValue = decodedCursor.value
      const cursorField = decodedCursor.field || sortBy

      const operator = sortOrder.toLowerCase() === "desc" ? "<" : ">"
      conditions.push(`"${cursorField}" ${operator} $${paramIndex}`)
      params.push(cursorValue)
      paramIndex++
    }

    // Add the WHERE clause to the query if there are filters
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Build the ORDER BY clause
    const orderByClause = `ORDER BY "${sortBy}" ${sortOrder.toUpperCase()}`

    // Get total count (only if not using cursor-based pagination)
    let total = 0
    if (!useCursor) {
      const countQuery = `
        SELECT COUNT(*) as total
        FROM investment_data
        ${whereClause}
      `
      try {
        console.log("DB: Executing count query:", countQuery, params)
        const countResult = await sql.query(countQuery, params)
        total = Number.parseInt(countResult.rows[0]?.total || "0")
        console.log("DB: Total records:", total)
      } catch (countError) {
        console.error("Error getting count:", countError)
        // Continue with the main query even if count fails
      }
    }

    // Calculate offset for offset-based pagination
    const offset = useCursor ? 0 : (page - 1) * pageSize

    // Get paginated data
    const dataQuery = `
      SELECT *
      FROM investment_data
      ${whereClause}
      ${orderByClause}
      LIMIT ${pageSize}${useCursor ? "" : ` OFFSET ${offset}`}
    `
    console.log("DB: Executing data query:", dataQuery, params)
    const data = await sql.query(dataQuery, params)
    console.log(`DB: Retrieved ${data.rows.length} records`)

    // Generate next cursor for cursor-based pagination
    let nextCursor = null
    if (useCursor && data.rows.length === pageSize) {
      const lastRow = data.rows[data.rows.length - 1]
      const cursorData = {
        field: sortBy,
        value: lastRow[sortBy],
      }
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString("base64")
    }

    return {
      data: data.rows,
      pagination: {
        total: useCursor ? null : total,
        page: useCursor ? null : page,
        pageSize,
        totalPages: useCursor ? null : Math.ceil(total / pageSize),
        nextCursor,
        hasMore: data.rows.length === pageSize,
      },
    }
  } catch (error) {
    console.error("DB Error fetching investment data:", error)
    throw error
  }
}

// Enhanced function to get metadata with error handling and retries
export async function getMetadata(retries = 3) {
  let attempt = 0

  while (attempt < retries) {
    try {
      attempt++
      console.log(`Fetching metadata (attempt ${attempt}/${retries})...`)

      // Use tagged template literals for simple queries
      const years = await sql`
        SELECT DISTINCT "Tahun" 
        FROM investment_data 
        ORDER BY "Tahun" DESC
      `

      const sectors = await sql`
        SELECT DISTINCT "SektorUtama" 
        FROM investment_data 
        WHERE "SektorUtama" IS NOT NULL 
        ORDER BY "SektorUtama"
      `

      const regions = await sql`
        SELECT DISTINCT "Wilayah" 
        FROM investment_data 
        WHERE "Wilayah" IS NOT NULL 
        ORDER BY "Wilayah"
      `

      const provinces = await sql`
        SELECT DISTINCT "Provinsi" 
        FROM investment_data 
        WHERE "Provinsi" IS NOT NULL 
        ORDER BY "Provinsi"
      `

      const statuses = await sql`
        SELECT DISTINCT "Status" 
        FROM investment_data 
        WHERE "Status" IS NOT NULL 
        ORDER BY "Status"
      `

      const countries = await sql`
        SELECT DISTINCT "Negara" 
        FROM investment_data 
        WHERE "Negara" IS NOT NULL 
        ORDER BY "Negara"
      `

      // Get total count
      const countResult = await sql`SELECT COUNT(*) as total FROM investment_data`
      const totalRecords = Number.parseInt(countResult[0]?.total || "0")

      // Get min/max investment values for range filters
      const investmentRange = await sql`
        SELECT 
          MIN("InvestasiRpJuta") / 1000 as min_investment,
          MAX("InvestasiRpJuta") / 1000 as max_investment
        FROM investment_data
        WHERE "InvestasiRpJuta" > 0
      `

      const minInvestment = Math.floor(Number.parseFloat(investmentRange[0]?.min_investment || "0"))
      const maxInvestment = Math.ceil(Number.parseFloat(investmentRange[0]?.max_investment || "1000"))

      return {
        years: years.map((y) => y.Tahun),
        sectors: sectors.map((s) => s.SektorUtama),
        regions: regions.map((r) => r.Wilayah),
        provinces: provinces.map((p) => p.Provinsi),
        statuses: statuses.map((s) => s.Status),
        countries: countries.map((c) => c.Negara),
        totalRecords,
        investmentRange: [minInvestment, maxInvestment],
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Error fetching metadata (attempt ${attempt}/${retries}):`, error)

      if (attempt >= retries) {
        throw error
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
    }
  }

  throw new Error("Failed to fetch metadata after multiple attempts")
}

// Enhanced function to get aggregated data for charts with better error handling
export async function getAggregatedData(groupBy: string, filters: any = {}) {
  try {
    // Build the WHERE clause for filtering
    const conditions = []
    const params = []
    let paramIndex = 1

    if (filters.year) {
      conditions.push(`"Tahun" = $${paramIndex}`)
      params.push(filters.year)
      paramIndex++
    }

    if (filters.sector) {
      conditions.push(`"SektorUtama" = $${paramIndex}`)
      params.push(filters.sector)
      paramIndex++
    }

    if (filters.region) {
      conditions.push(`"Wilayah" = $${paramIndex}`)
      params.push(filters.region)
      paramIndex++
    }

    if (filters.status) {
      conditions.push(`"Status" = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    // Add the WHERE clause to the query if there are filters
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Build the query based on the groupBy parameter
    const query = `
      SELECT 
        "${groupBy}" as name,
        COUNT(*) as count,
        SUM(CASE WHEN "Status" = 'PMDN' THEN "InvestasiRpJuta" ELSE 0 END) as pmdn,
        SUM(CASE WHEN "Status" = 'PMA' THEN "TambahanInvestasiDalamUSDRibu" ELSE 0 END) as pma
      FROM investment_data
      ${whereClause}
      GROUP BY "${groupBy}"
      ORDER BY name
    `

    const result = await sql.query(query, params)
    return result.rows
  } catch (error) {
    console.error(`Error fetching aggregated data by ${groupBy}:`, error)
    throw error
  }
}

// Enhanced function to get yearly trend data with better error handling
export async function getYearlyTrendData(filters: any = {}) {
  try {
    // Build the WHERE clause for filtering
    const conditions = []
    const params = []
    let paramIndex = 1

    if (filters.sector) {
      conditions.push(`"SektorUtama" = $${paramIndex}`)
      params.push(filters.sector)
      paramIndex++
    }

    if (filters.region) {
      conditions.push(`"Wilayah" = $${paramIndex}`)
      params.push(filters.region)
      paramIndex++
    }

    if (filters.status) {
      conditions.push(`"Status" = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    // Add the WHERE clause to the query if there are filters
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Build the query to get yearly data
    const query = `
      SELECT 
        "Tahun" as year,
        COUNT(*) as count,
        SUM(CASE WHEN "Status" = 'PMDN' THEN "InvestasiRpJuta" ELSE 0 END) as pmdn,
        SUM(CASE WHEN "Status" = 'PMA' THEN "TambahanInvestasiDalamUSDRibu" ELSE 0 END) as pma
      FROM investment_data
      ${whereClause}
      GROUP BY "Tahun"
      ORDER BY "Tahun"
    `

    const result = await sql.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Error fetching yearly trend data:", error)
    throw error
  }
}

// Function to get data for a specific sector with time series
export async function getSectorTimeSeries(sector: string) {
  try {
    const query = `
      SELECT 
        "Tahun" as year,
        SUM(CASE WHEN "Status" = 'PMDN' THEN "InvestasiRpJuta" ELSE 0 END) as pmdn,
        SUM(CASE WHEN "Status" = 'PMA' THEN "TambahanInvestasiDalamUSDRibu" ELSE 0 END) as pma
      FROM investment_data
      WHERE "SektorUtama" = $1
      GROUP BY "Tahun"
      ORDER BY "Tahun"
    `

    const result = await sql.query(query, [sector])
    return result.rows
  } catch (error) {
    console.error(`Error fetching time series data for sector ${sector}:`, error)
    throw error
  }
}

// Function to get data for a specific region with time series
export async function getRegionTimeSeries(region: string) {
  try {
    const query = `
      SELECT 
        "Tahun" as year,
        SUM(CASE WHEN "Status" = 'PMDN' THEN "InvestasiRpJuta" ELSE 0 END) as pmdn,
        SUM(CASE WHEN "Status" = 'PMA' THEN "TambahanInvestasiDalamUSDRibu" ELSE 0 END) as pma
      FROM investment_data
      WHERE "Wilayah" = $1
      GROUP BY "Tahun"
      ORDER BY "Tahun"
    `

    const result = await sql.query(query, [region])
    return result.rows
  } catch (error) {
    console.error(`Error fetching time series data for region ${region}:`, error)
    throw error
  }
}

// Function to get advanced statistics
export async function getAdvancedStatistics() {
  try {
    const query = `
      SELECT
        AVG("InvestasiRpJuta") as avg_investment_idr,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "InvestasiRpJuta") as median_investment_idr,
        AVG("TambahanInvestasiDalamUSDRibu") as avg_investment_usd,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "TambahanInvestasiDalamUSDRibu") as median_investment_usd,
        AVG("Proyek") as avg_projects,
        AVG("TKI") as avg_tki,
        AVG("TKA") as avg_tka
      FROM investment_data
    `

    const result = await sql.query(query)
    return result.rows[0]
  } catch (error) {
    console.error("Error fetching advanced statistics:", error)
    throw error
  }
}
