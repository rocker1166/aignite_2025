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
  TrendingUp,
  CheckCircle,
  CalendarIcon
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import StrategyDashboard from "@/components/strategy-dashboard"

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
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <Button className="w-full" onClick={() => setIsSheetOpen(true)}>
                    View Implementation Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0 sm:max-w-none">
                    <div className="p-6 bg-white border-b">
                      <SheetHeader className="pb-2">
                        <SheetTitle>Implementation Plan: {selectedStrategy.title}</SheetTitle>
                        <SheetDescription>
                          Detailed implementation strategy and expected outcomes
                        </SheetDescription>
                      </SheetHeader>
                    </div>
                    
                    <StrategyDashboard scenarioId={`${selectedStrategy.title} - ${selectedStrategy.id}`} />
                  </SheetContent>
                </Sheet>
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

function ImplementationTimeline({ strategy }: { strategy: Strategy }) {
  // Generate implementation steps based on strategy type
  const getImplementationSteps = (strategy: Strategy) => {
    const baseSteps = [
      { title: "Initial Assessment", description: "Conduct assessment of current state and requirements", duration: "7 days" },
      { title: "Planning Phase", description: "Develop detailed implementation roadmap", duration: "14 days" },
      { title: "Team Alignment", description: "Brief team members and assign responsibilities", duration: "3 days" },
    ];

    // Add strategy-specific steps
    if (strategy.title.includes("Dual-Sourcing")) {
      return [...baseSteps,
        { title: "Supplier Evaluation", description: "Identify and evaluate backup suppliers", duration: "30 days" },
        { title: "Contract Negotiation", description: "Negotiate terms with selected suppliers", duration: "21 days" },
        { title: "Integration", description: "Integrate new suppliers into supply chain systems", duration: "15 days" },
      ];
    } else if (strategy.title.includes("Safety Stock")) {
      return [...baseSteps,
        { title: "Data Collection", description: "Gather historical demand and supply data", duration: "10 days" },
        { title: "Algorithm Development", description: "Develop AI models for optimization", duration: "18 days" },
        { title: "Inventory Adjustment", description: "Gradually adjust inventory levels across network", duration: "14 days" },
      ];
    } else if (strategy.title.includes("Transportation")) {
      return [...baseSteps,
        { title: "Route Analysis", description: "Analyze alternative transport routes", duration: "12 days" },
        { title: "Carrier Selection", description: "Identify backup carriers for critical lanes", duration: "14 days" },
        { title: "Route Testing", description: "Test alternative routes with small shipments", duration: "21 days" },
      ];
    } else {
      return [...baseSteps,
        { title: "Development Phase", description: "Deploy necessary technology or processes", duration: "21 days" },
        { title: "Testing Phase", description: "Test implementation in controlled environment", duration: "14 days" },
        { title: "Full Rollout", description: "Complete implementation across organization", duration: "14 days" },
      ];
    }
  };

  const steps = getImplementationSteps(strategy);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Implementation Timeline</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-border" />
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="relative pl-10">
                <div className="absolute left-[13px] top-1 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-medium leading-none">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-1">{step.description}</p>
                  <p className="text-xs font-medium text-muted-foreground">{step.duration}</p>
                </div>
              </div>
            ))}
            <div className="relative pl-10">
              <div className="absolute left-[13px] top-1 h-6 w-6 rounded-full border border-green-500 bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium leading-none">Final Review</h4>
                <p className="text-xs text-muted-foreground mt-1">Assess implementation success and gather learnings</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
