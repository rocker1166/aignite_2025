"use client"

import { AlertTriangle, ArrowRight, Clock, Gauge, TrendingUp } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"
import { NotificationFeed } from "@/components/dashboard/notification-feed"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { SupplyChainHealthChart } from "@/components/dashboard/supply-chain-health-chart"

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:gap-8 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Supply Chain Resilience Planner dashboard.</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Risk Score"
            value="68%"
            trend="-12%"
            trendDirection="down"
            icon={<Gauge className="h-5 w-5" />}
            description="Overall supply chain risk"
            color="bg-destructive/10"
            href="/analytics"
          />
          <KpiCard
            title="Recovery Time"
            value="4.2 days"
            trend="+0.8"
            trendDirection="up"
            icon={<Clock className="h-5 w-5" />}
            description="Average time to recover"
            color="bg-warning/10"
            href="/analytics"
          />
          <KpiCard
            title="Active Disruptions"
            value="3"
            trend="+1"
            trendDirection="up"
            icon={<AlertTriangle className="h-5 w-5" />}
            description="Current disruptions"
            color="bg-destructive/10"
            href="/simulation"
          />
          <KpiCard
            title="ROI Estimate"
            value="$1.2M"
            trend="+8%"
            trendDirection="up"
            icon={<TrendingUp className="h-5 w-5" />}
            description="Estimated annual savings"
            color="bg-success/10"
            href="/strategy"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Supply Chain Health</CardTitle>
              <CardDescription>Overall health and performance trends</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Weekly
              </Button>
              <Button variant="outline" size="sm">
                Monthly
              </Button>
              <Button variant="default" size="sm">
                Yearly
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SupplyChainHealthChart />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild className="w-full justify-between">
              <Link href="/digital-twin">
                Create New Digital Twin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between">
              <Link href="/simulation">
                Run Simulation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full justify-between">
              <Link href="/strategy">
                View Strategy Recommendations
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/analytics">
                View Reports
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList>
          <TabsTrigger value="notifications">Real-Time Alerts</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="border rounded-md mt-6">
          <NotificationFeed />
        </TabsContent>
        <TabsContent value="activity" className="border rounded-md mt-6">
          <RecentActivityList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
