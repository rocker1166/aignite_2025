"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CostBenefitAnalysis } from "./cost-benefit-analysis"
import { StrategyRecommendations } from "./strategy-recommendations"

export function StrategyPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Supply Chain Strategy</h1>
        <p className="text-muted-foreground">
          Analyze and implement resilience strategies with AI-powered recommendations
        </p>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recommendations">Strategy Recommendations</TabsTrigger>
          <TabsTrigger value="analysis">Cost-Benefit Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <StrategyRecommendations />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <CostBenefitAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}
