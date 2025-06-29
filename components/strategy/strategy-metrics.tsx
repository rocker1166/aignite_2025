"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  DollarSign,
  Target,
  Users,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react"

interface StrategyMetricsProps {
  strategy: any
}

export function StrategyMetrics({ strategy }: StrategyMetricsProps) {
  const performanceMetrics = [
    { label: "Strategy Effectiveness", value: 87, change: "+12%", trend: "up", color: "text-green-400" },
    { label: "Resource Utilization", value: 73, change: "+8%", trend: "up", color: "text-blue-400" },
    { label: "Risk Mitigation", value: 91, change: "+15%", trend: "up", color: "text-purple-400" },
    { label: "Cost Efficiency", value: 68, change: "-3%", trend: "down", color: "text-orange-400" },
  ]

  const nodePerformance = [
    { name: "Steel Supplier", recovery: 100, efficiency: 95, status: "optimal" },
    { name: "Parts Manufacturer", recovery: 75, efficiency: 68, status: "improving" },
    { name: "Logistics Hub", recovery: 35, efficiency: 42, status: "critical" },
    { name: "Assembly Plant", recovery: 90, efficiency: 85, status: "good" },
    { name: "Distribution Center", recovery: 100, efficiency: 98, status: "optimal" },
    { name: "Retail Network", recovery: 85, efficiency: 78, status: "good" },
  ]

  const timelineData = [
    { phase: "Week 1", planned: 25, actual: 28, efficiency: 112 },
    { phase: "Week 2", planned: 50, actual: 45, efficiency: 90 },
    { phase: "Week 3", planned: 75, actual: 65, efficiency: 87 },
    { phase: "Week 4", planned: 100, actual: 85, efficiency: 85 },
  ]

  const costBreakdown = [
    { category: "Emergency Resources", amount: 1200000, percentage: 32, color: "bg-red-500" },
    { category: "Alternative Suppliers", amount: 800000, percentage: 21, color: "bg-blue-500" },
    { category: "Logistics Rerouting", amount: 600000, percentage: 16, color: "bg-green-500" },
    { category: "Technology & Monitoring", amount: 450000, percentage: 12, color: "bg-purple-500" },
    { category: "Personnel & Training", amount: 350000, percentage: 9, color: "bg-orange-500" },
    { category: "Contingency Buffer", amount: 350000, percentage: 9, color: "bg-yellow-500" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "good":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "improving":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="bg-slate-800/40 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-slate-700/50">
                  {index === 0 && <Target className="w-5 h-5 text-green-400" />}
                  {index === 1 && <BarChart3 className="w-5 h-5 text-blue-400" />}
                  {index === 2 && <AlertTriangle className="w-5 h-5 text-purple-400" />}
                  {index === 3 && <DollarSign className="w-5 h-5 text-orange-400" />}
                </div>
                <div className={`flex items-center gap-1 text-sm ${metric.color}`}>
                  {metric.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{metric.change}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-slate-400 text-sm">{metric.label}</h3>
                <div className="text-2xl font-bold text-white">{metric.value}%</div>
                <Progress value={metric.value} className="h-2 bg-slate-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Node Performance Matrix */}
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Node Performance Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodePerformance.map((node, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-medium">{node.name}</span>
                    <Badge className={getStatusColor(node.status)}>{node.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Recovery</span>
                        <span className="text-white">{node.recovery}%</span>
                      </div>
                      <Progress value={node.recovery} className="h-1.5 bg-slate-600" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Efficiency</span>
                        <span className="text-white">{node.efficiency}%</span>
                      </div>
                      <Progress value={node.efficiency} className="h-1.5 bg-slate-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-400" />
              Cost Breakdown Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white text-sm">{item.category}</span>
                      <span className="text-slate-400 text-sm">{item.percentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Progress value={item.percentage} className="h-1.5 bg-slate-700 flex-1 mr-3" />
                      <span className="text-white font-medium text-sm">${(item.amount / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Strategy Cost</span>
                <span className="text-white font-bold text-lg">$3.75M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Performance */}
   

      {/* Real-time Alerts */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Real-time Strategy Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-red-400 font-medium">Critical Delay Alert</span>
                  <span className="text-slate-400 text-xs">2 minutes ago</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Logistics Hub recovery behind schedule by 15%. Immediate action required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-yellow-400 font-medium">Resource Allocation Warning</span>
                  <span className="text-slate-400 text-xs">15 minutes ago</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Parts Manufacturer approaching resource capacity limits. Consider additional allocation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-green-400 font-medium">Milestone Achieved</span>
                  <span className="text-slate-400 text-xs">1 hour ago</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Steel Supplier recovery completed successfully. All systems operational.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-400 font-medium">Team Performance Update</span>
                  <span className="text-slate-400 text-xs">3 hours ago</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Supply Chain Alpha team exceeded efficiency targets by 12% this week.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
