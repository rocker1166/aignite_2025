"use client"

import { useState } from "react"
import { AlertTriangle, Download, Info, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import StrategyDashboard from "@/components/strategy-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useImpact } from "@/lib/context/impact-context"
import { Skeleton } from "@/components/ui/skeleton"

import CascadingFailureMap from "./cascading-failure-map"
import MetricsDashboard from "./metrics-dashboard"
import NodeImpactGrid from "./node-impact-grid"

export default function ImpactAssessment() {
  const { toast } = useToast()
  const { impactData, isLoading } = useImpact();
  const [isRunning, setIsRunning] = useState(false)
  const [open, setOpen] = useState(false)
  const [scenarioId, setScenarioId] = useState("PORT-CLOSURE-Q3-25")

  const handleOpenSheet = () => {
    setOpen(true)
  }

  const runSimulation = () => {
    setIsRunning(true)
    toast({
      title: "Simulation started",
      description: "Running 100 Monte Carlo simulations...",
    })

    setTimeout(() => {
      setIsRunning(false)
      toast({
        title: "Simulation complete",
        description: "All 100 simulations completed successfully.",
      })
    }, 3000)
  }

  // Use the scenario data from the context, with null check
  const scenario = impactData?.scenario || {}

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impact Assessment</h1>
          <p className="text-muted-foreground">
            Analyze disruption impacts and cascading effects across your supply chain
          </p>
        </div>
        <div className="">

          <Button size="lg" onClick={handleOpenSheet} className="bg-[#1D3557] hover:bg-[#1D3557]/90">
            View Disruption Strategy
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0 sm:max-w-none">
              <StrategyDashboard scenarioId={scenarioId} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{scenario?.name || 'Scenario'}</CardTitle>
              <CardDescription>{scenario?.description || 'No description available'}</CardDescription>
            </div>
            <Badge variant="destructive" className="px-3 py-1">
              {scenario?.type || 'Unknown'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Supply Chain</div>
              <div className="font-medium">{scenario?.supplyChain || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Affected Node</div>
              <div className="font-medium">{scenario?.affectedNode || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Duration</div>
              <div className="font-medium">{scenario?.duration || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Severity</div>
              <div className="font-medium">{scenario?.severity || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Monte Carlo Runs</div>
              <div className="font-medium">{scenario?.monteCarloRuns || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Cascading Threshold</div>
              <div className="font-medium">{scenario?.cascadingThreshold || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Inventory Buffer</div>
              <div className="font-medium">{scenario?.inventoryBuffer || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
              <div className="font-medium">{scenario?.lastUpdated || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics Dashboard</TabsTrigger>
          <TabsTrigger value="nodes">Node-Level Impact</TabsTrigger>
          <TabsTrigger value="map">Cascading Failure Map</TabsTrigger>
        </TabsList>
        <TabsContent value="metrics" className="mt-4">
          <MetricsDashboard />
        </TabsContent>
        <TabsContent value="nodes" className="mt-4">
          <NodeImpactGrid />
        </TabsContent>
        <TabsContent value="map" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Cascading Failure Map
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        This network graph shows how disruptions cascade through your supply chain. Red nodes have
                        failed, yellow nodes are partially affected, and green nodes are operating normally.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>Interactive visualization of disruption propagation across the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full">
                <CascadingFailureMap />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-orange-200 bg-orange-50 dark:bg-transparent dark:border-orange-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900 dark:text-orange-400">Critical Alert</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Factory B is projected to fail on Day 5 if no mitigation actions are taken. Recommend increasing
                inventory buffer to 35% and activating alternate supplier.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impact Assessment</h1>
          <p className="text-muted-foreground">
            Loading impact assessment data...
          </p>
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