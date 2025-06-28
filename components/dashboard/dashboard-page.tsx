"use client"

import { AlertTriangle, ArrowRight, Clock, Gauge, TrendingUp, Play, LightbulbIcon } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"
import { NotificationFeed } from "@/components/dashboard/notification-feed"
import OrchestratorWidget from "@/components/orchestrator/OrchestratorWidget"
import QuickOrchestratorWidget from "@/components/orchestrator/quick-orchestrator-widget"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-800/60 overflow-x-hidden">
      {/* Enhanced background blurred elements for both light and dark modes */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/40 to-pink-400/40 dark:from-purple-600/20 dark:to-pink-600/20 opacity-30 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-400/30 dark:from-blue-600/15 dark:to-cyan-600/15 opacity-25 blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-gradient-to-br from-emerald-300/35 to-teal-400/35 dark:from-emerald-600/20 dark:to-teal-600/20 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-orange-300/30 to-amber-400/30 dark:from-orange-600/15 dark:to-amber-600/15 opacity-15 blur-3xl animate-pulse"></div>
      
      <div className="relative flex flex-col gap-6 p-6 md:gap-8 md:p-8 max-w-full">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 dark:from-slate-100 dark:via-blue-300 dark:to-indigo-300">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">Welcome to your Supply Chain Resilience Planner dashboard.</p>
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

        <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* MACG Orchestrator Widget */}
          <div className="xl:col-span-1">
            <QuickOrchestratorWidget />
          </div>
          
          {/* Notification Feed */}
          <div className="xl:col-span-2">
            <GlassmorphicCard className="border-0 min-h-[600px]">
              <NotificationFeed />
            </GlassmorphicCard>
          </div>
        </div>
      </div>
    </div>
  )
}

// Glassmorphic Card Component with improved dark mode support
function GlassmorphicCard({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <Card 
      className={`border border-white/40 dark:border-slate-700/30 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/30 rounded-xl ${className}`} 
      {...props}
    >
      {children}
    </Card>
  )
}

// Glassmorphic KPI Card Component with improved contrast and lighting
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
      <GlassmorphicCard className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white/90 dark:hover:bg-slate-900/70 border-gradient-to-r from-blue-200/50 to-indigo-200/50 dark:from-blue-800/30 dark:to-indigo-800/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</CardTitle>
            <span className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 p-1.5 backdrop-blur-sm shadow-md text-slate-600 dark:text-slate-200 ring-1 ring-white/50 dark:ring-slate-600/30">{icon}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-100 bg-clip-text text-transparent">{value}</div>
          <div className="mt-1 flex items-center text-xs">
            <span className={trendDirection === "up" ? "text-red-600 dark:text-red-400 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
              {trend}
            </span>
            <span className="ml-2 text-slate-600 dark:text-slate-300">{description}</span>
          </div>
        </CardContent>
      </GlassmorphicCard>
    </Link>
  )
}

