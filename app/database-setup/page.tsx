"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, Loader2 } from "lucide-react"

export default function DatabaseSetupPage() {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  async function checkDatabaseStatus() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/db-status")
      const data = await response.json()

      setDbStatus(data)

      if (!data.success) {
        setError(data.message || "Failed to check database status")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while checking database status")
      console.error("Database status check error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Neon Database Status</h1>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Checking database status...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>Status of your Neon database connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {dbStatus?.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {dbStatus?.success ? "Connected to Neon database" : "Connection failed"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="text-sm font-medium mb-1">Table Status</h3>
                    <div className="flex items-center gap-2">
                      {dbStatus?.tableExists ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>
                        {dbStatus?.tableExists ? "investment_data table exists" : "investment_data table not found"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-md">
                    <h3 className="text-sm font-medium mb-1">Record Count</h3>
                    <p className="text-2xl font-bold">{dbStatus?.recordCount?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={checkDatabaseStatus}>Refresh Status</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
              <CardDescription>Details about your Neon database connection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <h3 className="text-sm font-medium mb-1">Environment Variables</h3>
                  <p>DATABASE_URL: {dbStatus?.databaseUrl || "Not set"}</p>
                </div>

                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>Database Connection</AlertTitle>
                  <AlertDescription>
                    Your application is configured to use a Neon PostgreSQL database. Make sure your DATABASE_URL
                    environment variable is correctly set.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
