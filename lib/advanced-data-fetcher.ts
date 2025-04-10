import { getMetadata, getInvestmentData } from "@/lib/db"

// Cache for metadata to avoid repeated database queries
let metadataCache: any = null
let metadataCacheExpiry = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Function to fetch metadata with caching
export async function fetchMetadataWithCaching() {
  const now = Date.now()

  // Return cached metadata if it's still valid
  if (metadataCache && metadataCacheExpiry > now) {
    console.log("Using cached metadata")
    return metadataCache
  }

  console.log("Fetching fresh metadata")
  try {
    // Fetch fresh metadata
    const metadata = await getMetadata()

    // Update cache
    metadataCache = metadata
    metadataCacheExpiry = now + CACHE_TTL

    return metadata
  } catch (error) {
    console.error("Error fetching metadata:", error)

    // If we have stale cache, return it as fallback
    if (metadataCache) {
      console.log("Using stale metadata cache as fallback")
      return metadataCache
    }

    // Otherwise, throw the error
    throw error
  }
}

// Function to fetch data with pagination and retries
export async function fetchDataWithRetries({
  page = 1,
  pageSize = 10,
  filters = {},
  sortBy = "Tahun",
  sortOrder = "desc",
  retries = 3,
}: {
  page?: number
  pageSize?: number
  filters?: any
  sortBy?: string
  sortOrder?: "asc" | "desc"
  retries?: number
}) {
  let lastError

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching data (attempt ${attempt}/${retries})`)

      const result = await getInvestmentData({
        page,
        pageSize,
        year: filters.year,
        sector: filters.sector,
        region: filters.region,
        status: filters.status,
        sortBy,
        sortOrder,
      })

      return result
    } catch (error) {
      console.error(`Error fetching data (attempt ${attempt}/${retries}):`, error)
      lastError = error

      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = 1000 * Math.pow(2, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("Failed to fetch data after multiple attempts")
}

// Function to fetch all data in batches (for exports or full data processing)
export async function fetchAllData({
  batchSize = 100,
  filters = {},
  sortBy = "Tahun",
  sortOrder = "desc",
  progressCallback,
}: {
  batchSize?: number
  filters?: any
  sortBy?: string
  sortOrder?: "asc" | "desc"
  progressCallback?: (progress: number, total: number) => void
}) {
  // First, get the total count
  const firstBatch = await fetchDataWithRetries({
    page: 1,
    pageSize: batchSize,
    filters,
    sortBy,
    sortOrder,
  })

  const total = firstBatch.pagination.total
  let allData = [...firstBatch.data]

  if (progressCallback) {
    progressCallback(allData.length, total)
  }

  // If there are more pages, fetch them
  if (allData.length < total) {
    const totalPages = Math.ceil(total / batchSize)

    // Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
      const batch = await fetchDataWithRetries({
        page,
        pageSize: batchSize,
        filters,
        sortBy,
        sortOrder,
      })

      allData = [...allData, ...batch.data]

      if (progressCallback) {
        progressCallback(allData.length, total)
      }
    }
  }

  return allData
}
