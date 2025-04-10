import { NextResponse } from "next/server"
import { checkConnection, sql } from "@/lib/db"

export async function GET() {
  try {
    // Check database connection
    const connectionCheck = await checkConnection()

    if (!connectionCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed",
          error: connectionCheck.error,
        },
        { status: 500 },
      )
    }

    // Check if the investment_data table exists and count records
    let tableExists = false
    let recordCount = 0

    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'investment_data'
        ) as table_exists;
      `

      tableExists = tableCheck[0]?.table_exists === true

      if (tableExists) {
        const countResult = await sql`SELECT COUNT(*) as count FROM investment_data;`
        recordCount = Number.parseInt(countResult[0]?.count || "0")
      }
    } catch (error) {
      console.error("Error checking table or counting records:", error)
      // Continue with the response even if this part fails
    }

    // Get database version and connection info
    let dbInfo = {}
    try {
      const versionResult = await sql`SELECT version();`
      dbInfo = {
        version: versionResult[0]?.version || "Unknown",
      }
    } catch (error) {
      console.error("Error getting database version:", error)
      // Continue with the response even if this part fails
    }

    return NextResponse.json({
      success: true,
      connection: "Connected to Neon database",
      tableExists,
      recordCount,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      dbInfo,
    })
  } catch (error) {
    console.error("Database status check error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database status check failed",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
