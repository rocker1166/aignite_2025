"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Shield,
  DollarSign,
  BarChart3,
  GitBranch
} from "lucide-react"

interface Node {
  id: number
  name: string
  riskLevel: string
  confidence: number
  status: string
  assignedTeam: string
  tasks: Array<{
    id: number
    title: string
    status: string
    deadline: string
    priority: string
    assignee: string
    blocker?: string
  }>
}

interface Strategy {
  id: number
  name: string
  progress: number
  totalTasks: number
  completedTasks: number
  cost: string
  roi: string
  riskReduction: string
}

interface LiveExecutionStatsProps {
  nodes: Node[]
  strategy: Strategy
}

export function LiveExecutionStats({ nodes, strategy }: LiveExecutionStatsProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate loading
    const loadingTimer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => {
      clearInterval(timer)
      clearTimeout(loadingTimer)
    }
  }, [])

  const getOverallProgress = () => {
    const totalTasks = nodes.reduce((sum, node) => sum + node.tasks.length, 0)
    const completedTasks = nodes.reduce((sum, node) => 
      sum + node.tasks.filter(task => task.status === "Done").length, 0
    )
    return Math.round((completedTasks / totalTasks) * 100)
  }

  const getBottleneckNodes = () => {
    return nodes.filter(node => {
      const blockedTasks = node.tasks.filter(task => task.status === "Blocked").length
      const totalTasks = node.tasks.length
      return (blockedTasks / totalTasks) > 0.3 // More than 30% blocked
    })
  }

  const getCriticalTasks = () => {
    return nodes.flatMap(node => 
      node.tasks.filter(task => task.priority === "critical")
    )
  }

  const getTeamWorkload = () => {
    const teamWorkload: { [key: string]: number } = {}
    nodes.forEach(node => {
      teamWorkload[node.assignedTeam] = (teamWorkload[node.assignedTeam] || 0) + node.tasks.length
    })
    return teamWorkload
  }

  const getRiskDistribution = () => {
    const distribution = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
    nodes.forEach(node => {
      distribution[node.riskLevel as keyof typeof distribution]++
    })
    return distribution
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800/60 border-slate-700/50 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-700 rounded mb-2" />
                <div className="h-8 bg-slate-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Live Execution Analytics</h2>
          <p className="text-slate-400">Real-time insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span>Live Data</span>
          <span>•</span>
          <span>Last updated: {formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Overall Progress</p>
                <p className="text-2xl font-bold text-white">{getOverallProgress()}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+2.3%</span>
                </div>
              </div>
            </div>
            <Progress value={getOverallProgress()} className="mt-4 h-2 bg-slate-700" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Completed Tasks</p>
                <p className="text-2xl font-bold text-white">{strategy.completedTasks}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+3 today</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              {Math.round((strategy.completedTasks / strategy.totalTasks) * 100)}% of total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Bottlenecks</p>
                <p className="text-2xl font-bold text-white">{getBottleneckNodes().length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">-1 resolved</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              {getBottleneckNodes().map(node => node.name).join(", ")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Critical Tasks</p>
                <p className="text-2xl font-bold text-white">{getCriticalTasks().length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">5 due today</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">
              {getCriticalTasks().filter(task => task.status === "Done").length} completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload */}
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Users className="w-5 h-5 text-blue-400" />
              Team Workload Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getTeamWorkload()).map(([team, workload], index) => (
                <div key={team} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{team}</span>
                    <span className="text-sm text-slate-400">{workload} tasks</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${(workload / Math.max(...Object.values(getTeamWorkload()))) * 100}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Shield className="w-5 h-5 text-yellow-400" />
              Risk Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getRiskDistribution()).map(([risk, count], index) => (
                <div key={risk} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      risk === "CRITICAL" ? "bg-red-400" :
                      risk === "HIGH" ? "bg-orange-400" :
                      risk === "MEDIUM" ? "bg-yellow-400" : "bg-green-400"
                    }`} />
                    <span className="text-sm font-medium text-white">{risk}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{count} nodes</span>
                    <Badge className={`text-xs ${
                      risk === "CRITICAL" ? "bg-red-500/20 text-red-400" :
                      risk === "HIGH" ? "bg-orange-500/20 text-orange-400" :
                      risk === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      {Math.round((count / nodes.length) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">{strategy.roi}</div>
              <div className="text-sm text-slate-400 font-medium">Projected ROI</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400">+2.1% vs target</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">{strategy.riskReduction}</div>
              <div className="text-sm text-slate-400 font-medium">Risk Reduction</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400">On track</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">{strategy.cost}</div>
              <div className="text-sm text-slate-400 font-medium">Total Cost</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">-5% under budget</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <GitBranch className="w-5 h-5 text-purple-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Task completed", details: "Secure alternate port clearance", time: "2 min ago", status: "success" },
              { action: "Bottleneck resolved", details: "Budget approval received for TSMC", time: "15 min ago", status: "warning" },
              { action: "New task added", details: "Emergency supplier evaluation", time: "1 hour ago", status: "info" },
              { action: "Risk level updated", details: "Port of LA risk reduced to MEDIUM", time: "2 hours ago", status: "success" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === "success" ? "bg-green-400" :
                  activity.status === "warning" ? "bg-yellow-400" :
                  activity.status === "info" ? "bg-blue-400" : "bg-slate-400"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-xs text-slate-400">{activity.details}</p>
                </div>
                <span className="text-xs text-slate-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 