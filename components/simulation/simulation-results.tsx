"use client"

import { useEffect, useState } from "react"
import { Download, LineChart, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimulationImpactChart } from "@/components/simulation/simulation-impact-chart"
import { SimulationTimeline } from "@/components/simulation/simulation-timeline"
import type { Simulation } from "@/lib/types/database"
import { getSimulationById } from "@/lib/api/simulation"

interface SimulationResultsProps {
  simulationId?: string
}

export function SimulationResults({ simulationId }: SimulationResultsProps) {
  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSimulation = async () => {
      if (!simulationId) return

      try {
        setLoading(true)
        const data = await getSimulationById(simulationId)
        setSimulation(data)
      } catch (error) {
        console.error("Error fetching simulation:", error)
        toast({
          title: "Error",
          description: "Failed to load simulation results",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSimulation()
  }, [simulationId, toast])

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="ml-4">Loading simulation results...</div>
      </div>
    )
  }

  // Extract result summary from simulation
  const resultSummary = simulation?.result_summary || {
    costImpact: "$1.2M",
    timeDelay: "14.5 days",
    inventoryImpact: "-42%",
    recoveryTime: "35 days",
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Simulation Results</h2>
          <p className="text-muted-foreground">
            {simulation?.name || "Port Strike Scenario"} - Completed on {formatDate(simulation?.simulated_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button asChild>
            <Link href="/strategy">
              <Sparkles className="mr-2 h-4 w-4" />
              View Recommendations
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="impact">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="impact">Impact Assessment</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="map">Geographic View</TabsTrigger>
        </TabsList>

        <TabsContent value="impact" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Cost Impact</CardTitle>
                <CardDescription>Total financial impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{resultSummary.costImpact}</div>
                <p className="text-sm text-muted-foreground">+32% from baseline</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Time Delay</CardTitle>
                <CardDescription>Delivery timeline impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{resultSummary.timeDelay}</div>
                <p className="text-sm text-muted-foreground">+8.3 days from baseline</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Inventory Impact</CardTitle>
                <CardDescription>Stock level reduction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{resultSummary.inventoryImpact}</div>
                <p className="text-sm text-muted-foreground">Critical threshold: -50%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>Detailed breakdown of disruption effects</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <SimulationImpactChart />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Most Affected Nodes</CardTitle>
                <CardDescription>Supply chain components with highest impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-destructive mr-2"></div>
                      <span>Supplier A</span>
                    </div>
                    <span className="font-medium">92% Impact</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-destructive mr-2"></div>
                      <span>Warehouse B</span>
                    </div>
                    <span className="font-medium">78% Impact</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-warning mr-2"></div>
                      <span>Factory C</span>
                    </div>
                    <span className="font-medium">65% Impact</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-warning mr-2"></div>
                      <span>Distribution D</span>
                    </div>
                    <span className="font-medium">54% Impact</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-info mr-2"></div>
                      <span>Supplier E</span>
                    </div>
                    <span className="font-medium">32% Impact</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recovery Projection</CardTitle>
                <CardDescription>Estimated recovery timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Initial Impact</span>
                    <span className="font-medium">Day 1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Peak Disruption</span>
                    <span className="font-medium">Day 7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recovery Begins</span>
                    <span className="font-medium">Day 14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>50% Recovery</span>
                    <span className="font-medium">Day 21</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Full Recovery</span>
                    <span className="font-medium">Day 35</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <LineChart className="mr-2 h-4 w-4" />
                  View Detailed Timeline
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Disruption Timeline</CardTitle>
              <CardDescription>Chronological view of disruption events and recovery</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              <SimulationTimeline />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Impact</CardTitle>
              <CardDescription>Spatial visualization of disruption effects</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">Geographic map visualization would be displayed here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  (Using Mapbox or Leaflet integration with real-time data)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
