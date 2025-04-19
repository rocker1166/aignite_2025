"use client"

import { Calendar, Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KpiMetricsGrid } from "@/components/analytics/kpi-metrics-grid"
import { PerformanceChart } from "@/components/analytics/performance-chart"
import { RiskHeatmap } from "@/components/analytics/risk-heatmap"
import { SupplierTable } from "@/components/analytics/supplier-table"

export function AnalyticsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">KPI & Impact Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Apr 1 - Apr 16, 2025
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <KpiMetricsGrid />

        <Tabs defaultValue="performance">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
            <TabsTrigger value="suppliers">Supplier Analytics</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Levels</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Supply Chain Performance</CardTitle>
                <CardDescription>Key performance indicators over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <PerformanceChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Heatmap</CardTitle>
                <CardDescription>Visualization of risk levels across the supply chain</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <RiskHeatmap />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>Detailed analytics on supplier reliability and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <SupplierTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Analytics</CardTitle>
                <CardDescription>Current inventory levels and projections</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Inventory visualization would be displayed here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    (Using interactive charts with inventory levels by location)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
