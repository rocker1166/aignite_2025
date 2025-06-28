"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  Users,
  DollarSign,
  Network,
  Zap,
  Shield,
  Calendar,
  Play,
  MoreHorizontal,
} from "lucide-react"

interface StrategyOverviewProps {
  strategy: any
}

export function StrategyOverview({ strategy }: StrategyOverviewProps) {
  const keyMetrics = [
    { label: "Total Cost", value: strategy.cost, icon: DollarSign, color: "text-green-400" },
    { label: "Expected ROI", value: strategy.roi, icon: TrendingUp, color: "text-blue-400" },
    { label: "Affected Nodes", value: strategy.affectedNodes, icon: Network, color: "text-purple-400" },
    { label: "Team Size", value: "12 members", icon: Users, color: "text-orange-400" },
  ]

  const milestones = [
    { name: "Initial Assessment", status: "completed", date: "2024-01-15", progress: 100 },
    { name: "Resource Allocation", status: "completed", date: "2024-01-18", progress: 100 },
    { name: "Implementation Phase 1", status: "active", date: "2024-01-22", progress: 75 },
    { name: "Mid-point Review", status: "pending", date: "2024-01-28", progress: 0 },
    { name: "Implementation Phase 2", status: "pending", date: "2024-02-05", progress: 0 },
    { name: "Final Validation", status: "pending", date: "2024-02-12", progress: 0 },
  ]

  const riskFactors = [
    { factor: "Supply Chain Complexity", level: "Medium", impact: "Moderate delay risk" },
    { factor: "Resource Availability", level: "Low", impact: "Sufficient resources allocated" },
    { factor: "External Dependencies", level: "High", impact: "Weather and geopolitical factors" },
    { factor: "Technology Integration", level: "Medium", impact: "System compatibility concerns" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Strategy Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{strategy.name}</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{strategy.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{strategy.status}</Badge>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
              <div className="flex items-center gap-3 mb-2">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-slate-400 text-sm">{metric.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Progress Overview */}
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Overall Progress</span>
                <span className="text-white font-medium">{strategy.progress}%</span>
              </div>
              <Progress value={strategy.progress} className="h-2 bg-slate-700" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tasks Completed</span>
                <span className="text-white font-medium">
                  {strategy.completedTasks}/{strategy.totalTasks}
                </span>
              </div>
              <Progress value={(strategy.completedTasks / strategy.totalTasks) * 100} className="h-2 bg-slate-700" />
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Estimated Completion</span>
                <span className="text-white font-medium">{strategy.estimatedCompletion}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team & Resources */}
        <Card className="bg-slate-800/40 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              Team & Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assigned Team</span>
              <span className="text-white font-medium">{strategy.assignedTeam}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Updated</span>
              <span className="text-white font-medium">{strategy.lastUpdated}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Risk Level</span>
              <Badge
                className={`${
                  strategy.riskLevel === "high"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : strategy.riskLevel === "medium"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                }`}
              >
                {strategy.riskLevel}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones Timeline */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Strategy Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30"
              >
                <div className="flex-shrink-0">
                  {milestone.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : milestone.status === "active" ? (
                    <Zap className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{milestone.name}</span>
                    <span className="text-slate-400 text-sm">{milestone.date}</span>
                  </div>
                  <Progress value={milestone.progress} className="h-1.5 bg-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className="bg-slate-800/40 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-400" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {riskFactors.map((risk, index) => (
              <div key={index} className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{risk.factor}</span>
                  <Badge
                    className={`${
                      risk.level === "High"
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : risk.level === "Medium"
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                    }`}
                  >
                    {risk.level}
                  </Badge>
                </div>
                <p className="text-slate-400 text-sm">{risk.impact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
