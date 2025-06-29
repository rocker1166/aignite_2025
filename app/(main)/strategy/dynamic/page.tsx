"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Clock, 
  Play, 
  Filter, 
  Search, 
  ArrowLeft, 
  FileText, 
  Download, 
  MapPin, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  MessageSquare,
  BarChart3,
  Calendar,
  GitBranch,
  Zap,
  Shield,
  DollarSign,
  Loader2,
  RefreshCw
} from "lucide-react"
import { StrategyOverview } from "@/components/strategy/strategy-overview"
import { NodeBreakdown } from "@/components/strategy/node-breakdown"
import { TaskBoard } from "@/components/strategy/task-board"
import { StrategyMetrics } from "@/components/strategy/strategy-metrics"
import { ExecutionFlowMap } from "@/components/strategy/execution-flow-map"
import { StrategyKanban } from "@/components/strategy/strategy-kanban"
import { NodeGanttTimeline } from "@/components/strategy/node-gantt-timeline"
import { ExecutionAssistantAgent } from "@/components/strategy/execution-assistant-agent"
import { DependencyGraphModal } from "@/components/strategy/dependency-graph-modal"
import { LiveExecutionStats } from "@/components/strategy/live-execution-stats"
import { useToast } from "@/hooks/use-toast"

// Kanban board data
const kanbanColumns = [
  { id: "todo", title: "To Do", color: "bg-slate-700" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-600" },
  { id: "blocked", title: "Blocked", color: "bg-red-600" },
  { id: "done", title: "Done", color: "bg-green-600" }
]

// Default fallback data structure
const defaultStrategy = {
  id: 1,
  name: "Loading Strategy...",
  type: "Loading",
  status: "active" as const,
  priority: "medium" as const,
  progress: 0,
  estimatedCompletion: "Calculating...",
  cost: "$0",
  roi: "0%",
  confidence: 0,
  riskReduction: "0%",
  affectedNodes: 0,
  totalTasks: 0,
  completedTasks: 0,
  description: "Loading strategy details...",
  lastUpdated: "Loading...",
  assignedTeam: "TBD",
  teamLead: "TBD",
  riskLevel: "medium" as const,
  scenarioSource: "Loading...",
  dateFinalized: new Date().toISOString().split('T')[0],
  nodes: []
}

export default function StrategyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [strategies, setStrategies] = useState([defaultStrategy])
  const [selectedStrategy, setSelectedStrategy] = useState(defaultStrategy)
  const [activeTab, setActiveTab] = useState("execution")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get strategy ID from URL params
  const strategyId = searchParams.get('strategyId')

  // Fetch strategies list
  const fetchStrategiesList = async () => {
    try {
      const response = await fetch('/api/strategy/list')
      const result = await response.json()
      
      if (result.success && result.data?.length > 0) {
        setStrategies(result.data)
        
        // If strategyId in URL, find and select that strategy
        if (strategyId) {
          const strategy = result.data.find((s: any) => s.id === strategyId)
          if (strategy) {
            setSelectedStrategy(strategy)
          }
        } else {
          setSelectedStrategy(result.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching strategies:', error)
      setError('Failed to load strategies')
    }
  }

  // Fetch or generate strategy execution data
  const fetchStrategyExecutionData = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // First try to get existing execution data
      const existingResponse = await fetch(`/api/strategy/execution?strategyId=${id}`)
      const existingResult = await existingResponse.json()

      if (existingResult.success && existingResult.data) {
        setSelectedStrategy(existingResult.data)
        return
      }

      // If no existing data, generate new execution data using AI
      setGenerating(true)
      toast({
        title: "🤖 AI Agent Working",
        description: "Generating dynamic strategy execution plan...",
      })

      const generateResponse = await fetch('/api/agent/strategy-execution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId: id,
          supplyChainContext: {
            supplyChainId: searchParams.get('supplyChainId'),
            organizationName: searchParams.get('organizationName')
          },
          scenarioType: searchParams.get('scenarioType') || 'Supply Chain Disruption',
          organizationInfo: {
            industry: searchParams.get('industry'),
            employeeCount: searchParams.get('employeeCount'),
            location: searchParams.get('location')
          }
        })
      })

      const generateResult = await generateResponse.json()

      if (generateResult.success) {
        setSelectedStrategy(generateResult.data)
        
        // Save the generated data to database
        await fetch('/api/strategy/execution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            strategyId: id,
            ...generateResult.data
          })
        })

        toast({
          title: "✅ Strategy Generated",
          description: `Generated execution plan with ${generateResult.data.totalTasks} tasks across ${generateResult.data.affectedNodes} nodes`,
        })
      } else {
        throw new Error(generateResult.error || 'Failed to generate strategy')
      }

    } catch (error) {
      console.error('Error fetching strategy execution data:', error)
      setError('Failed to load strategy execution data')
      toast({
        title: "❌ Error",
        description: "Failed to generate strategy execution data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setGenerating(false)
    }
  }

  // Regenerate strategy data
  const regenerateStrategy = async () => {
    if (!strategyId) return
    await fetchStrategyExecutionData(strategyId)
  }

  useEffect(() => {
    fetchStrategiesList()
  }, [])

  useEffect(() => {
    if (strategyId) {
      fetchStrategyExecutionData(strategyId)
    }
  }, [strategyId])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "planning":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "Done":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "In Progress":
        return <Clock className="w-4 h-4 text-blue-400" />
      case "Blocked":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Pause className="w-4 h-4 text-slate-400" />
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "LOW":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <Card className="bg-slate-800/60 border-slate-700/50 p-8 text-center">
          <CardContent>
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Strategy</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white transition-colors duration-200 hover:bg-slate-800/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scenario
            </Button>
            <div className="h-6 w-px bg-slate-600" />
            <div className="animate-fade-in">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white mb-1">{selectedStrategy.name}</h1>
                {generating && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
              </div>
              <p className="text-sm text-slate-400">
                {selectedStrategy.scenarioSource} • Finalized {selectedStrategy.dateFinalized}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={regenerateStrategy}
              disabled={loading || !strategyId}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 bg-transparent transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 bg-transparent transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 bg-transparent transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <DependencyGraphModal nodes={selectedStrategy.nodes} />
            <Button 
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Strategy List Sidebar */}
        <div className="w-80 border-r border-slate-700/50 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6 text-white">Active Strategies</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-slate-800/40 border-slate-700/50 animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded mb-3"></div>
                      <div className="h-2 bg-slate-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {strategies.map((strategy, index) => (
                  <Card
                    key={strategy.id}
                    className={`cursor-pointer transition-all duration-300 border-slate-700/50 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1 ${
                      selectedStrategy.id === strategy.id
                        ? "bg-slate-800/80 border-blue-500/50 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/20"
                        : "bg-slate-800/40 hover:bg-slate-800/60"
                    }`}
                    onClick={() => {
                      setSelectedStrategy(strategy)
                      if (strategy.id !== strategyId) {
                        router.push(`/strategy?strategyId=${strategy.id}`)
                      }
                    }}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-white text-sm leading-tight">{strategy.name}</h4>
                        <div className="flex gap-1">
                          <Badge className={`text-xs px-2 py-1 ${getPriorityColor(strategy.priority)}`}>
                            {strategy.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white font-medium">{strategy.progress}%</span>
                        </div>
                        <Progress value={strategy.progress} className="h-2 bg-slate-700" />

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {strategy.estimatedCompletion}
                          </span>
                          <Badge className={`text-xs ${getStatusColor(strategy.status)}`}>{strategy.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm px-6 py-4">
              <TabsList className="bg-slate-800/50 border border-slate-700/50 p-1">
                <TabsTrigger
                  value="execution"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Execution
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Strategy Summary Panel */}
              <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-900/30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">Strategy Type</p>
                          <p className="text-lg font-bold text-white">{selectedStrategy.type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">Expected ROI</p>
                          <p className="text-lg font-bold text-white">{selectedStrategy.roi}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                          <Shield className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">Risk Reduction</p>
                          <p className="text-lg font-bold text-white">{selectedStrategy.riskReduction}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <DollarSign className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400 font-medium">Total Cost</p>
                          <p className="text-lg font-bold text-white">{selectedStrategy.cost}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <TabsContent value="execution" className="h-full m-0">
                <div className="p-6 space-y-8">
                  {/* Interactive Node Execution Map */}
                  <div className="animate-fade-in-up">
                    <ExecutionFlowMap nodes={selectedStrategy.nodes} />
                  </div>

                  {/* Node Breakdown Accordion */}
                  <div className="animate-fade-in-up animation-delay-200">
                    <NodeBreakdown nodes={selectedStrategy.nodes} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="overview" className="h-full m-0">
                <div className="p-6 space-y-8">
                  <StrategyOverview strategy={selectedStrategy} />
                  <StrategyMetrics strategy={selectedStrategy} />
                  <LiveExecutionStats strategy={selectedStrategy} />
                </div>
              </TabsContent>

              <TabsContent value="kanban" className="h-full m-0">
                <div className="p-6">
                  <StrategyKanban 
                    nodes={selectedStrategy.nodes} 
                    columns={kanbanColumns} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="h-full m-0">
                <div className="p-6">
                  <NodeGanttTimeline nodes={selectedStrategy.nodes} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* AI Assistant Sidebar */}
        {showAIAssistant && (
          <div className="w-96 border-l border-slate-700/50 bg-slate-900/50 backdrop-blur-sm animate-slide-in-right">
            <ExecutionAssistantAgent 
              strategy={selectedStrategy}
              onClose={() => setShowAIAssistant(false)}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-in-right {
          from { 
            transform: translateX(100%); 
          }
          to { 
            transform: translateX(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
