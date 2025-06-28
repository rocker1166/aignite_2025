"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from 'sonner'
import { Sparkles, Zap, Target, TrendingUp, Shield, Clock, BarChart3, Layers, Play, Settings, History, Plus, ArrowRight, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { WorkflowIcon, HistoryIcon } from "@/components/icons"
import { PlusIcon } from "@/components/icons/plus-icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { SimulationHistory } from "@/components/simulation/simulation-history"
import { SimulationLoader } from "@/components/simulation/test/simulation-loader"
import { AIScenarioSuggestions } from "@/components/simulation/test/ai-scenario-suggestions"
import { ScenarioProvider, useScenario, ScenarioData } from "@/lib/context/scenario-context"
import type { Simulation } from "@/lib/types/database"
import { getUserSupplyChains } from "@/lib/api/supply-chain"
import { createSimulation, updateSimulation, getSimulations, findCachedSimulation, createSimulationWithCache } from "@/lib/api/simulation"
import { useUser } from "@/lib/stores/user"
import { useImpact } from "@/lib/context/impact-context"

// Import separated components
import { SimulationHeader } from "./simulation-header"
import { FloatingRunButton } from "./floating-run-button"
import { EnhancedScenarioConfigurationForm } from "./enhanced-scenario-configuration-form"
import { ProfessionalTemplateSelection } from "./professional-template-selection"
import type { ApiResponse, SupplyChainData } from "./types"

// Enhanced Glassmorphic Card Component with improved styling
function GlassmorphicCard({ children, className = "", variant = "default", ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: "default" | "accent" | "subtle" | "premium";
  [key: string]: any 
}) {
  const variantStyles = {
    default: "border border-white/30 dark:border-slate-700/20 bg-white/80 dark:bg-slate-900/20 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/30",
    accent: "border border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-white/90 to-blue-50/80 dark:from-slate-900/30 dark:to-blue-950/20 backdrop-blur-xl shadow-xl shadow-blue-500/10 dark:shadow-blue-500/20",
    subtle: "border border-white/20 dark:border-slate-700/10 bg-white/60 dark:bg-slate-900/10 backdrop-blur-lg shadow-lg shadow-black/5 dark:shadow-black/20",
    premium: "border border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-white/95 via-purple-50/80 to-indigo-50/80 dark:from-slate-900/40 dark:via-purple-950/20 dark:to-indigo-950/20 backdrop-blur-xl shadow-2xl shadow-purple-500/15 dark:shadow-purple-500/25"
  }
  
  return (
    <Card 
      className={`${variantStyles[variant]} rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/40 hover:scale-[1.02] ${className}`} 
      {...props}
    >
      {children}
    </Card>
  )
}

// Enhanced Feature Card Component
function FeatureCard({ icon: Icon, title, description, color = "blue", onClick }: {
  icon: any;
  title: string;
  description: string;
  color?: "blue" | "purple" | "green" | "orange" | "red";
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
  }

  return (
    <GlassmorphicCard 
      className="p-6 cursor-pointer group hover:scale-105 transition-all duration-300"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 text-slate-800 dark:text-slate-200">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300" />
      </div>
    </GlassmorphicCard>
  )
}

// Enhanced Stats Card Component
function StatsCard({ icon: Icon, title, value, subtitle, trend, color = "blue" }: {
  icon: any;
  title: string;
  value: string;
  subtitle: string;
  trend?: { value: string; positive: boolean };
  color?: "blue" | "green" | "orange" | "red" | "purple";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600"
  }

  return (
    <GlassmorphicCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">{subtitle}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className={`h-3 w-3 ${trend.positive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-xs font-medium ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </GlassmorphicCard>
  )
}

function SimulationPageContent() {
  const router = useRouter()
  const [simulationHistory, setSimulationHistory] = useState<Simulation[]>([])
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null)
  const [isAIScenarioOpen, setIsAIScenarioOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  // View state management - simplified without query params
  const [view, setView] = useState('templates')
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationComplete, setSimulationComplete] = useState(false)
  
  // Navigation state to track when to navigate
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

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

  // Form validation - more robust checking
  const isFormValid = !!(
    scenarioData.scenarioName && 
    scenarioData.scenarioName.trim().length > 0 &&
    scenarioData.scenarioType && 
    scenarioData.scenarioType.trim().length > 0 &&
    scenarioData.affectedNode && 
    scenarioData.affectedNode.trim().length > 0 &&
    selectedSupplyChainId &&
    selectedSupplyChainId.trim().length > 0 &&
    scenarioData.disruptionSeverity > 0 &&
    scenarioData.disruptionDuration > 0
  )

  // Debug logging for form validation (moved to useEffect to avoid render-time side effects)
  useEffect(() => {
    console.log('🔧 Form validation debug:', {
      scenarioName: scenarioData.scenarioName,
      scenarioType: scenarioData.scenarioType,
      affectedNode: scenarioData.affectedNode,
      selectedSupplyChainId: selectedSupplyChainId,
      disruptionSeverity: scenarioData.disruptionSeverity,
      disruptionDuration: scenarioData.disruptionDuration,
      isFormValid: isFormValid
    })
  }, [scenarioData, selectedSupplyChainId, isFormValid])

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
            user_id: chain.user_id ?? null,
            name: chain.name,
            description: chain.description ?? null,
            form_data: chain.form_data ?? {},
            organisation: chain.organisation ?? {},
            timestamp: chain.timestamp ?? null
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
  }, [supplyChains, userData, selectedSupplyChainId])

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
      setView('simulation')
      setSimulationRunning(true)
      setSimulationComplete(false)
      setProgress(0)
      setPendingNavigation(null) // Reset any pending navigation

      // Check for cached simulation first
      console.log('🔍 Checking for cached simulation...')
      const cachedSimulation = await findCachedSimulation(scenarioData, selectedSupplyChainId)
      
      if (cachedSimulation) {
        console.log(`✅ Found cached simulation: ${cachedSimulation.simulation_id}`)
        toast.success("Found existing simulation with same parameters")
        setCurrentSimulation(cachedSimulation)
        
        // Fast progress for cached simulation
        const fastInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(fastInterval)
              setSimulationRunning(false)
              setSimulationComplete(true)
              
              console.log(`✅ Setting navigation for cached results: ${cachedSimulation.simulation_id}`)
              setPendingNavigation(`/simulation/result?id=${cachedSimulation.simulation_id}`)
              
              return 100
            }
            return prev + 25 // Faster progress for cached results
          })
        }, 200)
        
        return
      }

      console.log('📭 No cached simulation found, creating new simulation...')
      
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

      const created = await createSimulationWithCache(newSim, scenarioData)
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

      // Call the impact assessment agent with the simulation ID
      try {
        console.log(`🎯 Triggering impact assessment for simulation: ${created?.simulation_id}`)
        
        const response = await fetch('/api/agent/impact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            simulationId: created?.simulation_id,
            forceRefresh: true 
          })
        })

        const impactResponse = await response.json()
        
        if (response.ok && impactResponse.success) {
          console.log('✅ Impact assessment completed successfully:', impactResponse)
          toast.success("Impact assessment completed successfully")
          
          // Update simulation with enhanced results
          if (created?.simulation_id && impactResponse.data) {
            await updateSimulation(created.simulation_id, {
              status: "completed",
              result_summary: {
                enhanced_analysis: true,
                impact_assessment_completed: true,
                analysis_timestamp: new Date().toISOString(),
                ...impactResponse.data
              },
              simulated_at: new Date().toISOString()
            })
          }
        } else {
          console.warn('Impact assessment warning:', impactResponse.error)
          toast.warning("Impact assessment completed with warnings")
          
          // Still update simulation as completed but without enhanced data
          if (created?.simulation_id) {
            await updateSimulation(created.simulation_id, {
              status: "completed",
              result_summary: {
                enhanced_analysis: false,
                impact_assessment_completed: false,
                costImpact: "$1.2M",
                timeDelay: "14.5 days",
                inventoryImpact: "-42%",
                recoveryTime: "35 days"
              },
              simulated_at: new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.error('❌ Error calling impact assessment agent:', error)
        toast.error("Failed to run impact assessment, using basic simulation")
        
        // Fallback: Update simulation as completed without impact assessment
        if (created?.simulation_id) {
          await updateSimulation(created.simulation_id, {
            status: "completed",
            result_summary: {
              enhanced_analysis: false,
              impact_assessment_completed: false,
              error: "Impact assessment failed",
              costImpact: "$1.2M",
              timeDelay: "14.5 days",
              inventoryImpact: "-42%",
              recoveryTime: "35 days"
            },
            simulated_at: new Date().toISOString()
          })
        }
      } finally {
        setIsLoading(false)
      }

        const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setSimulationRunning(false)
            setSimulationComplete(true)
            
            // Set navigation URL for pending navigation
            if (created?.simulation_id) {
              console.log(`✅ Setting navigation for simulation: ${created.simulation_id}`)
              setPendingNavigation(`/simulation/result?id=${created.simulation_id}`)
            } else {
              console.warn('⚠️ No simulation ID available, setting basic results page navigation')
              setPendingNavigation('/simulation/result')
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
    setPendingNavigation(null) // Reset any pending navigation
    setCurrentSimulation(null)
  }

  // Function to view existing simulation results
  const handleViewSimulationResults = (simulationId: string) => {
    // Navigate directly to results page with simulation ID
    router.push(`/simulation/result?id=${simulationId}`)
  }

  // Handle navigation when simulation is complete
  useEffect(() => {
    if (simulationComplete && pendingNavigation) {
      console.log(`🎯 Navigating to: ${pendingNavigation}`)
      router.push(pendingNavigation)
      setPendingNavigation(null)
      
      if (selectedSupplyChainId) {
        fetchSimulationHistory(selectedSupplyChainId)
      }
    }
  }, [simulationComplete, pendingNavigation, selectedSupplyChainId, router])

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
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full border border-blue-200/30 dark:border-blue-800/30 mb-6">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Supply Chain Intelligence</span>
                </div>
                <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 mb-4">
                  Choose Your Simulation
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Start with AI-powered scenarios, professional templates, or build from scratch to analyze your supply chain resilience
                </p>
              </div>

              {/* Enhanced Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatsCard
                  icon={BarChart3}
                  title="Total Simulations"
                  value={simulationHistory.length.toString()}
                  subtitle="Completed analyses"
                  color="blue"
                />
                <StatsCard
                  icon={Target}
                  title="Success Rate"
                  value="94%"
                  subtitle="Effective strategies"
                  trend={{ value: "+2.3%", positive: true }}
                  color="green"
                />
                <StatsCard
                  icon={Clock}
                  title="Avg. Processing"
                  value="2.4s"
                  subtitle="Per simulation"
                  trend={{ value: "-0.8s", positive: true }}
                  color="orange"
                />
                <StatsCard
                  icon={Shield}
                  title="Risk Reduction"
                  value="67%"
                  subtitle="Average improvement"
                  trend={{ value: "+5.2%", positive: true }}
                  color="purple"
                />
              </div>
              
              {/* Enhanced Template Selection */}
              <ProfessionalTemplateSelection
                onTemplateSelect={handleTemplateSelect}
                onStartFromScratch={handleStartFromScratch}
                onAIScenarios={() => setIsAIScenarioOpen(true)}
                onSelectScenario={handleForecastScenarioSelect}
              />

              {/* Enhanced Quick Actions */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6 text-center">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FeatureCard
                    icon={Zap}
                    title="AI Scenario Generator"
                    description="Generate intelligent scenarios based on your supply chain data and market conditions"
                    color="purple"
                    onClick={() => setIsAIScenarioOpen(true)}
                  />
                  <FeatureCard
                    icon={Layers}
                    title="Template Library"
                    description="Access industry-specific templates for common supply chain disruption scenarios"
                    color="blue"
                    onClick={() => setView('form')}
                  />
                  <FeatureCard
                    icon={Play}
                    title="Start from Scratch"
                    description="Build a custom simulation with full control over all parameters and settings"
                    color="green"
                    onClick={handleStartFromScratch}
                  />
                </div>
              </div>

              {/* Enhanced Recent Activity */}
              {simulationHistory.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Recent Simulations</h2>
                    <Button variant="outline" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {simulationHistory.slice(0, 3).map((sim, index) => (
                      <GlassmorphicCard key={sim.simulation_id} className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => handleViewSimulationResults(sim.simulation_id)}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                              <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{sim.name || `Simulation ${index + 1}`}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-500">{sim.scenario_type}</p>
                            </div>
                          </div>
                          <Badge className={`text-xs ${
                            sim.status === 'completed' ? 'bg-green-500/15 text-green-700 dark:text-green-300' :
                            sim.status === 'running' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300' :
                            'bg-gray-500/15 text-gray-700 dark:text-gray-300'
                          }`}>
                            {sim.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-3 w-3" />
                            {new Date(sim.created_at).toLocaleDateString()}
                          </div>
                          {sim.result_summary && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <Target className="h-3 w-3" />
                              Impact: {sim.result_summary.costImpact || 'N/A'}
                            </div>
                          )}
                        </div>
                      </GlassmorphicCard>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'form' &&  (
          <div className="relative">
            <div className="p-6 px-10 space-y-8">
              {/* Enhanced Header Section */}
              <div className="max-w-7xl mx-auto">
                <GlassmorphicCard variant="premium" className="p-8 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Settings className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400">
                            Scenario Builder
                          </h1>
                          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-2xl">
                            Configure scenarios and analyze supply chain resilience with advanced Monte Carlo simulations
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Real-time analysis enabled
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          AI-powered insights
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Advanced security
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

              {/* Enhanced Form Configuration with Progress */}
              <div className="max-w-7xl mx-auto">
                {/* Form Progress Indicator */}
                <GlassmorphicCard className="p-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Configuration Progress</h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {isFormValid ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                    <Progress 
                      value={isFormValid ? 100 : 
                        (scenarioData.scenarioName ? 20 : 0) +
                        (scenarioData.scenarioType ? 20 : 0) +
                        (scenarioData.affectedNode ? 20 : 0) +
                        (selectedSupplyChainId ? 20 : 0) +
                        (scenarioData.disruptionSeverity > 0 ? 10 : 0) +
                        (scenarioData.disruptionDuration > 0 ? 10 : 0)
                      } 
                      className="h-2"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${scenarioData.scenarioName ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Name
                      </div>
                      <div className={`flex items-center gap-1 ${scenarioData.scenarioType ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Type
                      </div>
                      <div className={`flex items-center gap-1 ${scenarioData.affectedNode ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Node
                      </div>
                      <div className={`flex items-center gap-1 ${selectedSupplyChainId ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Chain
                      </div>
                      <div className={`flex items-center gap-1 ${scenarioData.disruptionSeverity > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Severity
                      </div>
                      <div className={`flex items-center gap-1 ${scenarioData.disruptionDuration > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                        <CheckCircle className="h-3 w-3" />
                        Duration
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>

                <EnhancedScenarioConfigurationForm />
              </div>
            </div>

            {/* Enhanced Floating Action Button */}
            <FloatingRunButton 
              isFormValid={isFormValid} 
              onRunSimulation={runSimulation} 
              scenarioData={scenarioData}
            />
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
