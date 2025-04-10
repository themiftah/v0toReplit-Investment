"use client"

import type React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface SidePanelProps {
  children: React.ReactNode
  show: boolean
  onClose: () => void
  side?: "left" | "right"
  title?: string
}

export function SidePanel({ children, show, onClose, side = "left", title }: SidePanelProps) {
  return (
    <Sheet open={show} onOpenChange={onClose}>
      <SheetContent side={side} className="p-0">
        {title && (
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        {children}
      </SheetContent>
    </Sheet>
  )
}
