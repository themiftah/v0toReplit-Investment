import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency values
export function formatCurrency(value: number, currency: "IDR" | "USD" = "IDR") {
  if (currency === "IDR") {
    // Format as billions IDR
    const billionValue = value / 1000000 // Convert from million to billion
    return `${billionValue.toFixed(2)} B IDR`
  } else {
    // Format as millions USD
    const millionValue = value / 1000 // Convert from thousand to million
    return `${millionValue.toFixed(2)} M USD`
  }
}

// Format percentage values
export function formatPercentage(value: number) {
  return `${value.toFixed(1)}%`
}

// Format number with thousand separators
export function formatNumber(value: number) {
  return value.toLocaleString()
}
