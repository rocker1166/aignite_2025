"use client"

import { useEffect, useState } from "react"
import { Download, LineChart, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
//have delete useless components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimulationImpactChart } from "@/components/simulation/simulation-impact-chart"
import { SimulationTimeline } from "@/components/simulation/simulation-timeline"
import type { Simulation } from "@/lib/types/database"
import { getSimulationById } from "@/lib/api/simulation"
import ImpactAssessment from "../impact-assessment"

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
    <ImpactAssessment />
  )
}
