import { NextResponse } from "next/server"
import { supabase, checkSupabaseConnection } from "@/lib/supabase"

export async function GET() {
  try {
    // First check if Supabase is properly configured
    const connectionCheck = await checkSupabaseConnection()

    if (!connectionCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: connectionCheck.message,
          error: connectionCheck.error,
          details: connectionCheck.details,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        { status: 500 },
      )
    }

    // Test the connection by fetching years
    const { data, error } = await supabase.from("investment_data").select("Tahun").order("Tahun")

    if (error) {
      throw error
    }

    // Count records by year
    const yearCounts: Record<string, number> = {}
    data?.forEach((item) => {
      const year = item.Tahun
      if (!yearCounts[year]) yearCounts[year] = 0
      yearCounts[year]++
    })

    return NextResponse.json({
      success: true,
      message: "Connection successful",
      years: Object.keys(yearCounts).sort(),
      counts: yearCounts,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      // Don't expose the full key, just show if it exists
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  } catch (error: any) {
    console.error("Connection test error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Connection failed",
        error: error.toString(),
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      { status: 500 },
    )
  }
}
