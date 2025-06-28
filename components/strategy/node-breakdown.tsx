"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Factory,
  Truck,
  Warehouse,
  Store,
  CheckCircle,
  Clock,
  TrendingUp,
  ChevronRight,
  BarChart3,
  Target,
  Zap,
} from "lucide-react"

interface NodeBreakdownProps {
  strategy: any
}

const supplyChainNodes = [
  {
    id: 1,
    name: "Steel Supplier",
    type: "supplier",
    status: "recovered",
    impact: "high",
    progress: 100,
    actions: 8,
    completedActions: 8,
    estimatedRecovery: "Completed",
    currentCapacity: 95,
    targetCapacity: 100,
    icon: Factory,
    riskLevel: "low",
    details: {
      description: "Primary steel supplier for manufacturing operations",
      keyActions: [
        "Establish backup supplier contracts",
        "Increase inventory buffer by 20%",
        "Implement quality monitoring system",
        "Set up automated reorder triggers",
      ],
      metrics: {
        downtime: "0 hours",
        costImpact: "$120K",
        recoveryTime: "3 days",
      },
    },
  },
  {
    id: 2,
    name: "Parts Manufacturer",
    type: "manufacturer",
    status: "recovering",
    impact: "critical",
    progress: 75,
    actions: 12,
    completedActions: 9,
    estimatedRecovery: "5 days",
    currentCapacity: 60,
    targetCapacity: 85,
    icon: Factory,
    riskLevel: "medium",
    details: {
      description: "Critical component manufacturing facility",
      keyActions: [
        "Deploy emergency production team",
        "Activate secondary production line",
        "Expedite raw material delivery",
        "Implement 24/7 monitoring",
      ],
      metrics: {
        downtime: "48 hours",
        costImpact: "$850K",
        recoveryTime: "7 days",
      },
    },
  },
  {
    id: 3,
    name: "Logistics Hub",
    type: "logistics",
    status: "disrupted",
    impact: "high",
    progress: 35,
    actions: 15,
    completedActions: 5,
    estimatedRecovery: "12 days",
    currentCapacity: 25,
    targetCapacity: 90,
    icon: Truck,
    riskLevel: "high",
    details: {
      description: "Central distribution and logistics coordination center",
      keyActions: [
        "Reroute shipments through alternate hubs",
        "Deploy additional transport vehicles",
        "Coordinate with backup logistics partners",
        "Implement real-time tracking system",
      ],
      metrics: {
        downtime: "72 hours",
        costImpact: "$1.2M",
        recoveryTime: "14 days",
      },
    },
  },
  {
    id: 4,
    name: "Assembly Plant",
    type: "assembly",
    status: "at-risk",
    impact: "medium",
    progress: 90,
    actions: 6,
    completedActions: 5,
    estimatedRecovery: "2 days",
    currentCapacity: 80,
    targetCapacity: 95,
    icon: Factory,
    riskLevel: "low",
    details: {
      description: "Final assembly and quality control facility",
      keyActions: [
        "Adjust production schedule",
        "Increase quality checkpoints",
        "Coordinate with upstream suppliers",
        "Prepare contingency plans",
      ],
      metrics: {
        downtime: "12 hours",
        costImpact: "$200K",
        recoveryTime: "3 days",
      },
    },
  },
  {
    id: 5,
    name: "Distribution Center",
    type: "warehouse",
    status: "stable",
    impact: "low",
    progress: 100,
    actions: 4,
    completedActions: 4,
    estimatedRecovery: "Stable",
    currentCapacity: 98,
    targetCapacity: 100,
    icon: Warehouse,
    riskLevel: "low",
    details: {
      description: "Regional distribution and storage facility",
      keyActions: [
        "Maintain inventory levels",
        "Monitor incoming shipments",
        "Prepare for increased throughput",
        "Coordinate with retail partners",
      ],
      metrics: {
        downtime: "0 hours",
        costImpact: "$0",
        recoveryTime: "N/A",
      },
    },
  },
  {
    id: 6,
    name: "Retail Network",
    type: "retail",
    status: "monitoring",
    impact: "medium",
    progress: 85,
    actions: 7,
    completedActions: 6,
    estimatedRecovery: "3 days",
    currentCapacity: 75,
    targetCapacity: 90,
    icon: Store,
    riskLevel: "medium",
    details: {
      description: "Customer-facing retail and service locations",
      keyActions: [
        "Communicate with customers about delays",
        "Adjust inventory allocation",
        "Implement priority fulfillment",
        "Monitor customer satisfaction",
      ],
      metrics: {
        downtime: "6 hours",
        costImpact: "$300K",
        recoveryTime: "4 days",
      },
    },
  },
]

export function NodeBreakdown({ strategy }: NodeBreakdownProps) {
  const [selectedNode, setSelectedNode] = useState(supplyChainNodes[0])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "recovered":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "recovering":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "disrupted":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "at-risk":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "stable":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "monitoring":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "text-red-400"
      case "high":
        return "text-orange-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Node List */}
        <div className="space-y-3 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Supply Chain Nodes</h3>
          {supplyChainNodes.map((node) => (
            <Card
              key={node.id}
              className={`cursor-pointer transition-all duration-200 border-gray-200 shadow-md dark:border-slate-700/50 hover:border-slate-600 ${
                selectedNode.id === node.id
                  ? "bg-gray-100 border-blue-500/50 shadow-lg shadow-blue-500/10 dark:bg-slate-800/80"
                  : "bg-white hover:bg-gray-50 dark:bg-slate-800/40"
              }`}
              onClick={() => setSelectedNode(node)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-slate-700/50">
                    <node.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-800 dark:text-white text-sm truncate">{node.name}</h4>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-400 flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`text-xs ${getStatusColor(node.status)}`}>{node.status}</Badge>
                      <span className={`text-xs font-medium ${getImpactColor(node.impact)}`}>{node.impact} impact</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-slate-400">Progress</span>
                        <span className="text-gray-800 dark:text-white font-bold">{node.progress}%</span>
                      </div>
                      <Progress value={node.progress} className="h-1.5 bg-gray-200 dark:bg-slate-700" />

                      <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400">
                        <span>
                          {node.completedActions}/{node.actions} actions
                        </span>
                        <span>{node.estimatedRecovery}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Node Details */}
        <div className="col-span-2 space-y-6 overflow-y-auto">
          {/* Node Header */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-700/50">
                    <selectedNode.icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{selectedNode.name}</h2>
                    <p className="text-slate-300 text-sm">{selectedNode.details.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedNode.status)}>{selectedNode.status}</Badge>
                  <Badge className={getRiskColor(selectedNode.riskLevel)}>{selectedNode.riskLevel} risk</Badge>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400 text-xs">Progress</span>
                  </div>
                  <div className="text-lg font-bold text-white">{selectedNode.progress}%</div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-green-400" />
                    <span className="text-slate-400 text-xs">Capacity</span>
                  </div>
                  <div className="text-lg font-bold text-white">{selectedNode.currentCapacity}%</div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-slate-400 text-xs">Recovery</span>
                  </div>
                  <div className="text-lg font-bold text-white">{selectedNode.estimatedRecovery}</div>
                </div>
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-400 text-xs">Actions</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {selectedNode.completedActions}/{selectedNode.actions}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Recovery Chart */}
          <Card className="bg-slate-800/40 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Capacity Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current Capacity</span>
                  <span className="text-white font-medium">{selectedNode.currentCapacity}%</span>
                </div>
                <Progress value={selectedNode.currentCapacity} className="h-3 bg-slate-700" />

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target Capacity</span>
                  <span className="text-white font-medium">{selectedNode.targetCapacity}%</span>
                </div>
                <Progress value={selectedNode.targetCapacity} className="h-2 bg-slate-700" />
              </div>
            </CardContent>
          </Card>

          {/* Key Actions */}
          <Card className="bg-slate-800/40 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Key Recovery Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedNode.details.keyActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 border border-slate-600/30"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact Metrics */}
          <Card className="bg-slate-800/40 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Impact Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="text-2xl font-bold text-red-400 mb-1">{selectedNode.details.metrics.downtime}</div>
                  <div className="text-slate-400 text-sm">Total Downtime</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="text-2xl font-bold text-orange-400 mb-1">
                    {selectedNode.details.metrics.costImpact}
                  </div>
                  <div className="text-slate-400 text-sm">Cost Impact</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {selectedNode.details.metrics.recoveryTime}
                  </div>
                  <div className="text-slate-400 text-sm">Recovery Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
