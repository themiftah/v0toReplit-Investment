"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

type ChartContextValue = {
  config: ChartConfig
  isDarkMode: boolean
}

const ChartContext = React.createContext<ChartContextValue | undefined>(undefined)

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
}) {
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === "dark"

  // Define color palette based on theme
  const lightGrey = isDarkMode ? "#4B5563" : "#E5E7EB" // darker in dark mode, lighter in light mode
  const darkGrey = isDarkMode ? "#9CA3AF" : "#6B7280" // lighter in dark mode, darker in light mode

  // Set default colors if not provided
  const defaultConfig = {
    pma: {
      label: "PMA",
      color: isDarkMode ? "#9CA3AF" : "#6B7280", // dark grey
    },
    pmdn: {
      label: "PMDN",
      color: isDarkMode ? "#4B5563" : "#E5E7EB", // light grey
    },
    ...config,
  }

  return (
    <ChartContext.Provider value={{ config: defaultConfig, isDarkMode }}>
      <div
        className={cn("h-[350px] w-full rounded-lg overflow-hidden", className)}
        {...props}
        style={{
          "--color-chart-1": defaultConfig[Object.keys(defaultConfig)[0]]?.color || darkGrey,
          "--color-chart-2": defaultConfig[Object.keys(defaultConfig)[1]]?.color || lightGrey,
          "--color-chart-3": defaultConfig[Object.keys(defaultConfig)[2]]?.color || "#9CA3AF",
          "--color-chart-4": defaultConfig[Object.keys(defaultConfig)[3]]?.color || "#6B7280",
          "--color-chart-5": defaultConfig[Object.keys(defaultConfig)[4]]?.color || "#4B5563",
          ...Object.fromEntries(Object.entries(defaultConfig).map(([key, value]) => [`--color-${key}`, value.color])),
          position: "relative",
          zIndex: 0,
          minHeight: "350px", // Ensure minimum height
          display: "flex", // Use flexbox for better child element handling
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

export function useChartConfig() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartConfig must be used within a ChartContainer")
  }
  return { config: context.config, isDarkMode: context.isDarkMode }
}

export function ChartLegend({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-4 text-sm text-muted-foreground", className)} {...props} />
}

export function ChartLegendItem({
  color,
  label,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  color: string
  label: string
}) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <div
        className="h-2 w-2 rounded-full"
        style={{
          backgroundColor: color,
        }}
      />
      <span>{label}</span>
    </div>
  )
}

export function ChartLegendContent() {
  const { config } = useChartConfig()
  return (
    <>
      {Object.entries(config).map(([key, { label, color }]) => (
        <ChartLegendItem key={key} color={color} label={label} />
      ))}
    </>
  )
}

export function ChartTooltip({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { isDarkMode } = useChartConfig()

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-2.5 text-sm shadow-md max-w-[250px]",
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
        className,
      )}
      {...props}
    />
  )
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  formatter,
  labelFormatter,
  hideLabel = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    dataKey: string
    payload: Record<string, any>
  }>
  label?: string
  formatter?: (value: number, name: string) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
  hideLabel?: boolean
}) {
  const { config, isDarkMode } = useChartConfig()

  // Handle cases where payload is undefined or empty
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div
      className={cn("space-y-2", className)}
      {...props}
      style={{
        backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
        border: `1px solid ${isDarkMode ? "#374151" : "#E5E7EB"}`,
        borderRadius: "0.5rem",
        padding: "0.75rem",
        boxShadow: isDarkMode ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      {!hideLabel && label && (
        <div
          className="text-sm font-medium border-b pb-1 mb-1"
          style={{ borderColor: isDarkMode ? "#374151" : "#E5E7EB" }}
        >
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((item, index) => {
          if (!item || typeof item.value === "undefined") return null

          const dataKey = item.dataKey as string
          const configItem = config[dataKey]
          if (!configItem) return null

          return (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: configItem.color,
                  }}
                />
                <span className="text-sm">{configItem.label}:</span>
              </div>
              <div className="font-medium">
                {formatter ? formatter(item.value, item.name) : item.value.toLocaleString()}
              </div>
            </div>
          )
        })}
        {payload[0]?.payload?.total && (
          <div
            className="border-t mt-1 pt-1 text-sm font-medium flex justify-between"
            style={{ borderColor: isDarkMode ? "#374151" : "#E5E7EB" }}
          >
            <span>Total:</span>
            <span>
              {formatter ? formatter(payload[0].payload.total, "total") : payload[0].payload.total.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
