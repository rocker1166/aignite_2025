"use client"

import { getImpactByNodeData, supplyChainImpactData } from "@/lib/data/impactresult"
import { useImpact } from "@/lib/context/impact-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ProductionOutputChart,
  ImpactByNodeChart
} from "@/components/charts"

/**
 * Displays a metrics dashboard with production output and impact by node charts.
 *
 * Retrieves impact data from context or falls back to default data, and renders two charts side-by-side: one for production output and one for impact by node. Shows loading placeholders while data is being fetched.
 */
export default function MetricsDashboard() {
  // Get data from impact context instead of using the hardcoded data
  const { impactData, isLoading } = useImpact();
  
  // Use the default data if impactData is not available
  const safeImpactData = impactData || supplyChainImpactData;
  
  // Get derived data using helper functions
  const impactByNodeData = getImpactByNodeData(safeImpactData)

  // Calculate additional metrics
  const currentProductionLevel = safeImpactData.productionData[safeImpactData.productionData.length - 1]?.actual || 0

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      {/* Single row - Production Output and Impact by Node */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProductionOutputChart data={safeImpactData.productionData} />
        <ImpactByNodeChart data={impactByNodeData} />
      </div>
    </div>
  )
}

// Loading state component
const LoadingState = () => (
  <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-[400px]" />
      <Skeleton className="h-[400px]" />
    </div>
  </div>
)
