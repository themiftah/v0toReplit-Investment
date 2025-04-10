import { Dashboard } from "@/components/dashboard"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function Home() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-lg font-medium">Loading dashboard...</p>
            </div>
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </main>
  )
}
