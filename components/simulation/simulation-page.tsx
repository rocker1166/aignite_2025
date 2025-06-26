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
import { EnhancedScenarioConfigurationForm } from "./enhanced-scenario-configuration-form"
import { ProfessionalTemplateSelection } from "./professional-template-selection"
import type { ApiResponse, SupplyChainData } from "./types"

// Glassmorphic Card Component with enhanced styling
function GlassmorphicCard({ children, className = "", variant = "default", ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: "default" | "accent" | "subtle";
  [key: string]: any 
}) {
  const variantStyles = {
    default: "border border-white/30 dark:border-slate-700/20 bg-white/80 dark:bg-slate-900/20 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/30",
    accent: "border border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-white/90 to-blue-50/80 dark:from-slate-900/30 dark:to-blue-950/20 backdrop-blur-xl shadow-xl shadow-blue-500/10 dark:shadow-blue-500/20",
    subtle: "border border-white/20 dark:border-slate-700/10 bg-white/60 dark:bg-slate-900/10 backdrop-blur-lg shadow-lg shadow-black/5 dark:shadow-black/20"
  }
  
  return (
    <Card 
      className={`${variantStyles[variant]} rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 ${className}`} 
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
  const [view, setView] = useQueryState('view', parseAsString.withDefault('templates'))
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
    setView('form')
    toast.success(`Applied "${scenario.scenarioName}" to the builder`)
  }

  const handleForecastScenarioSelect = (scenario: ScenarioData) => {
    updateScenarioData(scenario)
    setView('form')
    toast.success(`Applied AI forecast scenario "${scenario.scenarioName}" to the builder`)
  }

  const handleTemplateSelect = (template: any) => {
    if (template) {
      updateScenarioData(template.scenarioData)
      setView('form')
      toast.success(`Applied "${template.name}" template`)
    }
  }

  const handleStartFromScratch = () => {
    // Reset scenario data to defaults
    updateScenarioData({
      scenarioName: "",
      scenarioType: "",
      disruptionSeverity: 0,
      disruptionDuration: 0,
      affectedNode: "",
      description: "",
      startDate: "",
      endDate: "",
      monteCarloRuns: 1000,
      distributionType: "normal",
      cascadeEnabled: true,
      failureThreshold: 50,
      bufferPercent: 15,
      alternateRouting: true,
      randomSeed: ""
    })
    setView('form')
    toast.success("Started with blank scenario")
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
    setView('templates')
    setSimulationRunning(false)
    setSimulationComplete(false)
    setProgress(0)
    setCurrentSimulation(null)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/60 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 overflow-x-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/20 dark:from-purple-900/40 dark:to-pink-900/30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/25 to-cyan-400/15 dark:from-blue-900/40 dark:to-cyan-900/30 blur-3xl animate-bounce [animation-duration:8s]"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-400/10 dark:from-emerald-900/30 dark:to-teal-900/20 blur-2xl animate-pulse [animation-delay:2s]"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300/15 to-amber-400/10 dark:from-orange-900/25 dark:to-amber-900/20 blur-3xl animate-pulse [animation-delay:4s]"></div>
        
        {/* Additional floating elements for depth */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-rose-300/20 to-pink-300/10 dark:from-rose-900/30 dark:to-pink-900/20 blur-xl animate-bounce [animation-duration:6s] [animation-delay:1s]"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-violet-300/15 to-purple-300/10 dark:from-violet-900/25 dark:to-purple-900/20 blur-xl animate-pulse [animation-delay:3s]"></div>
      </div>
      
      <div className="relative flex flex-col h-full z-10">
        <SimulationHeader />

        <div className="flex-1 overflow-y-auto">
        {view === 'templates' && (
          <div className="p-6 px-10">
            <div className="max-w-7xl mx-auto">
              {/* Enhanced header for templates view */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                  Choose Your Simulation
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Start with AI-powered scenarios, professional templates, or build from scratch to analyze your supply chain resilience
                </p>
              </div>
              
              <ProfessionalTemplateSelection
                onTemplateSelect={handleTemplateSelect}
                onStartFromScratch={handleStartFromScratch}
                onAIScenarios={() => setIsAIScenarioOpen(true)}
                onSelectScenario={handleForecastScenarioSelect}
              />
            </div>
          </div>
        )}

        {view === 'form' &&  (
          <div className="relative">
            <div className="p-6 px-10 space-y-8">
              {/* Enhanced Header Section */}
              <div className="max-w-7xl mx-auto">
                <GlassmorphicCard variant="accent" className="p-8 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                        Scenario Builder
                      </h1>
                      <p className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed max-w-2xl">
                        Configure scenarios and analyze supply chain resilience with advanced Monte Carlo simulations
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Real-time analysis enabled
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Sparkles className="w-4 h-4 text-blue-500" />
                          AI-powered insights
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setView('templates')}
                      className="shadow-lg border-white/40 dark:border-slate-700/30 bg-white/80 dark:bg-slate-900/20 backdrop-blur-xl hover:bg-white/90 dark:hover:bg-slate-900/30 transition-all duration-300 px-6 py-3 text-base"
                    >
                      ← Back to Templates
                    </Button>
                  </div>
                </GlassmorphicCard>
              </div>

              {/* Enhanced Form Configuration */}
              <div className="max-w-7xl mx-auto">
                <EnhancedScenarioConfigurationForm />
              </div>
            </div>

            {/* Floating Action Button */}
            <FloatingRunButton isFormValid={isFormValid} onRunSimulation={runSimulation} />
          </div>
        )}

        {view === 'simulation' && simulationRunning && (
          <div className="p-6 px-10">
            <div className="max-w-4xl mx-auto">
              <GlassmorphicCard variant="accent" className="p-12">
                <SimulationLoader progress={progress} />
              </GlassmorphicCard>
            </div>
          </div>
        )}

        {view === 'results' && simulationComplete && (
          <div className="p-6 px-10 space-y-8">
            <div className="max-w-7xl mx-auto">
              <GlassmorphicCard variant="accent" className="p-8 mb-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 dark:from-emerald-400 dark:via-blue-400 dark:to-indigo-400">
                      Simulation Results
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed">
                      Analysis complete - review your supply chain impact assessment and resilience metrics
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Simulation completed successfully
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <WorkflowIcon className="w-4 h-4" />
                        Monte Carlo analysis
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleNewSimulation} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 h-12 px-8 text-base text-white rounded-xl"
                  >
                    <PlusIcon size={18} className="mr-3" />
                    New Simulation
                  </Button>
                </div>
              </GlassmorphicCard>
              
              <div className="space-y-6">
                <SimulationResults simulationId={currentSimulation?.simulation_id} />
              </div>
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
