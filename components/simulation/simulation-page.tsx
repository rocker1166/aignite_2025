"use client"

import { useEffect, useState } from "react"
import { toast } from 'sonner'
import { Play, Sparkles } from "lucide-react"
import { WorkflowIcon, HistoryIcon, RouteIcon, CalendarDaysIcon } from "@/components/icons"
import { PlusIcon } from "@/components/icons/plus-icon"
import { parseAsString, useQueryState } from "nuqs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

import { SimulationResults } from "@/components/simulation/simulation-results"
import { SimulationHistory } from "@/components/simulation/simulation-history"
import { SimulationLoader } from "@/components/simulation/test/simulation-loader"
import { AIScenarioSuggestions } from "@/components/simulation/test/ai-scenario-suggestions"
import { ScenarioProvider, useScenario, ScenarioData } from "@/lib/context/scenario-context"
import type { Simulation } from "@/lib/types/database"
import { getUserSupplyChains } from "@/lib/api/supply-chain"
import { createSimulation, updateSimulation, getSimulations } from "@/lib/api/simulation"
import { useUser } from "@/lib/stores/user"
import { useImpact } from "@/lib/context/impact-context"

// Import separated components
import { SimulationHeader } from "./simulation-header"
import { FloatingRunButton } from "./floating-run-button"
import { ScenarioConfigurationForm } from "./scenario-configuration-form"
import type { ApiResponse, SupplyChainData } from "./types"

/**
 * Renders the main content and workflow for the supply chain simulation page.
 *
 * Manages scenario configuration, simulation execution, progress tracking, results display, and simulation history. Integrates with user, scenario, and impact contexts, and provides development utilities for testing. Supports AI scenario suggestions and workflow guidance via UI components.
 */
function SimulationPageContent() {
  const [simulationHistory, setSimulationHistory] = useState<Simulation[]>([])
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null)
  const [isAIScenarioOpen, setIsAIScenarioOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  // URL state management with nuqs
  const [view, setView] = useQueryState('view', parseAsString.withDefault('form'))
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)

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

  const user_id = userData?.id

  // Form validation
  const isFormValid = !!(scenarioData.scenarioName && 
                       scenarioData.scenarioType && 
                       scenarioData.affectedNode && 
                       scenarioData.affectedNode.length > 0 &&
                       selectedSupplyChainId)

  useEffect(() => {
    const fetchSupplyChains = async () => {
      if (!userData?.id) {
        toast.error("User not found. Please log in.")
        return
      }

      try {
        const response: ApiResponse = await getUserSupplyChains(userData.id)
        if (response.status === 'success' && response.data) {
          const transformedData = response.data.map((chain: SupplyChainData) => ({
            supply_chain_id: chain.supply_chain_id,
            user_id: chain.user_id,
            name: chain.name,
            description: chain.description,
            status: 'active',
            created_at: chain.timestamp,
            updated_at: chain.timestamp
          }))
          setSupplyChains(transformedData)
          if (transformedData.length > 0) {
            setSelectedSupplyChainId(transformedData[0].supply_chain_id)
            fetchSimulationHistory(transformedData[0].supply_chain_id)
          }
        } else {
          toast.error("Failed to load supply chains")
        }
      } catch (error) {
        console.error('Error fetching supply chains:', error)
        toast.error("Failed to load supply chains")
      }
    }
    
    if (!supplyChains.length && userData?.id) {
      fetchSupplyChains()
    } else if (supplyChains.length > 0 && !selectedSupplyChainId) {
      setSelectedSupplyChainId(supplyChains[0].supply_chain_id)
      fetchSimulationHistory(supplyChains[0].supply_chain_id)
    }
  }, [supplyChains, userData, selectedSupplyChainId, setSelectedSupplyChainId, setSupplyChains])

  const fetchSimulationHistory = async (id: string) => {
    try {
      const sims = await getSimulations(id)
      setSimulationHistory(sims)
    } catch (error) {
      console.error('Error fetching simulation history:', error)
      toast.error("Failed to load simulation history")
    }
  }

  const handleAIScenarioSelect = (scenario: ScenarioData) => {
    updateScenarioData(scenario)
    toast.success(`Applied "${scenario.scenarioName}" to the builder`)
  }

  // Development helper function to fill dummy data
  const fillDummyData = () => {
    const dummyScenario: ScenarioData = {
      scenarioName: "Dev Test - Supply Disruption",
      scenarioType: "supply_disruption",
      affectedNode: "supplier_1,warehouse_2", // String format, comma-separated
      description: "Development test scenario with dummy data for quick testing",
      disruptionSeverity: 0.75,
      disruptionDuration: 14,
      startDate: "2024-01-15",
      endDate: "2024-01-29",
      monteCarloRuns: 1000,
      distributionType: "normal",
      cascadeEnabled: true,
      failureThreshold: 0.6,
      bufferPercent: 0.15,
      alternateRouting: true,
      randomSeed: "42" // String format
    }
    
    updateScenarioData(dummyScenario)
    toast.success("✨ Dev mode: Form filled with dummy data!")
  }

  // Development helper function to jump directly to results with dummy data
  const jumpToResults = async () => {
    if (!selectedSupplyChainId) {
      toast.error("Please select a supply chain first")
      return
    }

    try {
      // Fill dummy data first
      fillDummyData()
      
      // Create a dummy simulation record
      const dummySim: Partial<Simulation> = {
        supply_chain_id: selectedSupplyChainId,
        name: "Dev Test - Supply Disruption",
        scenario_type: "supply_disruption",
        parameters: {
          severity: 0.75,
          duration: 14,
          affectedNode: "supplier_1,warehouse_2",
          description: "Development test scenario with dummy data for quick testing"
        },
        status: "completed",
        result_summary: {
          costImpact: "$2.4M",
          timeDelay: "18.3 days", 
          inventoryImpact: "-58%",
          recoveryTime: "42 days"
        },
        simulated_at: new Date().toISOString()
      }

      const created = await createSimulation(dummySim)
      setCurrentSimulation(created)

      // Set dummy impact data using the correct structure
      setImpactData({
        scenario: {
          id: "dev-scenario-001",
          name: "Dev Test - Supply Disruption",
          type: "supply_disruption",
          description: "Development test scenario with dummy data for quick testing",
          supplyChain: selectedSupplyChainId,
          affectedNode: "supplier_1,warehouse_2",
          duration: "14 days",
          severity: "75%",
          monteCarloRuns: 1000,
          cascadingThreshold: "60%",
          inventoryBuffer: "15%",
          lastUpdated: new Date().toLocaleString(),
        },
        nodes: [
          {
            id: "supplier_1",
            name: "Primary Supplier",
            type: "supplier",
            status: "disrupted",
            statusDetail: "Primary disruption - supply shortage",
            downtime: "14 days",
            outputDrop: "-75%",
            recovery: "Day 15",
            riskScore: 85,
            x: 100,
            y: 100,
          },
          {
            id: "warehouse_2",
            name: "Regional Warehouse",
            type: "storage",
            status: "partial",
            statusDetail: "Reduced capacity due to supplier issues",
            downtime: "7 days",
            outputDrop: "-45%",
            recovery: "Day 12",
            riskScore: 62,
            x: 300,
            y: 150,
          },
          {
            id: "factory_1",
            name: "Manufacturing Plant",
            type: "manufacturing",
            status: "partial",
            statusDetail: "Limited production capacity",
            downtime: "3 days",
            outputDrop: "-30%",
            recovery: "Day 10",
            riskScore: 45,
            x: 500,
            y: 100,
          }
        ],
        links: [
          { source: "supplier_1", target: "warehouse_2", value: 75 },
          { source: "warehouse_2", target: "factory_1", value: 60 }
        ],
        productionData: [
          { day: 1, actual: 100, projected: 100 },
          { day: 2, actual: 85, projected: 100 },
          { day: 3, actual: 60, projected: 100 },
          { day: 4, actual: 25, projected: 100 },
          { day: 5, actual: 30, projected: 100 },
          { day: 6, actual: 45, projected: 100 },
          { day: 7, actual: 55, projected: 100 },
          { day: 8, actual: 65, projected: 100 },
          { day: 9, actual: 75, projected: 100 },
          { day: 10, actual: 85, projected: 100 },
          { day: 11, actual: 90, projected: 100 },
          { day: 12, actual: 95, projected: 100 },
          { day: 13, actual: 98, projected: 100 },
          { day: 14, actual: 100, projected: 100 }
        ],
        inventoryData: [
          { day: 1, level: 100 },
          { day: 2, level: 85 },
          { day: 3, level: 65 },
          { day: 4, level: 40 },
          { day: 5, level: 35 },
          { day: 6, level: 45 },
          { day: 7, level: 55 },
          { day: 8, level: 65 },
          { day: 9, level: 75 },
          { day: 10, level: 85 },
          { day: 11, level: 90 },
          { day: 12, level: 95 },
          { day: 13, level: 98 },
          { day: 14, level: 100 }
        ]
      })

      // Jump directly to results
      setView('results')
      setSimulationComplete(true)
      setSimulationRunning(false)
      
      toast.success("🚀 Dev mode: Jumped to results with dummy data!")
      
      // Update simulation history
      fetchSimulationHistory(selectedSupplyChainId)
    } catch (error) {
      console.error('Error in dev mode jump to results:', error)
      toast.error("Failed to jump to results")
    }
  }

  const runSimulation = async () => {
    if (!selectedSupplyChainId) {
      toast.error("Please select a supply chain first")
      return
    }

    if (!isFormValid) {
      toast.error("Please complete all required fields")
      return
    }

    try {
      // Change view to simulation
      setView('simulation')
      setSimulationRunning(true)
      setSimulationComplete(false)
      setProgress(0)

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

      setIsLoading(true)

      try {
        const response = await fetch('/api/impact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ simulationConfig, user_id })
        })

        if (response.ok) {
          const apiResponse = await response.json()
          setImpactData(apiResponse.result)
        } else {
          console.error('Impact API error:', response.status)
          toast.error(`Impact API returned status: ${response.status}`)
        }
      } catch (error) {
        console.error('Error calling impact API:', error)
        toast.error("Failed to fetch impact assessment data")
      } finally {
        setIsLoading(false)
      }

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setSimulationRunning(false)
            setSimulationComplete(true)
            setView('results')

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
    } catch (error) {
      console.error('Error starting simulation:', error)
      toast.error("Failed to start simulation")
      setIsLoading(false)
      setView('form')
    }
  }

  const handleNewSimulation = () => {
    setView('form')
    setSimulationRunning(false)
    setSimulationComplete(false)
    setProgress(0)
    setCurrentSimulation(null)
  }

  return (
    <div className="flex flex-col h-full">
      <SimulationHeader />

      <div className={`flex-1 overflow-y-auto ${view !== 'form' && simulationRunning ? 'bg-white dark:bg-white' : 'bg-slate-50 dark:bg-background'}`}>
        {view === 'form' &&  (
          <div className="relative">
            <div className="p-6 px-10 space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Scenario Builder</h1>
                  <p className="text-muted-foreground text-lg">Configure scenarios and analyze supply chain resilience</p>
                </div>

                <div className="flex items-center gap-3">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="secondary" className="shadow-md">
                        <WorkflowIcon size={16} className="mr-2" />
                        See how it works
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Simulation Workflow</DrawerTitle>
                        <DrawerDescription>
                          Follow these steps to run your supply chain analysis
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                          <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-medium">1</div>
                            <div>
                              <h3 className="font-medium text-sm mb-1">Configure Scenario</h3>
                              <p className="text-xs text-muted-foreground">Set up your scenario parameters</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-medium">2</div>
                            <div>
                              <h3 className="font-medium text-sm mb-1">Select Affected Nodes</h3>
                              <p className="text-xs text-muted-foreground">Choose impacted supply chain parts</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs font-medium">3</div>
                            <div>
                              <h3 className="font-medium text-sm mb-1">Run Simulation</h3>
                              <p className="text-xs text-muted-foreground">Execute and wait for results</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-md bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-center w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-medium">4</div>
                            <div>
                              <h3 className="font-medium text-sm mb-1">Analyze Results</h3>
                              <p className="text-xs text-muted-foreground">Review impact and strategies</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="secondary" className="shadow-md">
                        <HistoryIcon size={16} className="mr-2" />
                        View History
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[600px] sm:w-[600px]">
                      <SheetHeader>
                        <SheetTitle>Simulation History</SheetTitle>
                        <SheetDescription>
                          Previously run simulations and their results
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        <SimulationHistory
                          simulations={simulationHistory}
                          onRunSimulation={(id) => {
                            const sim = simulationHistory.find((s) => s.simulation_id === id)
                            if (sim) {
                              setCurrentSimulation(sim)
                              setView('results')
                            }
                          }}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button variant="default" onClick={() => setIsAIScenarioOpen(true)} className="shadow-md">
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-500" /> 
                    AI Scenarios
                  </Button>

                  {/* Dev Mode Buttons - Only show in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={fillDummyData} 
                        className="shadow-md border-dashed border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <RouteIcon size={16} className="mr-2" />
                        Dev: Fill Form
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={jumpToResults} 
                        className="shadow-md border-dashed border-green-300 text-green-600 hover:bg-green-50"
                      >
                        <Play size={16} className="mr-2" />
                        Dev: Skip to Results
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Form Configuration */}
              <ScenarioConfigurationForm />
            </div>

            {/* Floating Action Button */}
            <FloatingRunButton isFormValid={isFormValid} onRunSimulation={runSimulation} />
          </div>
        )}

        {view === 'simulation' && simulationRunning && (
          <div className="p-6 px-10">
            <SimulationLoader progress={progress} />
          </div>
        )}

        {view === 'results' && simulationComplete && (
          <div className="p-6 px-10 space-y-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">Simulation Results</h1>
                  <p className="text-muted-foreground text-lg">Analysis complete - review your supply chain impact</p>
                </div>
                <Button 
                  onClick={handleNewSimulation} 
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-shadow h-10 text-base text-white"
                >
                  <PlusIcon size={16} className="mr-2" />
                  New Simulation
                </Button>
              </div>
              <SimulationResults simulationId={currentSimulation?.simulation_id} />
            </div>
          </div>
        )}
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
