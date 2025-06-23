"use client"

import { AlertTriangle, Clock, Gauge, TrendingUp, Play } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"
import { NotificationFeed } from "@/components/dashboard/notification-feed"
import { SupplyChainHealthChart } from "@/components/dashboard/supply-chain-health-chart"
import { DashboardRiskHeatmap } from "@/components/dashboard/risk-heatmap"
import { SimulationTimeline } from "@/components/dashboard/simulation-timeline"

// Types
interface GlassmorphicCardProps {
  children: React.ReactNode
  className?: string
}

interface KpiCardProps {
  title: string
  value: string
  trend: string
  trendDirection: 'up' | 'down'
  icon: React.ReactNode
  description: string
  href: string
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 overflow-x-hidden">
      {/* Background blurred elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-300 dark:bg-purple-900 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-blue-300 dark:bg-blue-900 opacity-20 blur-3xl"></div>
      
      <div className="relative flex flex-col gap-6 p-6 md:gap-8 md:p-8 max-w-full">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">Dashboard</h1>
            <p className="text-slate-400">Welcome to your Supply Chain Resilience Planner dashboard.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200">
              <Link href="/simulation" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Run Simulation
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-blue-400/30 hover:bg-blue-500/10 text-blue-400 transition-all duration-200">
              <Link href="/strategy">
                New Strategy
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassmorphicKpiCard
            title="Risk Score"
            value="68%"
            trend="-12%"
            trendDirection="down"
            icon={<Gauge className="h-5 w-5" />}
            description="Overall supply chain risk"
            href="/analytics"
          />
          <GlassmorphicKpiCard
            title="Recovery Time"
            value="4.2 days"
            trend="+0.8"
            trendDirection="up"
            icon={<Clock className="h-5 w-5" />}
            description="Average time to recover"
            href="/analytics"
          />
          <GlassmorphicKpiCard
            title="Active Disruptions"
            value="3"
            trend="+1"
            trendDirection="up"
            icon={<AlertTriangle className="h-5 w-5" />}
            description="Current disruptions"
            href="/simulation"
          />
          <GlassmorphicKpiCard
            title="ROI Estimate"
            value="$1.2M"
            trend="+8%"
            trendDirection="up"
            icon={<TrendingUp className="h-5 w-5" />}
            description="Estimated annual savings"
            href="/strategy"
          />
        </div>

        <GlassmorphicCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-slate-200">Supply Chain Health</CardTitle>
              <CardDescription>Overall health and performance trends</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-slate-800/30 transition-colors ${
                  selectedPeriod === 'weekly'
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                onClick={() => setSelectedPeriod('weekly')}
              >
                Weekly
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-slate-800/30 transition-colors ${
                  selectedPeriod === 'monthly'
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                onClick={() => setSelectedPeriod('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-slate-800/30 transition-colors ${
                  selectedPeriod === 'yearly'
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
                onClick={() => setSelectedPeriod('yearly')}
              >
                Yearly
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SupplyChainHealthChart period={selectedPeriod} />
          </CardContent>
        </GlassmorphicCard>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="bg-slate-800/20 backdrop-blur-sm">
            <TabsTrigger value="notifications">Real-Time Alerts</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="notifications" className="mt-6">
            <GlassmorphicCard>
              <CardContent className="p-6">
                <NotificationFeed />
              </CardContent>
            </GlassmorphicCard>
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <GlassmorphicCard>
              <CardContent className="p-6">
                <RecentActivityList />
              </CardContent>
            </GlassmorphicCard>
          </TabsContent>
        </Tabs>

        <GlassmorphicCard>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">Simulation Timeline</CardTitle>
            <CardDescription>Visualize disruption scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <SimulationTimeline />
          </CardContent>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-200">Risk Heatmap</CardTitle>
            <CardDescription>Supply chain risk by category</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardRiskHeatmap />
          </CardContent>
        </GlassmorphicCard>
      </div>
    </div>
  )
}

// Glassmorphic Card Component
function GlassmorphicCard({ children, className = '', ...props }: GlassmorphicCardProps) {
  return (
    <Card 
      className={`border border-slate-800/50 bg-slate-900/20 backdrop-blur-xl shadow-xl rounded-xl ${className}`} 
      {...props}
    >
      {children}
    </Card>
  )
}

// Glassmorphic KPI Card Component
function GlassmorphicKpiCard({ title, value, trend, trendDirection, icon, description, href }: KpiCardProps) {
  return (
    <Link href={href} className="block group">
      <GlassmorphicCard className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
            <span className="rounded-full bg-slate-800/20 p-1.5 backdrop-blur-sm text-slate-400">{icon}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-100">{value}</div>
          <div className="mt-1 flex items-center text-xs">
            <span className={trendDirection === "up" ? "text-red-400" : "text-emerald-400"}>
              {trend}
            </span>
            <span className="ml-2 text-slate-400">{description}</span>
          </div>
        </CardContent>
      </GlassmorphicCard>
    </Link>
  )
}

// Glassmorphic Tabs Component
function GlassmorphicTabs({ className, ...props }) {
  return (
    <Tabs className={`${className}`} {...props} />
  )
}