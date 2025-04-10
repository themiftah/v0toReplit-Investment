export interface DashboardState {
  activeTab: "overview" | "explore" | "insights" | "settings"
  filters: FilterState
  chartConfig: ChartConfig
  queryHistory: any[]
}

export interface FilterState {
  sektorUtama: string[]
  sektor23: string[]
  wilayah: string[]
  provinsi: string[]
  kabkot: string[]
  negara: string[]
  status: string[]
  tahun: number[]
  investmentRange: [number, number]
  currency: "IDR" | "USD"
}

export interface ChartConfig {
  type: "bar" | "line" | "pie"
  colorScheme: string
  showLegend: boolean
  showGrid: boolean
  stacked: boolean
  normalized: boolean
}

export interface InvestmentData {
  id: string | number
  year: number
  province: string
  sector: string
  region: string
  country: string
  status: string
  investment_idr: number // PMDN (domestic investment) in billion IDR
  investment_usd: number // PMA (foreign investment) in million USD
  projects: number
  tki: number
  tka: number
}
