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

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 dark:from-gray-900 dark:to-slate-900 overflow-x-hidden">
      {/* Enhanced background blurred elements for light mode */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 dark:bg-purple-900 opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 dark:bg-blue-900 opacity-25 blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 dark:bg-emerald-900 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 dark:bg-orange-900 opacity-15 blur-3xl animate-pulse"></div>
      
      <div className="relative flex flex-col gap-6 p-6 md:gap-8 md:p-8 max-w-full">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">Welcome to your Supply Chain Resilience Planner dashboard.</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button asChild className="justify-between bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white relative group shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300">
              <Link href="/simulation">
                <span className="flex items-center">
                  <span className="absolute inset-0 rounded-md bg-blue-400/30 blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></span>
                  <span className="absolute inset-0 rounded-md bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <Play className="h-4 w-4 mr-2 animate-pulse relative z-10" /> 
                  <span className="relative z-10">Run Simulation</span>
                </span>
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
        </div>



        <GlassmorphicTabs defaultValue="notifications" className="w-full">
          <TabsList className="bg-white/60 dark:bg-slate-800/10 backdrop-blur-sm border border-white/40 dark:border-slate-700/20 shadow-lg">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 dark:data-[state=active]:bg-slate-800/20 dark:data-[state=active]:text-white font-medium relative data-[state=active]:before:absolute data-[state=active]:before:inset-0 data-[state=active]:before:rounded-md data-[state=active]:before:bg-blue-400/30 data-[state=active]:before:blur-md data-[state=active]:before:opacity-60 data-[state=active]:before:animate-pulse">Real-Time Alerts</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 dark:data-[state=active]:bg-slate-800/20 dark:data-[state=active]:text-white font-medium relative data-[state=active]:before:absolute data-[state=active]:before:inset-0 data-[state=active]:before:rounded-md data-[state=active]:before:bg-blue-400/30 data-[state=active]:before:blur-md data-[state=active]:before:opacity-60 data-[state=active]:before:animate-pulse">Recent Activity</TabsTrigger>
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
function GlassmorphicCard({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <Card 
      className={`border border-white/30 dark:border-slate-700/10 bg-white/70 dark:bg-slate-900/5 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 rounded-xl ${className}`} 
      {...props}
    >
      {children}
    </Card>
  )
}

// Glassmorphic KPI Card Component
function GlassmorphicKpiCard({ title, value, trend, trendDirection, icon, description, href }: {
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  icon: React.ReactNode;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="block group">
      <GlassmorphicCard className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-900/10 border-gradient-to-r from-purple-200/50 to-blue-200/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-400">{title}</CardTitle>
            <span className="rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-600 p-1.5 backdrop-blur-sm shadow-md text-slate-600 dark:text-slate-200">{icon}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-100 bg-clip-text text-transparent">{value}</div>
          <div className="mt-1 flex items-center text-xs">
            <span className={trendDirection === "up" ? "text-red-600 dark:text-red-400 font-semibold" : "text-emerald-600 dark:text-green-400 font-semibold"}>
              {trend}
            </span>
            <span className="ml-2 text-slate-700 dark:text-slate-400">{description}</span>
          </div>
        </CardContent>
      </GlassmorphicCard>
    </Link>
  )
}

// Glassmorphic Tabs Component
function GlassmorphicTabs({ className = "", ...props }: { className?: string; [key: string]: any }) {
  return (
    <Tabs className={`${className}`} {...props} />
  )
}