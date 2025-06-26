"use client"

import { useEffect, useState } from "react"
import { toast } from 'sonner'
import { Sparkles } from "lucide-react"
import { WorkflowIcon, HistoryIcon } from "@/components/icons"
import { PlusIcon } from "@/components/icons/plus-icon"
import { parseAsString, useQueryState } from "nuqs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

// Glassmorphic Card Component
function GlassmorphicCard({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <Card 
      className={`border border-white/30 dark:border-slate-700/10 bg-white/70 dark:bg-slate-900/5 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 rounded-xl ${className}`} 
      {...props}
    >
      {children}
    </Card>
  )
}

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
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 dark:from-gray-900 dark:to-slate-900 overflow-x-hidden">
      {/* Enhanced background blurred elements for light mode */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:bg-purple-900 opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 dark:bg-blue-900 opacity-25 blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 dark:bg-emerald-900 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 dark:bg-orange-900 opacity-15 blur-3xl animate-pulse"></div>
      
      <div className="relative flex flex-col h-full">
        <SimulationHeader />

        <div className="flex-1 overflow-y-auto">
        {view === 'form' &&  (
          <div className="relative">
            <div className="p-6 px-10 space-y-6">
              {/* Header Section */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">Scenario Builder</h1>
                  <p className="text-slate-600 dark:text-slate-300 text-lg">Configure scenarios and analyze supply chain resilience</p>
                </div>

                <div className="flex items-center gap-3">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="secondary" className="shadow-md border-white/30 dark:border-slate-700/10 bg-white/70 dark:bg-slate-900/5 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-900/10">
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
                      <Button variant="secondary" className="shadow-md border-white/30 dark:border-slate-700/10 bg-white/70 dark:bg-slate-900/5 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-900/10">
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

                  <Button variant="default" onClick={() => setIsAIScenarioOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <Sparkles className="mr-2 h-4 w-4 text-yellow-500" /> 
                    AI Scenarios
                  </Button>
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
            <GlassmorphicCard className="p-8">
              <SimulationLoader progress={progress} />
            </GlassmorphicCard>
          </div>
        )}

        {view === 'results' && simulationComplete && (
          <div className="p-6 px-10 space-y-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-3">Simulation Results</h1>
                  <p className="text-slate-600 dark:text-slate-300 text-lg">Analysis complete - review your supply chain impact</p>
                </div>
                <Button 
                  onClick={handleNewSimulation} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 h-10 text-base text-white"
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
