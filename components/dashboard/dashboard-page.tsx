"use client"

import { AlertTriangle, ArrowRight, Clock, Gauge, TrendingUp, Play, LightbulbIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"
import { NotificationFeed } from "@/components/dashboard/notification-feed"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { SupplyChainHealthChart } from "@/components/dashboard/supply-chain-health-chart"
import { DashboardRiskHeatmap } from "@/components/dashboard/risk-heatmap"
import { SimulationTimeline } from "@/components/dashboard/simulation-timeline"

export function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-900 overflow-x-hidden">
      {/* Background blurred elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-300 dark:bg-purple-900 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-blue-300 dark:bg-blue-900 opacity-20 blur-3xl"></div>
      
      <div className="relative flex flex-col gap-6 p-6 md:gap-8 md:p-8 max-w-full">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">Welcome to your Supply Chain Resilience Planner dashboard.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button asChild className="justify-between bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white relative group">
              <Link href="/simulation">
                <span className="flex items-center">
                  <span className="absolute inset-0 rounded-md bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <Play className="h-4 w-4 mr-2 animate-pulse" /> 
                  Run Simulation
                </span>
              </Link>
            </Button>
            <Button asChild className="justify-between bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white">
              <Link href="/strategy">
                New Strategy
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <GlassmorphicKpiCard
              title="Risk Score"
              value="68%"
              trend="-12%"
              trendDirection="down"
              icon={<Gauge className="h-5 w-5" />}
              description="Overall supply chain risk"
              color="from-red-500/20 to-red-600/10"
              href="/analytics"
            />
            <GlassmorphicKpiCard
              title="Recovery Time"
              value="4.2 days"
              trend="+0.8"
              trendDirection="up"
              icon={<Clock className="h-5 w-5" />}
              description="Average time to recover"
              color="from-amber-500/20 to-amber-600/10"
              href="/analytics"
            />
            <GlassmorphicKpiCard
              title="Active Disruptions"
              value="3"
              trend="+1"
              trendDirection="up"
              icon={<AlertTriangle className="h-5 w-5" />}
              description="Current disruptions"
              color="from-red-500/20 to-red-600/10"
              href="/simulation"
            />
            <GlassmorphicKpiCard
              title="ROI Estimate"
              value="$1.2M"
              trend="+8%"
              trendDirection="up"
              icon={<TrendingUp className="h-5 w-5" />}
              description="Estimated annual savings"
              color="from-green-500/20 to-green-600/10"
              href="/strategy"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          <GlassmorphicCard className="md:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Supply Chain Health</CardTitle>
                <CardDescription>Overall health and performance trends</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="hover:bg-white/30 dark:hover:bg-slate-800/30">
                  Weekly
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-white/30 dark:hover:bg-slate-800/30">
                  Monthly
                </Button>
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Yearly
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SupplyChainHealthChart />
            </CardContent>
          </GlassmorphicCard>

          <GlassmorphicCard className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button asChild className="justify-between bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                <Link href="/simulation">
                  Run Simulation
                </Link>
              </Button>
              <Button asChild className="justify-between bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white">
                <Link href="/strategy">
                  New Strategy
                </Link>
              </Button>
            </CardContent>
          </GlassmorphicCard>
        </div>

        <GlassmorphicTabs defaultValue="notifications" className="w-full">
          <TabsList className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/30 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800/30 dark:data-[state=active]:text-white">Real-Time Alerts</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/30 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800/30 dark:data-[state=active]:text-white">Recent Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="notifications" className="mt-6">
            <GlassmorphicCard className="border-0">
              <NotificationFeed />
            </GlassmorphicCard>
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <GlassmorphicCard className="border-0">
              <RecentActivityList />
            </GlassmorphicCard>
          </TabsContent>
        </GlassmorphicTabs>

        {/* Simulation Timeline Section */}
        <GlassmorphicCard className="">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Simulation Timeline</CardTitle>
            <CardDescription>Visualize disruption scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <SimulationTimeline />
          </CardContent>
        </GlassmorphicCard>

        {/* Risk Heatmap Section */}
        <GlassmorphicCard className="">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Risk Heatmap</CardTitle>
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
function GlassmorphicCard({ children, className, ...props }) {
  return (
    <Card 
      className={`border border-white/20 dark:border-slate-700/20 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md shadow-lg rounded-xl ${className}`} 
      {...props}
    >
      {children}
    </Card>
  )
}

// Glassmorphic KPI Card Component
function GlassmorphicKpiCard({ title, value, trend, trendDirection, icon, description, color, href }) {
  return (
    <Link href={href} className="block group">
      <GlassmorphicCard className={`h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br ${color}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</CardTitle>
            <span className="rounded-full bg-white/20 dark:bg-slate-800/20 p-1.5 backdrop-blur-sm">{icon}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
          <div className="mt-1 flex items-center text-xs">
            <span className={trendDirection === "up" ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400"}>
              {trend}
            </span>
            <span className="ml-2 text-slate-600 dark:text-slate-400">{description}</span>
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