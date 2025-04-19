"use client"

import { Activity, AlertTriangle, Clock, DollarSign, Gauge, Package, Truck } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function KpiMetricsGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">68%</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Threshold: 75%</span>
            <span className="text-xs text-success">-12% from last month</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-warning" style={{ width: "68%" }}></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">82.5%</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Target: 95%</span>
            <span className="text-xs text-destructive">-3.2% from last month</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-info" style={{ width: "82.5%" }}></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recovery Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4.2 days</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Target: 3 days</span>
            <span className="text-xs text-destructive">+0.8 days from baseline</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-warning" style={{ width: "70%" }}></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Health</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">76%</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Threshold: 60%</span>
            <span className="text-xs text-success">+5% from last month</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-success" style={{ width: "76%" }}></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Disruptions</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Critical: 1</span>
            <span className="text-xs text-destructive">+1 from last week</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1">
            <div className="h-2 rounded-full bg-destructive"></div>
            <div className="h-2 rounded-full bg-warning"></div>
            <div className="h-2 rounded-full bg-warning"></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cost Variance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12.4%</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Budget: +/-5%</span>
            <span className="text-xs text-destructive">Above threshold</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-destructive" style={{ width: "62%" }}></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Supplier Reliability</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78%</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Target: 90%</span>
            <span className="text-xs text-warning">-2% from last quarter</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-info" style={{ width: "78%" }}></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ROI Estimate</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1.2M</div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Annual savings</span>
            <span className="text-xs text-success">+8% from projection</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-success" style={{ width: "85%" }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
