"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const riskCategories = [
  { id: "geo", name: "Geographic" },
  { id: "financial", name: "Financial" },
  { id: "operational", name: "Operational" },
]

const riskData = {
  geo: [
    { region: "North America", risk: 25 },
    { region: "Europe", risk: 35 },
    { region: "Asia Pacific", risk: 75 },
    { region: "South America", risk: 45 },
    { region: "Africa", risk: 60 },
  ],
  financial: [
    { region: "Raw Materials", risk: 65 },
    { region: "Labor Costs", risk: 30 },
    { region: "Currency", risk: 55 },
    { region: "Energy Costs", risk: 40 },
    { region: "Tariffs", risk: 70 },
  ],
  operational: [
    { region: "Production", risk: 45 },
    { region: "Logistics", risk: 80 },
    { region: "Inventory", risk: 35 },
    { region: "Quality", risk: 25 },
    { region: "Compliance", risk: 50 },
  ],
}

export function DashboardRiskHeatmap() {
  const [activeCategory, setActiveCategory] = useState("geo")

  // Memoize these functions to prevent recreation on each render
  const getRiskColor = useCallback((risk: number) => {
    if (risk >= 70) return "text-red-500 dark:text-red-400" // Red
    if (risk >= 50) return "text-amber-500 dark:text-amber-400" // Yellow
    return "text-green-500 dark:text-green-400" // Green
  }, [])

  const getRiskBg = useCallback((risk: number) => {
    if (risk >= 70) return "bg-gradient-to-br from-red-100/90 via-red-50/70 to-pink-100/80 dark:bg-gradient-to-r dark:from-red-500/10 dark:to-red-600/5"
    if (risk >= 50) return "bg-gradient-to-br from-amber-100/90 via-yellow-50/70 to-orange-100/80 dark:bg-gradient-to-r dark:from-amber-500/10 dark:to-amber-600/5"
    return "bg-gradient-to-br from-green-100/90 via-emerald-50/70 to-teal-100/80 dark:bg-gradient-to-r dark:from-green-500/10 dark:to-green-600/5"
  }, [])

  // Enhanced border colors
  const getRiskBorder = useCallback((risk: number) => {
    if (risk >= 70) return "border-red-200/70 dark:border-red-800/40"
    if (risk >= 50) return "border-amber-200/70 dark:border-amber-800/40"
    return "border-green-200/70 dark:border-green-800/40"
  }, [])

  // Memoize the background color for progress bars
  const getProgressBgColor = useCallback((risk: number) => {
    if (risk >= 70) return "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30"
    if (risk >= 50) return "bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30"
    return "bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30"
  }, [])

  const getRiskIcon = useCallback((risk: number) => {
    if (risk >= 70) return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
    if (risk >= 50) return <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
  }, [])

  // Pre-render the tab content to avoid rendering during tab switches
  const tabContents = useMemo(() => {
    return riskCategories.map((category) => (
      <TabsContent key={category.id} value={category.id} className="mt-4 px-2">
        <div className="grid grid-cols-1 gap-3">
          {riskData[category.id as keyof typeof riskData].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={`group flex items-center justify-between p-4 rounded-xl border ${getRiskBg(item.risk)} ${getRiskBorder(item.risk)} backdrop-blur-xl shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 p-2 rounded-full bg-white/80 dark:bg-slate-800/50 shadow-md ring-1 ring-white/30">
                  {getRiskIcon(item.risk)}
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.region}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative h-3 w-32 rounded-full bg-white/60 dark:bg-slate-700/50 backdrop-blur-sm overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${item.risk}%`, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${getProgressBgColor(item.risk)} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                  </motion.div>
                </div>
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className={`min-w-[3rem] text-right text-sm font-bold font-mono ${getRiskColor(item.risk)} bg-white/60 dark:bg-slate-800/60 px-2 py-1 rounded-md shadow-sm backdrop-blur-sm`}
                >
                  {item.risk}%
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      </TabsContent>
    ));
  }, [getRiskBg, getRiskBorder, getRiskColor, getProgressBgColor, getRiskIcon]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="geo" onValueChange={setActiveCategory} className="mx-auto max-w-[700px]">
        <TabsList className="bg-gradient-to-r from-white/80 via-slate-50/60 to-white/70 dark:bg-gradient-to-r dark:from-slate-800/90 dark:via-slate-700/70 dark:to-slate-800/80 backdrop-blur-xl w-full flex justify-center mb-8 shadow-lg shadow-black/5 dark:shadow-black/20 border border-white/30 dark:border-slate-600/50 rounded-xl">
          {riskCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex-1 max-w-[160px] text-slate-700 dark:text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 relative data-[state=active]:before:absolute data-[state=active]:before:inset-0 data-[state=active]:before:bg-blue-400/30 data-[state=active]:before:blur-md data-[state=active]:before:opacity-60 data-[state=active]:before:animate-pulse data-[state=active]:before:rounded-md font-medium transition-all duration-300 hover:bg-white/20 dark:hover:bg-slate-700/50"
            >
              <span className="relative z-10">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabContents}
      </Tabs>

      <div className="flex justify-between items-center mt-8 border-t border-gradient-to-r from-slate-200/60 via-slate-300/40 to-slate-200/60 dark:border-slate-600/40 pt-6 bg-gradient-to-r from-white/40 via-slate-50/30 to-white/40 dark:bg-gradient-to-r dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-3 shadow-md shadow-black/5 dark:shadow-black/20">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/60 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-white/20 dark:border-slate-600/30">
              <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30"></span>
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/60 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-white/20 dark:border-slate-600/30">
              <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30"></span>
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/60 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-white/20 dark:border-slate-600/30">
              <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30"></span>
              <span>High Risk</span>
            </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-none shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 relative group backdrop-blur-sm"
        >
          <span className="absolute inset-0 rounded-md bg-blue-400/30 blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse"></span>
          <span className="absolute inset-0 rounded-md bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></span>
          <Link href="/analytics" className="flex items-center relative z-10">
            View Detailed Analysis
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}