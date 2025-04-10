import { createReadStream } from "fs"
import { parse } from "csv-parse"
import { sql } from "../lib/db"

// Function to import CSV data
async function importCSV(filePath: string) {
  const records: any[] = []

  // Parse the CSV file
  const parser = createReadStream(filePath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }),
  )

  // Process each record
  for await (const record of parser) {
    records.push(record)

    // Process in batches of 100 to avoid memory issues
    if (records.length >= 100) {
      await insertRecords(records)
      records.length = 0
    }
  }

  // Insert any remaining records
  if (records.length > 0) {
    await insertRecords(records)
  }

  console.log("CSV import completed successfully")
}

// Function to insert records into the database
async function insertRecords(records: any[]) {
  try {
    // Start a transaction
    await sql`BEGIN`

    for (const record of records) {
      await sql`
        INSERT INTO investment_data (
          sektor_utama, sektor_23, wilayah, provinsi, kabkot, negara,
          investasi_rp_juta, tambahan_investasi_dalam_usd_ribu,
          proyek, tki, tka, status, tahun
        ) VALUES (
          ${record.sektor_utama || record.SektorUtama || ""},
          ${record.sektor_23 || record["23Sektor"] || ""},
          ${record.wilayah || record.Wilayah || ""},
          ${record.provinsi || record.Provinsi || ""},
          ${record.kabkot || record.Kabkot || ""},
          ${record.negara || record.Negara || ""},
          ${Number.parseFloat(record.investasi_rp_juta || record.InvestasiRpJuta || 0)},
          ${Number.parseFloat(record.tambahan_investasi_dalam_usd_ribu || record.TambahanInvestasiDalamUSDRibu || 0)},
          ${Number.parseInt(record.proyek || record.Proyek || 0)},
          ${Number.parseInt(record.tki || record.TKI || 0)},
          ${Number.parseInt(record.tka || record.TKA || 0)},
          ${record.status || record.Status || ""},
          ${Number.parseInt(record.tahun || record.Tahun || 0)}
        )
      `
    }

    // Commit the transaction
    await sql`COMMIT`
    console.log(`Inserted ${records.length} records`)
  } catch (error) {
    // Rollback on error
    await sql`ROLLBACK`
    console.error("Error inserting records:", error)
    throw error
  }
}

// Usage example
// importCSV('./data/investment_data.csv');

export { importCSV }
