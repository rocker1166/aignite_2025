"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SimulationResults } from "@/components/simulation/simulation-results"
import { SimulationHistory } from "@/components/simulation/simulation-history"
import { ScenarioBuilder } from "@/components/simulation/test/scenario-builder"
import { SimulationToolbar } from "@/components/simulation/test/simulation-toolbar"
import { SimulationLoader } from "@/components/simulation/test/simulation-loader"
import { SimulationEmptyState } from "@/components/simulation/test/simulation-empty-state"
import type { Simulation, SupplyChain } from "@/lib/types/database"
import { getSupplyChains } from "@/lib/api/supply-chain"
import { createSimulation, updateSimulation, getSimulations } from "@/lib/api/simulation"
import { formatISO } from "date-fns"
import { useUser } from "@/lib/stores/user"


export function SimulationPage() {
  const { toast } = useToast()
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [supplyChains, setSupplyChains] = useState<SupplyChain[]>([
    {
      supply_chain_id: "default-1",
      user_id: "user-123",
      name: "Default Supply Chain",
      description: "This is a default supply chain for testing purposes.",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])
  const [selectedSupplyChainId, setSelectedSupplyChainId] = useState("")
  const [simulationHistory, setSimulationHistory] = useState<Simulation[]>([])
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null)

  // Basic scenario state
  const [scenarioName, setScenarioName] = useState("Port Strike Scenario")
  const [scenarioType, setScenarioType] = useState("disruption")
  const [disruptionSeverity, setDisruptionSeverity] = useState(70)
  const [disruptionDuration, setDisruptionDuration] = useState(14)
  const [affectedNode, setAffectedNode] = useState("supplier-a")
  const [description, setDescription] = useState("Simulating a port strike affecting key suppliers...")

  // Advanced state
  const [startDate, setStartDate] = useState(formatISO(new Date()))
  const [endDate, setEndDate] = useState(formatISO(new Date()))
  const [monteCarloRuns, setMonteCarloRuns] = useState(100)
  const [distributionType, setDistributionType] = useState("normal")
  const [cascadeEnabled, setCascadeEnabled] = useState(true)
  const [failureThreshold, setFailureThreshold] = useState(30)
  const [bufferPercent, setBufferPercent] = useState(20)
  const [alternateRouting, setAlternateRouting] = useState(true)
  const [randomSeed, setRandomSeed] = useState("")


//fetch user 
const { userData } = useUser();
  console.log("userdata", userData)
  console.log("company description", userData?.description)
  console.log("company name", userData?.organisation_name)
  console.log("company id", userData?.id)
  console.log("industry", userData?.industry)
  console.log("sub_industry", userData?.sub_industry)
  console.log("location", userData?.location)


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
    fetchSupplyChains()
  }, [toast])

  const fetchSimulationHistory = async (id: string) => {
    try {
      const sims = await getSimulations(id)
      setSimulationHistory(sims)
    } catch {
      toast({ title: "Error", description: "Failed to load simulation history", variant: "destructive" })
    }
  }

  const runSimulation = async () => {
    if (!selectedSupplyChainId) {
      toast({ title: "Error", description: "Please select a supply chain first", variant: "destructive" })
      return
    }

    try {
      const newSim: Partial<Simulation> = {
        supply_chain_id: selectedSupplyChainId,
        name: scenarioName,
        scenario_type: scenarioType,
        parameters: {
          severity: disruptionSeverity,
          duration: disruptionDuration,
          affectedNode,
          description,
          startDate,
          endDate,
          monteCarloRuns,
          distributionType,
          cascadeEnabled,
          failureThreshold,
          bufferPercent,
          alternateRouting,
          randomSeed
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
        name: scenarioName,
        type: scenarioType,
        supplyChainId: selectedSupplyChainId,
        parameters: {
          severity: disruptionSeverity,
          duration: disruptionDuration,
          affectedNode,
          description,
          startDate,
          endDate,
          monteCarloRuns,
          distributionType,
          cascadeEnabled,
          failureThreshold,
          bufferPercent,
          alternateRouting,
          randomSeed
        }
      }

      // Call the impact API endpoint
      try {
        const response = await fetch('/api/impact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulationConfig })
        });

        if (response.ok) {
          const impactData = await response.json();
          console.log('Impact assessment results:', impactData);
        } else {
          console.error('Impact API error:', response.status);
        }
      } catch (error) {
        console.error('Error calling impact API:', error);
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
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <SimulationToolbar onRun={runSimulation} disabled={simulationRunning || !selectedSupplyChainId} />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r bg-background overflow-y-auto">
          <ScenarioBuilder
            scenarioName={scenarioName} setScenarioName={setScenarioName}
            scenarioType={scenarioType} setScenarioType={setScenarioType}
            supplyChains={supplyChains}
            selectedSupplyChainId={selectedSupplyChainId}
            handleSupplyChainChange={setSelectedSupplyChainId}
            disruptionSeverity={disruptionSeverity} setDisruptionSeverity={setDisruptionSeverity}
            disruptionDuration={disruptionDuration} setDisruptionDuration={setDisruptionDuration}
            affectedNode={affectedNode} setAffectedNode={setAffectedNode}
            description={description} setDescription={setDescription}
            advancedProps={{
              startDate, setStartDate,
              endDate, setEndDate,
              monteCarloRuns, setMonteCarloRuns,
              distributionType, setDistributionType,
              cascadeEnabled, setCascadeEnabled,
              failureThreshold, setFailureThreshold,
              bufferPercent, setBufferPercent,
              alternateRouting, setAlternateRouting,
              randomSeed, setRandomSeed
            }}
          />
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
    </div>
  )
}
