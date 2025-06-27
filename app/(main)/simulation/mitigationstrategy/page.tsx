"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, Target, Clock, TrendingUp, CheckCircle, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { ImplementationRoadmapPanel } from "@/components/simulation/ImplementationRoadmapPanel"

// Hardcoded mitigation strategy data
const MITIGATION_STRATEGIES = {
  immediate: [
    {
      id: 1,
      title: "Activate Alternative Shipping Routes",
      description: "Immediately redirect shipments through Hong Kong and Ningbo ports",
      priority: "Critical",
      timeframe: "0-24 hours",
      costEstimate: "$120K",
      impactReduction: "25%",
      status: "ready"
    },
    {
      id: 2,
      title: "Emergency Inventory Release",
      description: "Deploy strategic inventory reserves from regional warehouses",
      priority: "High",
      timeframe: "0-12 hours", 
      costEstimate: "$45K",
      impactReduction: "15%",
      status: "ready"
    },
    {
      id: 3,
      title: "Supplier Communication Protocol",
      description: "Notify all tier-1 suppliers and activate contingency agreements",
      priority: "High",
      timeframe: "0-6 hours",
      costEstimate: "$5K",
      impactReduction: "10%",
      status: "ready"
    }
  ],
  shortTerm: [
    {
      id: 4,
      title: "Expedited Air Freight",
      description: "Charter air freight for critical components and high-priority orders",
      priority: "High",
      timeframe: "1-3 days",
      costEstimate: "$380K",
      impactReduction: "30%",
      status: "planning"
    },
    {
      id: 5,
      title: "Production Schedule Optimization",
      description: "Reschedule production to prioritize available materials",
      priority: "Medium",
      timeframe: "2-5 days",
      costEstimate: "$75K",
      impactReduction: "20%",
      status: "planning"
    },
    {
      id: 6,
      title: "Customer Communication Campaign",
      description: "Proactively communicate delays and revised delivery timelines",
      priority: "Medium",
      timeframe: "1-2 days",
      costEstimate: "$15K",
      impactReduction: "5%",
      status: "planning"
    }
  ],
  longTerm: [
    {
      id: 7,
      title: "Supply Chain Diversification",
      description: "Establish alternative supplier relationships in Southeast Asia",
      priority: "Strategic",
      timeframe: "30-90 days",
      costEstimate: "$2.1M",
      impactReduction: "60%",
      status: "recommended"
    },
    {
      id: 8,
      title: "Enhanced Buffer Inventory",
      description: "Increase safety stock levels for critical components by 40%",
      priority: "Strategic", 
      timeframe: "14-45 days",
      costEstimate: "$890K",
      impactReduction: "45%",
      status: "recommended"
    },
    {
      id: 9,
      title: "Regional Hub Expansion",
      description: "Establish backup distribution center in Vietnam",
      priority: "Strategic",
      timeframe: "60-180 days",
      costEstimate: "$4.5M",
      impactReduction: "70%",
      status: "recommended"
    }
  ]
}

const RISK_MITIGATION_METRICS = {
  currentRisk: 85,
  targetRisk: 35,
  costToImplement: "$8.1M",
  expectedROI: "2.4x",
  paybackPeriod: "18 months",
  riskReduction: "50%"
}

// Glassmorphic Card Component
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

function StrategyCard({ strategy, index }: { strategy: any, index: number }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
      case "High":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
      case "Strategic":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "planning":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "recommended":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <GlassmorphicCard className="p-4 sm:p-6 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg break-words">{strategy.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{strategy.timeframe}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <Badge className={`text-xs ${getPriorityColor(strategy.priority)}`}>
            {strategy.priority}
          </Badge>
          {getStatusIcon(strategy.status)}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {strategy.description}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
        <div>
          <p className="font-medium text-muted-foreground text-xs">Cost</p>
          <p className="font-semibold">{strategy.costEstimate}</p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground text-xs">Impact Reduction</p>
          <p className="font-semibold text-green-600 dark:text-green-400">{strategy.impactReduction}</p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground text-xs">Status</p>
          <p className="font-semibold capitalize">{strategy.status}</p>
        </div>
      </div>
    </GlassmorphicCard>
  )
}

// Roadmap steps for the panel
const ROADMAP_STEPS = [
  {
    title: "Crisis Response (0-24 hours)",
    description: "Activate alternative routes, release emergency inventory, and implement supplier communication protocols. Expected cost: $170K",
    color: "bg-red-500 text-white",
    icon: <AlertCircle className="h-6 w-6" />,
  },
  {
    title: "Recovery Operations (1-7 days)", 
    description: "Deploy air freight solutions, optimize production schedules, and maintain customer communication. Expected cost: $470K",
    color: "bg-orange-500 text-white",
    icon: <Clock className="h-6 w-6" />,
  },
  {
    title: "Strategic Resilience (30-180 days)",
    description: "Implement supply chain diversification, enhance buffer inventory, and expand regional capabilities. Expected cost: $7.5M",
    color: "bg-blue-500 text-white", 
    icon: <Shield className="h-6 w-6" />,
  },
]

export default function MitigationStrategyPage() {
  const router = useRouter()
  const [roadmapOpen, setRoadmapOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleBackToResults = () => {
    router.push("/simulation/result")
  }

  // Mobile roadmap section component
  const MobileRoadmapSection = () => (
    <div className="lg:hidden mb-8">
      <GlassmorphicCard variant="accent" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Implementation Roadmap</h2>
            <p className="text-sm text-muted-foreground">Strategic execution timeline</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {ROADMAP_STEPS.map((step, idx) => {
            const getStepColors = (index: number) => {
              const colorSchemes = [
                { bg: "bg-gradient-to-br from-red-500 to-red-600", border: "border-red-200/50", shadow: "shadow-red-500/20" },
                { bg: "bg-gradient-to-br from-orange-500 to-orange-600", border: "border-orange-200/50", shadow: "shadow-orange-500/20" },
                { bg: "bg-gradient-to-br from-blue-500 to-blue-600", border: "border-blue-200/50", shadow: "shadow-blue-500/20" }
              ];
              return colorSchemes[index] || colorSchemes[0];
            };
            
            const colors = getStepColors(idx);
            
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center shadow-lg ${colors.shadow} flex-shrink-0`}>
                  {step.icon}
                </div>
                <div className={`flex-1 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border ${colors.border} ${colors.shadow}`}>
                  <h3 className="font-semibold text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors.bg} rounded-full transition-all duration-1000`}
                        style={{ width: idx === 0 ? '100%' : idx === 1 ? '60%' : '20%' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {idx === 0 ? 'Ready' : idx === 1 ? 'In Progress' : 'Planned'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Total Impact</span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Complete implementation reduces supply chain risk by <span className="font-semibold">50%</span> with an expected ROI of <span className="font-semibold">2.4x</span>
          </p>
        </div>
      </GlassmorphicCard>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/60 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/15 dark:from-purple-900/30 dark:to-blue-900/25 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-400/10 dark:from-emerald-900/25 dark:to-teal-900/20 blur-3xl animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Roadmap Side Panel (desktop) & Drawer (mobile) */}
      <ImplementationRoadmapPanel
        steps={ROADMAP_STEPS}
        open={roadmapOpen}
        onClose={() => setRoadmapOpen(false)}
        isMobile={isMobile}
      />

      {/* Floating Roadmap Button (mobile only) */}
      <button
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg shadow-blue-500/25 p-4 flex items-center gap-2 transition-all duration-300 hover:scale-105"
        onClick={() => setRoadmapOpen(true)}
        aria-label="Open Implementation Roadmap"
      >
        <TrendingUp className="h-5 w-5" />
        <span className="font-semibold">Roadmap</span>
      </button>

      <div className="relative z-10 p-6 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto lg:pr-[440px]">
        {/* Header */}
        <GlassmorphicCard variant="accent" className="p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={handleBackToResults}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Results
                </Button>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400">
                Mitigation Strategy
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg sm:text-xl leading-relaxed">
                Comprehensive action plan to minimize disruption impact and enhance supply chain resilience
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Shield className="w-4 h-4" />
                  AI-recommended strategies
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Target className="w-4 h-4" />
                  Risk-optimized planning
                </div>
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        {/* Mobile Roadmap Section */}
        <MobileRoadmapSection />

        {/* Risk Reduction Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <GlassmorphicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Risk Level</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{RISK_MITIGATION_METRICS.currentRisk}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target Risk Level</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{RISK_MITIGATION_METRICS.targetRisk}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Implementation Cost</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{RISK_MITIGATION_METRICS.costToImplement}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected ROI</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{RISK_MITIGATION_METRICS.expectedROI}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </GlassmorphicCard>
        </div>

        {/* Strategy Tabs */}
        <Tabs defaultValue="immediate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-xl p-2">
            <TabsTrigger value="immediate" className="rounded-lg text-xs sm:text-sm">Immediate (0-24h)</TabsTrigger>
            <TabsTrigger value="shortterm" className="rounded-lg text-xs sm:text-sm">Short-term (1-7d)</TabsTrigger>
            <TabsTrigger value="longterm" className="rounded-lg text-xs sm:text-sm">Long-term (30-180d)</TabsTrigger>
          </TabsList>

          <TabsContent value="immediate" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h2 className="text-xl sm:text-2xl font-semibold">Immediate Response (0-24 hours)</h2>
                <Badge className="bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30">
                  Critical Actions
                </Badge>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {MITIGATION_STRATEGIES.immediate.map((strategy, index) => (
                  <StrategyCard key={strategy.id} strategy={strategy} index={index} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shortterm" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl sm:text-2xl font-semibold">Short-term Recovery (1-7 days)</h2>
                <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30">
                  Recovery Phase
                </Badge>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {MITIGATION_STRATEGIES.shortTerm.map((strategy, index) => (
                  <StrategyCard key={strategy.id} strategy={strategy} index={index} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="longterm" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl sm:text-2xl font-semibold">Long-term Resilience (30-180 days)</h2>
                <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">
                  Strategic Improvements
                </Badge>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {MITIGATION_STRATEGIES.longTerm.map((strategy, index) => (
                  <StrategyCard key={strategy.id} strategy={strategy} index={index} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
