"use client"

import { Calendar, Clock, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Simulation } from "@/lib/types/database"

interface SimulationHistoryProps {
  simulations: Simulation[]
  onRunSimulation: (simulationId: string) => void
}

export function SimulationHistory({ simulations, onRunSimulation }: SimulationHistoryProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get simulation duration
  const getSimulationDuration = (simulation: Simulation) => {
    if (!simulation.simulated_at) return "N/A"

    const startDate = new Date(simulation.created_at)
    const endDate = new Date(simulation.simulated_at)
    const durationMs = endDate.getTime() - startDate.getTime()

    // Format as min:sec
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    return `${minutes} min ${seconds} sec`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation History</CardTitle>
        <CardDescription>Previously run simulations and their results</CardDescription>
      </CardHeader>
      <CardContent>
        {simulations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No simulation history available. Run your first simulation to see results here.
          </div>
        ) : (
          <div className="space-y-4">
            {simulations.map((simulation) => (
              <div key={simulation.simulation_id} className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <h4 className="font-medium">{simulation.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span className="mr-2">{formatDate(simulation.created_at)}</span>
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{getSimulationDuration(simulation)}</span>
                  </div>
                  <div className="text-sm">{simulation.scenario_type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-1 rounded-full text-xs ${
                      simulation.status === "completed"
                        ? "bg-success/20 text-success"
                        : simulation.status === "failed"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-warning/20 text-warning"
                    }`}
                  >
                    {simulation.status.charAt(0).toUpperCase() + simulation.status.slice(1)}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onRunSimulation(simulation.simulation_id)}>
                    View Results
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRunSimulation(simulation.simulation_id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
