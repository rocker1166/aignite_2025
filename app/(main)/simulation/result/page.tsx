"use client"

import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Eye, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Package,
  CheckCircle,
  Activity
} from "lucide-react"
import NodeImpactGridWithVisualize from "@/components/simulation/node-impact-grid-with-visualize"
import { DEFAULT_SIMULATION_NODES } from "@/lib/data/simulation-nodes"
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card"

// Types for better type safety
interface SimulationMetrics {
  totalCostImpact: string;
  averageDelay: string;
  inventoryReduction: string;
  recoveryTime: string;
  affectedNodes: number;
  criticalPath: string;
}

interface SimulationResults {
  scenarioName: string;
  scenarioType: string;
  status: string;
  completedAt: string;
  metrics: SimulationMetrics;
  keyFindings: string[];
  impactBreakdown: string[];
  riskFactors: string[];
}

interface AnalysisItem {
  type: 'finding' | 'impact';
  content: string;
  index: number;
}

// Hardcoded simulation result data
const HARDCODED_RESULTS: SimulationResults = {
  scenarioName: "Port Closure Disruption Q3 2025",
  scenarioType: "Infrastructure Disruption",
  status: "completed",
  completedAt: "2025-06-27T14:30:00Z",
  metrics: {
    totalCostImpact: "$2.4M",
    averageDelay: "18.5 days",
    inventoryReduction: "38%",
    recoveryTime: "42 days",
    affectedNodes: 15,
    criticalPath: "Port → Warehouse → Distribution Center"
  },
  keyFindings: [
    "Primary disruption at Shanghai Port affects 60% of inbound shipments",
    "Alternative routing through Hong Kong reduces impact by 25%",
    "Inventory buffers insufficient for disruptions longer than 14 days",
    "Electronics and automotive sectors show highest vulnerability",
    "Recovery timeline extends beyond Q3 projections by 2 weeks"
  ],
  impactBreakdown: [
    "Direct operational costs increased by $1.2M due to expedited shipping",
    "Lost sales revenue estimated at $800K from delayed product launches", 
    "Additional storage costs of $400K for rerouted inventory",
    "Labor overtime costs of $300K for accelerated recovery operations",
    "Supplier penalty fees totaling $150K for contract delays"
  ],
  riskFactors: [
    "High dependency on single port creates bottleneck vulnerability",
    "Limited alternative shipping routes increase recovery complexity",
    "Seasonal demand peak coincides with disruption period",
    "Supplier contracts lack sufficient force majeure provisions",
    "Inventory management strategy needs buffer optimization"
  ]
}

// Metric card data configuration
const METRIC_CARDS = [
  {
    label: "Total Cost Impact",
    value: HARDCODED_RESULTS.metrics.totalCostImpact,
    icon: DollarSign,
    color: "text-red-600 dark:text-red-400",
    iconColor: "text-red-500"
  },
  {
    label: "Average Delay",
    value: HARDCODED_RESULTS.metrics.averageDelay,
    icon: Clock,
    color: "text-orange-600 dark:text-orange-400",
    iconColor: "text-orange-500"
  },
  {
    label: "Inventory Impact",
    value: HARDCODED_RESULTS.metrics.inventoryReduction,
    icon: Package,
    color: "text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-500"
  },
  {
    label: "Recovery Time",
    value: HARDCODED_RESULTS.metrics.recoveryTime,
    icon: TrendingUp,
    color: "text-blue-600 dark:text-blue-400",
    iconColor: "text-blue-500"
  }
] as const

export default function SimulationResultPage() {
  const router = useRouter()

  // Memoize navigation handlers
  const handleBackToSimulation = useMemo(() => () => {
    router.push("/simulation")
  }, [router])

  const handleViewMitigationStrategy = useMemo(() => () => {
    router.push("/simulation/mitigationstrategy")
  }, [router])

  // Memoize date formatting
  const formattedDate = useMemo(() => {
    return new Date(HARDCODED_RESULTS.completedAt).toLocaleString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }, [])

  // Memoize combined analysis to prevent recalculation
  const combinedAnalysis = useMemo((): AnalysisItem[] => {
    const analysis: AnalysisItem[] = []
    const maxLength = Math.max(HARDCODED_RESULTS.keyFindings.length, HARDCODED_RESULTS.impactBreakdown.length)
    
    for (let i = 0; i < maxLength; i++) {
      if (i < HARDCODED_RESULTS.keyFindings.length) {
        analysis.push({
          type: 'finding',
          content: HARDCODED_RESULTS.keyFindings[i],
          index: i + 1
        })
      }
      if (i < HARDCODED_RESULTS.impactBreakdown.length) {
        analysis.push({
          type: 'impact',
          content: HARDCODED_RESULTS.impactBreakdown[i],
          index: i + 1
        })
      }
    }
    return analysis
  }, [])

  // Component for rendering metric cards
  const MetricCard = ({ label, value, icon: Icon, color, iconColor }: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    iconColor: string;
  }) => (
    <GlassmorphicCard className="p-6 hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-current opacity-10 rounded-full blur-lg"></div>
          <Icon className={`h-8 w-8 ${iconColor} relative z-10`} />
        </div>
      </div>
    </GlassmorphicCard>
  )

  // Component for rendering analysis items
  const AnalysisItem = ({ item, index }: { item: AnalysisItem; index: number }) => {
    const isFinding = item.type === 'finding'
    const baseClass = "flex items-start gap-4 p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300"
    const findingClass = "bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200/40 dark:border-blue-800/30"
    const impactClass = "bg-gradient-to-r from-red-50/70 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/10 border-red-200/40 dark:border-red-800/30"
    
    return (
      <div 
        className="group transform transition-all duration-700 hover:scale-[1.02] animate-fade-in"
        style={{
          animationDelay: `${index * 150}ms`
        }}
      >
        <div className={`${baseClass} ${isFinding ? findingClass : impactClass}`}>
          <div className={`w-12 h-12 ${
            isFinding 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-red-500 to-pink-600'
          } text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
            {isFinding ? (
              <span className="text-lg font-bold">{item.index}</span>
            ) : (
              <DollarSign className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${
                isFinding 
                  ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30' 
                  : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'
              }`}>
                {isFinding ? 'Key Finding' : 'Financial Impact'}
              </Badge>
            </div>
            <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {item.content}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/60 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Background Elements - Optimized for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400/20 to-blue-400/15 dark:from-emerald-900/30 dark:to-blue-900/25 blur-3xl animate-pulse will-change-transform"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/15 to-indigo-400/10 dark:from-blue-900/25 dark:to-indigo-900/20 blur-3xl animate-pulse [animation-delay:2s] will-change-transform"></div>
      </div>

      <div className="relative z-10 p-6 px-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <GlassmorphicCard variant="accent" className="p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4">              <Button 
                variant="ghost" 
                onClick={handleBackToSimulation}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Navigate back to simulation page"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Simulation
              </Button>
                  <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    {HARDCODED_RESULTS.status.toUpperCase()}
                  </Badge>
                </div>
                <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 dark:from-emerald-400 dark:via-blue-400 dark:to-indigo-400">
                  Simulation Results
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed">
                  {HARDCODED_RESULTS.scenarioName} • {HARDCODED_RESULTS.scenarioType}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Completed {formattedDate}
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleViewMitigationStrategy}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 h-12 px-8 text-base text-white rounded-xl"
                aria-label="View detailed mitigation strategy"
              >
                <Eye className="mr-2 h-5 w-5" />
                View Mitigation Strategy
              </Button>
            </div>
          </GlassmorphicCard>

          {/* Key Metrics */}
          <section aria-labelledby="metrics-title">
            <h2 id="metrics-title" className="sr-only">Key Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {METRIC_CARDS.map((metric, index) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </div>
          </section>

          {/* Scenario Overview */}
          <section aria-labelledby="overview-title">
            <h2 id="overview-title" className="sr-only">Scenario Overview and Risk Assessment</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <GlassmorphicCard variant="accent" className="p-8">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <TrendingDown className="h-6 w-6 text-blue-500" />
                  Scenario Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Affected Nodes</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{HARDCODED_RESULTS.metrics.affectedNodes}</span>
                  </div>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/30 dark:border-slate-700/30">
                    <span className="font-medium text-slate-700 dark:text-slate-300 block mb-2">Critical Path</span>
                    <span className="text-slate-600 dark:text-slate-400">{HARDCODED_RESULTS.metrics.criticalPath}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/30 dark:border-emerald-800/30">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Disruption Type</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{HARDCODED_RESULTS.scenarioType}</span>
                  </div>
                </div>
              </CardContent>
            </GlassmorphicCard>

            <GlassmorphicCard variant="subtle" className="p-8">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {HARDCODED_RESULTS.riskFactors.slice(0, 3).map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-amber-50/30 dark:bg-amber-950/10 rounded-xl border border-amber-200/20 dark:border-amber-800/20">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{factor}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </GlassmorphicCard>
          </div>
          </section>

          {/* Combined Analysis - Key Findings & Impact Breakdown */}
          <section aria-labelledby="analysis-title">
            <GlassmorphicCard className="p-8 mb-12">
            <CardHeader className="p-0 pb-8">
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 dark:from-emerald-400 dark:via-blue-400 dark:to-indigo-400" id="analysis-title">
                Analysis & Impact Assessment
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                Critical insights and financial implications from the simulation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-6">
                {combinedAnalysis.map((item, index) => (
                  <AnalysisItem key={`${item.type}-${item.index}`} item={item} index={index} />
                ))}
              </div>
            </CardContent>
          </GlassmorphicCard>
          </section>

          {/* Node Analysis Section */}
          <section aria-labelledby="node-analysis-title">
            <GlassmorphicCard className="p-8">
              <CardHeader className="p-0 pb-8">
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-400 dark:to-red-400" id="node-analysis-title">
                  Supply Chain Node Analysis
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
                  Detailed impact assessment across all network nodes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <NodeImpactGridWithVisualize 
                  nodes={DEFAULT_SIMULATION_NODES}
                  title="Supply Chain Node Analysis"
                  description="Detailed impact assessment across all network nodes"
                />
              </CardContent>
            </GlassmorphicCard>
          </section>
        </div>
      </div>
    </div>
  )
}
