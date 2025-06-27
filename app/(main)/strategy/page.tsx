"use client"

import { useState } from "react"
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
  DollarSign
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
import { useRouter } from "next/navigation"

// Enhanced strategy data with execution details
const strategies = [
  {
    id: 1,
    name: "Logistics Disruption Recovery",
    type: "Dual Sourcing",
    status: "active",
    priority: "high",
    progress: 65,
    estimatedCompletion: "14 days",
    cost: "$2.4M",
    roi: "+18%",
    confidence: 0.82,
    riskReduction: "45%",
    affectedNodes: 8,
    totalTasks: 24,
    completedTasks: 16,
    description: "Comprehensive recovery strategy for logistics disruption affecting raw material delivery to Secure Assembly.",
    lastUpdated: "2 hours ago",
    assignedTeam: "Supply Chain Alpha",
    teamLead: "Sarah Chen",
    riskLevel: "medium",
    scenarioSource: "Port Congestion Simulation",
    dateFinalized: "2024-01-15",
    nodes: [
      {
        id: 1,
        name: "Port of Los Angeles",
        riskLevel: "HIGH",
        confidence: 0.85,
        status: "In Progress",
        assignedTeam: "Logistics West",
        tasks: [
          { 
            id: 1, 
            title: "Secure alternate port clearance", 
            status: "To Do", 
            deadline: "3 days", 
            priority: "high", 
            assignee: "Mike Johnson",
            startDate: "2024-01-16",
            duration: 3,
            nodeName: "Port of Los Angeles",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z"
          },
          { 
            id: 2, 
            title: "Contract rerouting partner", 
            status: "Blocked", 
            deadline: "5 days", 
            priority: "critical", 
            assignee: "Lisa Wang", 
            blocker: "Awaiting budget approval",
            startDate: "2024-01-18",
            duration: 5,
            nodeName: "Port of Los Angeles",
            createdAt: "2024-01-15T11:00:00Z",
            updatedAt: "2024-01-16T16:00:00Z"
          },
          { 
            id: 3, 
            title: "Update customs declaration", 
            status: "Done", 
            deadline: "1 day", 
            priority: "medium", 
            assignee: "Alex Chen",
            startDate: "2024-01-15",
            duration: 1,
            nodeName: "Port of Los Angeles",
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-15T17:00:00Z"
          }
        ]
      },
      {
        id: 2,
        name: "TSMC Fab 21",
        riskLevel: "MEDIUM",
        confidence: 0.78,
        status: "Planning",
        assignedTeam: "Semiconductor Ops",
        tasks: [
          { 
            id: 4, 
            title: "Reallocate chip buffer stock", 
            status: "In Progress", 
            deadline: "2 days", 
            priority: "high", 
            assignee: "David Kim",
            startDate: "2024-01-17",
            duration: 2,
            nodeName: "TSMC Fab 21",
            createdAt: "2024-01-14T09:00:00Z",
            updatedAt: "2024-01-16T14:30:00Z"
          },
          { 
            id: 5, 
            title: "Accelerate dual-sourcing order", 
            status: "To Do", 
            deadline: "4 days", 
            priority: "critical", 
            assignee: "Emma Rodriguez",
            startDate: "2024-01-19",
            duration: 4,
            nodeName: "TSMC Fab 21",
            createdAt: "2024-01-14T15:00:00Z",
            updatedAt: "2024-01-14T15:00:00Z"
          }
        ]
      },
      {
        id: 3,
        name: "FedEx Hub Memphis",
        riskLevel: "LOW",
        confidence: 0.92,
        status: "Completed",
        assignedTeam: "Express Logistics",
        tasks: [
          { 
            id: 6, 
            title: "Implement priority routing", 
            status: "Done", 
            deadline: "1 day", 
            priority: "medium", 
            assignee: "Tom Wilson",
            startDate: "2024-01-15",
            duration: 1,
            nodeName: "FedEx Hub Memphis",
            createdAt: "2024-01-12T08:00:00Z",
            updatedAt: "2024-01-15T17:00:00Z"
          },
          { 
            id: 7, 
            title: "Update tracking systems", 
            status: "Done", 
            deadline: "1 day", 
            priority: "low", 
            assignee: "Rachel Green",
            startDate: "2024-01-15",
            duration: 1,
            nodeName: "FedEx Hub Memphis",
            createdAt: "2024-01-12T10:00:00Z",
            updatedAt: "2024-01-15T16:00:00Z"
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Manufacturing Slowdown Mitigation",
    type: "Capacity Optimization",
    status: "planning",
    priority: "critical",
    progress: 25,
    estimatedCompletion: "21 days",
    cost: "$3.8M",
    roi: "+24%",
    confidence: 0.76,
    riskReduction: "38%",
    affectedNodes: 12,
    totalTasks: 36,
    completedTasks: 9,
    description: "Strategic response to manufacturing capacity reduction at primary production facilities.",
    lastUpdated: "1 day ago",
    assignedTeam: "Operations Beta",
    teamLead: "James Miller",
    riskLevel: "high",
    scenarioSource: "Equipment Failure Analysis",
    dateFinalized: "2024-01-14",
    nodes: [
      {
        id: 4,
        name: "Assembly Line A",
        riskLevel: "CRITICAL",
        confidence: 0.65,
        status: "Planning",
        assignedTeam: "Production Alpha",
        tasks: [
          { 
            id: 8, 
            title: "Install backup equipment", 
            status: "To Do", 
            deadline: "7 days", 
            priority: "critical", 
            assignee: "Carlos Mendez",
            startDate: "2024-01-20",
            duration: 7,
            nodeName: "Assembly Line A",
            createdAt: "2024-01-13T11:00:00Z",
            updatedAt: "2024-01-13T11:00:00Z"
          },
          { 
            id: 9, 
            title: "Train operators on new system", 
            status: "To Do", 
            deadline: "10 days", 
            priority: "high", 
            assignee: "Jennifer Lee",
            startDate: "2024-01-23",
            duration: 10,
            nodeName: "Assembly Line A",
            createdAt: "2024-01-13T14:00:00Z",
            updatedAt: "2024-01-13T14:00:00Z"
          }
        ]
      }
    ]
  }
]

// Kanban board data
const kanbanColumns = [
  { id: "todo", title: "To Do", color: "bg-slate-700" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-600" },
  { id: "blocked", title: "Blocked", color: "bg-red-600" },
  { id: "done", title: "Done", color: "bg-green-600" }
]

export default function StrategyPage() {
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0])
  const [activeTab, setActiveTab] = useState("execution")
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-white">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg mt-2">
        <div className="flex h-16 items-center gap-x-4 px-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="-ml-2 flex items-center gap-x-1 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Scenario</span>
          </Button>
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-bold text-lg text-gray-900 dark:text-white truncate leading-tight">{selectedStrategy.name}</span>
            <span className="text-xs text-gray-600 dark:text-slate-400 truncate">{selectedStrategy.scenarioSource} • Finalized {selectedStrategy.dateFinalized}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 bg-transparent transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 bg-transparent transition-all duration-200"
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
        <div className="w-80 border-r border-gray-200 dark:border-slate-700/50 bg-gray-50/90 dark:bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Active Strategies</h3>
            <div className="space-y-4">
              {strategies.map((strategy, index) => (
                <Card
                  key={strategy.id}
                  className={`cursor-pointer transition-all duration-300 border-gray-200 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-lg hover:shadow-gray-500/10 dark:hover:shadow-slate-500/10 transform hover:-translate-y-1 ${
                    selectedStrategy.id === strategy.id
                      ? "bg-blue-50 dark:bg-slate-800/80 border-blue-300 dark:border-blue-500/50 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/20"
                      : "bg-white dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/60"
                  }`}
                  onClick={() => setSelectedStrategy(strategy)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">{strategy.name}</h4>
                      <div className="flex gap-1">
                        <Badge className={`text-xs px-2 py-1 ${getPriorityColor(strategy.priority)}`}>
                          {strategy.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-slate-400">Progress</span>
                        <span className="text-gray-900 dark:text-white font-medium">{strategy.progress}%</span>
                      </div>
                      <Progress value={strategy.progress} className="h-2 bg-gray-200 dark:bg-slate-700" />

                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-gray-200 dark:border-slate-700/50 bg-gray-50/90 dark:bg-slate-900/50 backdrop-blur-sm px-6 py-4">
              <TabsList className="bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700/50 p-1">
                <TabsTrigger
                  value="execution"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 transition-all duration-200"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Execution
                </TabsTrigger>
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 transition-all duration-200"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 transition-all duration-200"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Strategy Summary Panel */}
              <div className="p-6 border-b border-gray-200 dark:border-slate-700/50 bg-white dark:bg-gradient-to-r dark:from-slate-800/30 dark:to-slate-900/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
                  <Card className="min-w-0 bg-white dark:bg-slate-800/60 border-gray-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 dark:hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`flex flex-col items-center gap-y-2 ${showAIAssistant ? 'justify-start' : ''}`}>  
                        <div className={`mb-1 ${showAIAssistant ? 'self-start' : ''} p-3 ${showAIAssistant ? 'p-2' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''}`}>  
                          <Target className={`${showAIAssistant ? 'w-5 h-5' : 'w-6 h-6'} text-blue-400`} />
                        </div>
                        <p className={`font-bold text-gray-900 dark:text-white text-center ${showAIAssistant ? 'text-xs' : 'text-xs sm:text-sm md:text-base lg:text-lg'}`}>{selectedStrategy.type}</p>
                        <p className={`text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-slate-400 font-medium text-center ${showAIAssistant ? 'text-[9px]' : ''}`}>Strategy Type</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="min-w-0 bg-white dark:bg-slate-800/60 border-gray-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 dark:hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`flex flex-col items-center gap-y-2 ${showAIAssistant ? 'justify-start' : ''}`}>  
                        <div className={`mb-1 ${showAIAssistant ? 'self-start' : ''} p-3 ${showAIAssistant ? 'p-2' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''}`}>  
                          <TrendingUp className={`${showAIAssistant ? 'w-5 h-5' : 'w-6 h-6'} text-green-400`} />
                        </div>
                        <p className={`font-bold text-gray-900 dark:text-white text-center ${showAIAssistant ? 'text-xs' : 'text-xs sm:text-sm md:text-base lg:text-lg'}`}>{selectedStrategy.roi}</p>
                        <p className={`text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-slate-400 font-medium text-center ${showAIAssistant ? 'text-[9px]' : ''}`}>Projected ROI</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="min-w-0 bg-white dark:bg-slate-800/60 border-gray-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 dark:hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`flex flex-col items-center gap-y-2 ${showAIAssistant ? 'justify-start' : ''}`}>  
                        <div className={`mb-1 ${showAIAssistant ? 'self-start' : ''} p-3 ${showAIAssistant ? 'p-2' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''}`}>  
                          <Shield className={`${showAIAssistant ? 'w-5 h-5' : 'w-6 h-6'} text-yellow-400`} />
                        </div>
                        <p className={`font-bold text-gray-900 dark:text-white text-center ${showAIAssistant ? 'text-xs' : 'text-xs sm:text-sm md:text-base lg:text-lg'}`}>{selectedStrategy.riskReduction}</p>
                        <p className={`text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-slate-400 font-medium text-center ${showAIAssistant ? 'text-[9px]' : ''}`}>Risk Reduction</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="min-w-0 bg-white dark:bg-slate-800/60 border-gray-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 dark:hover:shadow-slate-500/10 transform hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className={`flex flex-col items-center gap-y-2 ${showAIAssistant ? 'justify-start' : ''}`}>  
                        <div className={`mb-1 ${showAIAssistant ? 'self-start' : ''} p-3 ${showAIAssistant ? 'p-2' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''} ${showAIAssistant ? '' : ''}`}>  
                          <Users className={`${showAIAssistant ? 'w-5 h-5' : 'w-6 h-6'} text-purple-400`} />
                        </div>
                        <p className={`font-bold text-gray-900 dark:text-white text-center ${showAIAssistant ? 'text-xs' : 'text-xs sm:text-sm md:text-base lg:text-lg'}`}>{selectedStrategy.teamLead}</p>
                        <p className={`text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-slate-400 font-medium text-center ${showAIAssistant ? 'text-[9px]' : ''}`}>Team Lead</p>
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
                  <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <Accordion type="single" collapsible className="space-y-4">
                      {selectedStrategy.nodes.map((node, index) => (
                        <AccordionItem 
                          key={node.id} 
                          value={`node-${node.id}`} 
                          className="border-gray-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/60 rounded-xl hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <AccordionTrigger className="px-6 py-5 hover:bg-gray-100 dark:hover:bg-slate-700/30 rounded-xl transition-all duration-200">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-4">
                                <h3 className={`font-semibold text-gray-900 dark:text-white ${showAIAssistant ? 'text-base sm:text-sm' : 'text-lg'}`}>{node.name}</h3>
                                <Badge className={`${getRiskLevelColor(node.riskLevel)} ${showAIAssistant ? 'text-xs px-2 py-1' : ''}`}>{node.riskLevel}</Badge>
                                <Badge className={`bg-blue-500/20 text-blue-400 border-blue-500/30 ${showAIAssistant ? 'text-xs px-2 py-1' : ''}`}>
                                  Confidence: {Math.round(node.confidence * 100)}%
                                </Badge>
                              </div>
                              <div className={`flex items-center gap-3 ${showAIAssistant ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-slate-400`}>
                                <span className="font-medium">{node.status}</span>
                                <span>•</span>
                                <span>{node.assignedTeam}</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <div className="space-y-4">
                              {node.tasks.map((task, taskIndex) => (
                                <div 
                                  key={task.id} 
                                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/40 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-all duration-200 transform hover:scale-[1.02]"
                                  style={{ animationDelay: `${taskIndex * 50}ms` }}
                                >
                                  <div className="flex items-center gap-4">
                                    {getTaskStatusIcon(task.status)}
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                                      <p className="text-sm text-gray-600 dark:text-slate-400">Assigned to {task.assignee}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                    <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">{task.deadline}</span>
                                    {task.blocker && (
                                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                        {task.blocker}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="overview" className="h-full m-0">
                <div className="p-6">
                  <LiveExecutionStats nodes={selectedStrategy.nodes} strategy={selectedStrategy} compact={showAIAssistant} />
                </div>
              </TabsContent>

              <TabsContent value="kanban" className="h-full m-0">
                <div className="p-6">
                  <StrategyKanban nodes={selectedStrategy.nodes} />
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
          <div className="w-80 h-[calc(100vh-120px)] border-l border-slate-700/50 bg-slate-900/50 backdrop-blur-sm animate-slide-in-right overflow-y-auto">
            <ExecutionAssistantAgent strategy={selectedStrategy} />
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
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
