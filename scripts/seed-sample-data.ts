import { sql } from "../lib/db"
import { generateSampleData } from "../lib/sample-data"

async function seedSampleData() {
  try {
    console.log("Generating sample data...")
    const sampleData = generateSampleData()

    console.log(`Generated ${sampleData.length} records. Inserting into database...`)

    // Start a transaction
    await sql`BEGIN`

    // Insert data in batches
    const batchSize = 100
    for (let i = 0; i < sampleData.length; i += batchSize) {
      const batch = sampleData.slice(i, i + batchSize)

      for (const item of batch) {
        await sql`
          INSERT INTO investment_data (
            sektor_utama, sektor_23, wilayah, provinsi, kabkot, negara,
            investasi_rp_juta, tambahan_investasi_dalam_usd_ribu,
            proyek, tki, tka, status, tahun
          ) VALUES (
            ${item.SektorUtama},
            ${item["23Sektor"]},
            ${item.Wilayah},
            ${item.Provinsi},
            ${item.Kabkot},
            ${item.Negara},
            ${item.InvestasiRpJuta},
            ${item.TambahanInvestasiDalamUSDRibu},
            ${item.Proyek},
            ${item.TKI},
            ${item.TKA},
            ${item.Status},
            ${item.Tahun}
          )
        `
      }

      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sampleData.length / batchSize)}`)
    }

    // Commit the transaction
    await sql`COMMIT`

    console.log("Sample data seeded successfully")
  } catch (error) {
    // Rollback on error
    await sql`ROLLBACK`
    console.error("Error seeding sample data:", error)
    throw error
  }
}

// Run the seeding function
// seedSampleData();

export { seedSampleData }
