"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Clock, 
  DollarSign, 
  Scale,
  Shield, 
  TrendingUp 
} from "lucide-react"

interface Strategy {
  id: string
  title: string
  description: string
  impact: number
  feasibility: number
  cost: number
  timeToImplement: number
  riskReduction: number
  tags: string[]
  status: 'recommended' | 'in-progress' | 'implemented'
}

const mockStrategies: Strategy[] = [
  {
    id: "1",
    title: "Dual-Sourcing Implementation",
    description: "Establish backup suppliers for critical components to reduce single-source dependencies.",
    impact: 85,
    feasibility: 75,
    cost: 150000,
    timeToImplement: 90,
    riskReduction: 35,
    tags: ["supplier-risk", "high-impact", "medium-cost"],
    status: "recommended"
  },
  {
    id: "2",
    title: "Safety Stock Optimization",
    description: "Implement AI-driven inventory management to optimize safety stock levels.",
    impact: 70,
    feasibility: 90,
    cost: 80000,
    timeToImplement: 45,
    riskReduction: 25,
    tags: ["inventory", "quick-win", "cost-effective"],
    status: "in-progress"
  },
  {
    id: "3",
    title: "Alternative Transportation Routes",
    description: "Develop backup transportation routes and carrier relationships.",
    impact: 65,
    feasibility: 85,
    cost: 120000,
    timeToImplement: 60,
    riskReduction: 30,
    tags: ["logistics", "medium-impact", "resilience"],
    status: "recommended"
  },
  {
    id: "4",
    title: "Supplier Risk Monitoring System",
    description: "Deploy real-time monitoring system for early warning of supplier risks.",
    impact: 90,
    feasibility: 70,
    cost: 200000,
    timeToImplement: 120,
    riskReduction: 40,
    tags: ["digital", "high-impact", "proactive"],
    status: "implemented"
  }
]

export function StrategyRecommendations() {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [filter, setFilter] = useState<'all' | 'recommended' | 'in-progress' | 'implemented'>('all')

  const filteredStrategies = mockStrategies.filter(
    strategy => filter === 'all' || strategy.status === filter
  )

  const getStatusColor = (status: Strategy['status']) => {
    switch (status) {
      case 'recommended':
        return 'bg-blue-500/10 text-blue-500'
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'implemented':
        return 'bg-green-500/10 text-green-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'recommended' ? 'default' : 'outline'}
            onClick={() => setFilter('recommended')}
          >
            Recommended
          </Button>
          <Button 
            variant={filter === 'in-progress' ? 'default' : 'outline'}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </Button>
          <Button 
            variant={filter === 'implemented' ? 'default' : 'outline'}
            onClick={() => setFilter('implemented')}
          >
            Implemented
          </Button>
        </div>

        <div className="space-y-4">
          {filteredStrategies.map((strategy) => (
            <Card
              key={strategy.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedStrategy?.id === strategy.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedStrategy(strategy)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{strategy.title}</h3>
                      <Badge variant="secondary" className={getStatusColor(strategy.status)}>
                        {strategy.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="md:col-span-1">
        {selectedStrategy ? (
          <Card>
            <CardHeader>
              <CardTitle>Strategy Details</CardTitle>
              <CardDescription>
                Detailed analysis and implementation insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label icon={TrendingUp}>Impact Score</Label>
                <Progress value={selectedStrategy.impact} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {selectedStrategy.impact}% potential impact
                </div>
              </div>

              <div className="space-y-2">
                <Label icon={CheckCircle2}>Feasibility</Label>
                <Progress value={selectedStrategy.feasibility} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  {selectedStrategy.feasibility}% feasible
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MetricCard
                  icon={DollarSign}
                  label="Cost"
                  value={`$${(selectedStrategy.cost / 1000).toFixed(0)}k`}
                />
                <MetricCard
                  icon={Clock}
                  label="Time"
                  value={`${selectedStrategy.timeToImplement} days`}
                />
                <MetricCard
                  icon={Shield}
                  label="Risk Reduction"
                  value={`${selectedStrategy.riskReduction}%`}
                />
                <MetricCard
                  icon={Scale}
                  label="ROI Timeline"
                  value={`${(selectedStrategy.cost / (selectedStrategy.impact * 5000)).toFixed(1)} years`}
                />
              </div>

              <div className="pt-4">
                <Button className="w-full">
                  View Implementation Plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <p>Select a strategy to view detailed analysis</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Label({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Icon className="h-4 w-4" />
      {children}
    </div>
  )
}

function MetricCard({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: any; 
  label: string; 
  value: string 
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm font-medium mb-1">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className="text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}
