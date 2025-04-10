"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, LightbulbIcon, Settings, TrendingUp, Database, PieChart } from "lucide-react"

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (tab: "overview" | "explore" | "insights" | "settings") => void
}

export function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span>Investment Analyzer</span>
        </div>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Main</h2>
          <div className="space-y-1">
            <Button
              variant={activeTab === "overview" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", activeTab === "overview" ? "bg-secondary" : "")}
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "explore" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", activeTab === "explore" ? "bg-secondary" : "")}
              onClick={() => setActiveTab("explore")}
            >
              <PieChart className="mr-2 h-4 w-4" />
              Explore
            </Button>
            <Button
              variant={activeTab === "insights" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", activeTab === "insights" ? "bg-secondary" : "")}
              onClick={() => setActiveTab("insights")}
            >
              <LightbulbIcon className="mr-2 h-4 w-4" />
              Insights
            </Button>
          </div>
        </div>
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Settings</h2>
          <div className="space-y-1">
            <Button
              variant={activeTab === "settings" ? "secondary" : "ghost"}
              className={cn("w-full justify-start", activeTab === "settings" ? "bg-secondary" : "")}
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium">Investment Data Analyzer</p>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
