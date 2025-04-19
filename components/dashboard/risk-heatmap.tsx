"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight } from "lucide-react"
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
    if (risk >= 70) return "bg-gradient-to-r from-red-500/10 to-red-600/5"
    if (risk >= 50) return "bg-gradient-to-r from-amber-500/10 to-amber-600/5"
    return "bg-gradient-to-r from-green-500/10 to-green-600/5"
  }, [])

  // Memoize the background color for progress bars
  const getProgressBgColor = useCallback((risk: number) => {
    if (risk >= 70) return "bg-red-500"
    if (risk >= 50) return "bg-amber-500"
    return "bg-green-500"
  }, [])

  // Pre-render the tab content to avoid rendering during tab switches
  const tabContents = useMemo(() => {
    return riskCategories.map((category) => (
      <TabsContent key={category.id} value={category.id} className="mt-4 px-2">
        <div className="grid grid-cols-1 gap-3">
          {riskData[category.id as keyof typeof riskData].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex items-center justify-between p-3 rounded-lg ${getRiskBg(item.risk)} backdrop-blur-sm`}
            >
              <span className="text-sm font-medium">{item.region}</span>
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-40 rounded-full bg-white/20 dark:bg-slate-700/40 backdrop-blur-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.risk}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`h-full rounded-full ${getProgressBgColor(item.risk)}`}
                  ></motion.div>
                </div>
                <span className={`w-10 text-right text-sm font-mono ${getRiskColor(item.risk)}`}>
                  {item.risk}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </TabsContent>
    ));
  }, [getRiskBg, getRiskColor, getProgressBgColor]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="geo" onValueChange={setActiveCategory} className="mx-auto max-w-[700px]">
        <TabsList className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm w-full flex justify-center mb-6">
          {riskCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex-1 max-w-[160px] data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabContents}
      </Tabs>

      <div className="flex justify-between items-center mt-6 border-t border-slate-200/20 dark:border-slate-700/20 pt-4">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500"></span>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500"></span>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500"></span>
            <span>High Risk</span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
          <Link href="/analytics" className="flex items-center">
            View Detailed Analysis
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}