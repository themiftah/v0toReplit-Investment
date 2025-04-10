import { APBN_RATES } from "@/lib/constants"
import type { InvestmentData } from "@/lib/types"

// Convert PMA (USD) to IDR for combined calculations
function convertPmaToIdr(usdAmount: number, year: number): number {
  // Use the exchange rate for the given year
  const exchangeRate = APBN_RATES[year.toString()] || 14000 // Default to 14000 if not found
  return (usdAmount * 1000 * exchangeRate) / 1000000000 // Convert to billions IDR
}

// Calculate total investment in IDR (billions)
export function calculateTotalInvestment(data: InvestmentData[] | undefined): number {
  // Add null check to handle undefined data
  if (!data || !Array.isArray(data)) {
    return 0
  }

  return data.reduce((total, item) => {
    let amount = 0

    // Add PMDN amount (already in IDR)
    if (item.investment_idr > 0) {
      amount += item.investment_idr // Already in billions
    }

    // Convert and add PMA amount (from USD to IDR)
    if (item.investment_usd > 0) {
      amount += convertPmaToIdr(item.investment_usd, item.year)
    }

    return total + amount
  }, 0)
}

// Get PMA amount in USD (millions)
export function calculatePmaInvestment(data: InvestmentData[] | undefined): number {
  // Add null check to handle undefined data
  if (!data || !Array.isArray(data)) {
    return 0
  }

  return data.reduce((total, item) => {
    if (item.investment_usd > 0) {
      return total + item.investment_usd // Already in millions
    }
    return total
  }, 0)
}

// Get PMDN amount in IDR (billions)
export function calculatePmdnInvestment(data: InvestmentData[] | undefined): number {
  // Add null check to handle undefined data
  if (!data || !Array.isArray(data)) {
    return 0
  }

  return data.reduce((total, item) => {
    if (item.investment_idr > 0) {
      return total + item.investment_idr // Already in billions
    }
    return total
  }, 0)
}
