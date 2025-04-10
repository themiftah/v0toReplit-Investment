"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createOptimizedViews, createOptimizedIndexes } from "@/lib/db-optimization"
import { AlertCircle, CheckCircle, Database, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SettingsTabProps {
  dataCompleteness?: number
  totalRecords?: number
  optimizationStatus?: {
    viewsOptimized: boolean
    indexesOptimized: boolean
    recommendations: string[]
  }
}

export function SettingsTab({
  dataCompleteness = 0,
  totalRecords = 0,
  optimizationStatus = {
    viewsOptimized: false,
    indexesOptimized: false,
    recommendations: [],
  },
}: SettingsTabProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [isCreatingViews, setIsCreatingViews] = useState(false)
  const [isCreatingIndexes, setIsCreatingIndexes] = useState(false)
  const [viewsCreated, setViewsCreated] = useState(optimizationStatus.viewsOptimized)
  const [indexesCreated, setIndexesCreated] = useState(optimizationStatus.indexesOptimized)
  const [optimizationError, setOptimizationError] = useState<string | null>(null)
  const [showOptimizationInfo, setShowOptimizationInfo] = useState(false)

  const handleCreateViews = async () => {
    setIsCreatingViews(true)
    setOptimizationError(null)

    try {
      const result = await createOptimizedViews()
      setViewsCreated(result)

      if (!result) {
        setOptimizationError("Failed to create optimized views. Please check the console for details.")
      } else {
        setShowOptimizationInfo(true)
      }
    } catch (error: any) {
      console.error("Error creating views:", error)
      setOptimizationError(error.message || "An error occurred while creating optimized views")
    } finally {
      setIsCreatingViews(false)
    }
  }

  const handleCreateIndexes = async () => {
    setIsCreatingIndexes(true)
    setOptimizationError(null)

    try {
      const result = await createOptimizedIndexes()
      setIndexesCreated(result)

      if (!result) {
        setOptimizationError("Failed to create optimized indexes. Please check the console for details.")
      } else {
        setShowOptimizationInfo(true)
      }
    } catch (error: any) {
      console.error("Error creating indexes:", error)
      setOptimizationError(error.message || "An error occurred while creating optimized indexes")
    } finally {
      setIsCreatingIndexes(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight gradient-heading">Settings</h2>
        <p className="text-muted-foreground">Configure your dashboard preferences and database optimizations.</p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general dashboard settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">Automatically refresh data every 5 minutes</p>
                </div>
                <Switch id="auto-refresh" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about data updates</p>
                </div>
                <Switch id="notifications" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Data Information</CardTitle>
              <CardDescription>Information about the current dataset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Total Records</h3>
                  <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Data Completeness</h3>
                  <p className="text-2xl font-bold">{dataCompleteness.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4 mt-4">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Database Optimization</CardTitle>
              <CardDescription>Optimize database performance for faster queries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimizationError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{optimizationError}</AlertDescription>
                </Alert>
              )}

              {showOptimizationInfo && (
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Database Optimization</AlertTitle>
                  <AlertDescription>
                    Database optimization requires direct SQL execution privileges. In a production environment,
                    requires direct SQL execution privileges. In a production environment, these optimizations would be
                    applied through database migrations or by a database administrator. For this demo, we're simulating
                    the optimization process.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="optimized-views">Optimized Views</Label>
                    {viewsCreated && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">Create optimized database views for complex queries</p>
                </div>
                <Button
                  onClick={handleCreateViews}
                  disabled={isCreatingViews || viewsCreated}
                  variant={viewsCreated ? "outline" : "default"}
                >
                  {isCreatingViews ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Simulating...
                    </>
                  ) : viewsCreated ? (
                    "Simulated"
                  ) : (
                    "Simulate Views"
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="optimized-indexes">Optimized Indexes</Label>
                    {indexesCreated && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">Create indexes on frequently queried columns</p>
                </div>
                <Button
                  onClick={handleCreateIndexes}
                  disabled={isCreatingIndexes || indexesCreated}
                  variant={indexesCreated ? "outline" : "default"}
                >
                  {isCreatingIndexes ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Simulating...
                    </>
                  ) : indexesCreated ? (
                    "Simulated"
                  ) : (
                    "Simulate Indexes"
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Database className="h-4 w-4" />
                <span>Optimizing the database can significantly improve query performance</span>
              </div>

              {optimizationStatus.recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {optimizationStatus.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardFooter>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Advanced Database Settings</CardTitle>
              <CardDescription>Configure advanced database settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="use-optimized-views">Use Optimized Views</Label>
                  <p className="text-sm text-muted-foreground">
                    Use optimized views for queries (requires created views)
                  </p>
                </div>
                <Switch id="use-optimized-views" disabled={!viewsCreated} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cache-results">Cache Query Results</Label>
                  <p className="text-sm text-muted-foreground">Cache query results for faster repeated queries</p>
                </div>
                <Switch id="cache-results" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the appearance of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark mode for the dashboard</p>
                </div>
                <Switch id="dark-mode" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <p className="text-sm text-muted-foreground">Use a more compact layout for the dashboard</p>
                </div>
                <Switch id="compact-view" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
