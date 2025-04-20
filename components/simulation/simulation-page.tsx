"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SimulationResults } from "@/components/simulation/simulation-results"
import { SimulationHistory } from "@/components/simulation/simulation-history"
import { ScenarioBuilder, ScenarioBuilderWithContext } from "@/components/simulation/test/scenario-builder"
import { SimulationToolbar } from "@/components/simulation/test/simulation-toolbar"
import { SimulationLoader } from "@/components/simulation/test/simulation-loader"
import { SimulationEmptyState } from "@/components/simulation/test/simulation-empty-state"
import { AIScenarioSuggestions } from "@/components/simulation/test/ai-scenario-suggestions"
import { ScenarioProvider, useScenario, ScenarioData } from "@/lib/context/scenario-context"
import type { Simulation, SupplyChain } from "@/lib/types/database"
import { getSupplyChains } from "@/lib/api/supply-chain"
import { createSimulation, updateSimulation, getSimulations } from "@/lib/api/simulation"
import { formatISO } from "date-fns"
import { useUser } from "@/lib/stores/user"
import { useImpact } from "@/lib/context/impact-context"

function SimulationPageContent() {
  const { toast } = useToast()
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [simulationHistory, setSimulationHistory] = useState<Simulation[]>([])
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null)
  const [isAIScenarioOpen, setIsAIScenarioOpen] = useState(false)

  // Access scenario context
  const { 
    scenarioData, 
    updateScenarioData, 
    supplyChains, 
    setSupplyChains, 
    selectedSupplyChainId, 
    setSelectedSupplyChainId 
  } = useScenario()

  // Access the impact context
  const { setImpactData, setIsLoading } = useImpact()

  //fetch user 
  const { userData } = useUser()
  console.log("userdata", userData)
  console.log("company description", userData?.description)
  console.log("company name", userData?.organisation_name)
  console.log("company id", userData?.id)
  console.log("industry", userData?.industry)
  console.log("sub_industry", userData?.sub_industry)
  console.log("location", userData?.location)

  const user_id = userData?.id

  useEffect(() => {
    const fetchSupplyChains = async () => {
      try {
        const data = await getSupplyChains(userData?.id)
        setSupplyChains(data)
        if (data.length > 0) {
          setSelectedSupplyChainId(data[0].supply_chain_id)
          fetchSimulationHistory(data[0].supply_chain_id)
        }
      } catch {
        toast({ title: "Error", description: "Failed to load supply chains", variant: "destructive" })
      }
    }
    
    if (!supplyChains.length && userData?.id) {
      fetchSupplyChains()
    } else if (supplyChains.length > 0 && !selectedSupplyChainId) {
      setSelectedSupplyChainId(supplyChains[0].supply_chain_id)
      fetchSimulationHistory(supplyChains[0].supply_chain_id)
    }
  }, [toast, supplyChains, userData, selectedSupplyChainId, setSelectedSupplyChainId, setSupplyChains])

  const fetchSimulationHistory = async (id: string) => {
    try {
      const sims = await getSimulations(id)
      setSimulationHistory(sims)
    } catch {
      toast({ title: "Error", description: "Failed to load simulation history", variant: "destructive" })
    }
  }

  const handleAIScenarioSelect = (scenario: ScenarioData) => {
    updateScenarioData(scenario)
    toast({ 
      title: "AI Scenario Applied", 
      description: `Applied "${scenario.scenarioName}" to the builder`, 
      variant: "default" 
    })
  }

  const runSimulation = async () => {
    if (!selectedSupplyChainId) {
      toast({ title: "Error", description: "Please select a supply chain first", variant: "destructive" })
      return
    }

    try {
      const newSim: Partial<Simulation> = {
        supply_chain_id: selectedSupplyChainId,
        name: scenarioData.scenarioName,
        scenario_type: scenarioData.scenarioType,
        parameters: {
          severity: scenarioData.disruptionSeverity,
          duration: scenarioData.disruptionDuration,
          affectedNode: scenarioData.affectedNode,
          description: scenarioData.description,
          startDate: scenarioData.startDate,
          endDate: scenarioData.endDate,
          monteCarloRuns: scenarioData.monteCarloRuns,
          distributionType: scenarioData.distributionType,
          cascadeEnabled: scenarioData.cascadeEnabled,
          failureThreshold: scenarioData.failureThreshold,
          bufferPercent: scenarioData.bufferPercent,
          alternateRouting: scenarioData.alternateRouting,
          randomSeed: scenarioData.randomSeed
        },
        status: "running"
      }

      const created = await createSimulation(newSim)
      setCurrentSimulation(created)
      setSimulationRunning(true)
      setSimulationComplete(false)
      setProgress(0)

      // Create the simulationConfig object to send to the impact API
      const simulationConfig = {
        id: created?.simulation_id,
        name: scenarioData.scenarioName,
        type: scenarioData.scenarioType,
        supplyChainId: selectedSupplyChainId,
        parameters: {
          severity: scenarioData.disruptionSeverity,
          duration: scenarioData.disruptionDuration,
          affectedNode: scenarioData.affectedNode,
          description: scenarioData.description,
          startDate: scenarioData.startDate,
          endDate: scenarioData.endDate,
          monteCarloRuns: scenarioData.monteCarloRuns,
          distributionType: scenarioData.distributionType,
          cascadeEnabled: scenarioData.cascadeEnabled,
          failureThreshold: scenarioData.failureThreshold,
          bufferPercent: scenarioData.bufferPercent,
          alternateRouting: scenarioData.alternateRouting,
          randomSeed: scenarioData.randomSeed
        }
      }

      // Set loading state before API call
      setIsLoading(true)

      // Call the impact API endpoint
      try {
        const response = await fetch('/api/impact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulationConfig, user_id })
        })

        if (response.ok) {
          const apiResponse = await response.json()
          setImpactData(apiResponse.result) // Use the .result property
        } else {
          console.error('Impact API error:', response.status)
          toast({ title: "API Error", description: `Impact API returned status: ${response.status}`, variant: "destructive" })
        }
      } catch (error) {
        console.error('Error calling impact API:', error)
        toast({ title: "API Error", description: "Failed to fetch impact assessment data", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setSimulationRunning(false)
            setSimulationComplete(true)

            if (created) {
              updateSimulation(created.simulation_id, {
                status: "completed",
                result_summary: {
                  costImpact: "$1.2M",
                  timeDelay: "14.5 days",
                  inventoryImpact: "-42%",
                  recoveryTime: "35 days"
                },
                simulated_at: new Date().toISOString()
              }).then(() => fetchSimulationHistory(selectedSupplyChainId))
            }

            return 100
          }
          return prev + 10
        })
      }, 500)
    } catch {
      toast({ title: "Error", description: "Failed to start simulation", variant: "destructive" })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <SimulationToolbar 
        onRun={runSimulation} 
        onAIScenarioClick={() => setIsAIScenarioOpen(true)}
        disabled={simulationRunning || !selectedSupplyChainId} 
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r bg-background overflow-y-auto">
          <ScenarioBuilderWithContext />
        </div>

        <div className="flex-1 overflow-y-auto">
          {simulationRunning ? (
            <SimulationLoader progress={progress} />
          ) : simulationComplete ? (
            <SimulationResults simulationId={currentSimulation?.simulation_id} />
          ) : (
            <>
              <SimulationEmptyState onRun={runSimulation} disabled={!selectedSupplyChainId} />
              <SimulationHistory
                simulations={simulationHistory}
                onRunSimulation={(id) => {
                  const sim = simulationHistory.find((s) => s.simulation_id === id)
                  if (sim) {
                    setCurrentSimulation(sim)
                    setSimulationComplete(true)
                  }
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* AI Scenario Suggestions Sheet */}
      <AIScenarioSuggestions
        open={isAIScenarioOpen}
        onOpenChange={setIsAIScenarioOpen}
        onSelectScenario={handleAIScenarioSelect}
      />
    </div>
  )
}

// Wrap component with context provider
export function SimulationPage() {
  return (
    <ScenarioProvider>
      <SimulationPageContent />
    </ScenarioProvider>
  )
}
