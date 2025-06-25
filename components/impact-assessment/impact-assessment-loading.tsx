import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Renders a loading placeholder UI for the impact assessment section using skeleton elements.
 *
 * Displays a card with skeleton placeholders for the title, subtitle, button, and a grid of text blocks, along with a large skeleton simulating a chart area, to indicate that impact assessment data is loading.
 */
export default function ImpactAssessmentLoading() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex justify-end items-start">
        <div className="text-sm text-muted-foreground mb-2">
          Loading impact assessment data...
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-[300px] w-full" />
    </div>
  )
} 