"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // During SSR and initial client render, return a placeholder
    return <>{children}</>
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  )
}
