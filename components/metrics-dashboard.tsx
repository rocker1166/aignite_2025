"use client"

import { BarChart, LineChart, PieChart } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getNodeStatusData, getImpactByNodeData, NODE_STATUS_COLORS, supplyChainImpactData } from "@/lib/data/impactresult"
import { useImpact } from "@/lib/context/impact-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function MetricsDashboard() {
  // Get data from impact context instead of using the hardcoded data
  const { impactData, isLoading } = useImpact();
  
  // Use the default data if impactData is not available
  const safeImpactData = impactData || supplyChainImpactData;
  
  // Get derived data using helper functions
  const nodeStatusData = getNodeStatusData(safeImpactData)
  const impactByNodeData = getImpactByNodeData(safeImpactData)

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle>Production Output</CardTitle>
            <CardDescription>Daily production capacity (% of normal)</CardDescription>
          </div>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={safeImpactData.productionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 1 }}
                activeDot={{ r: 5 }}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Projected"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle>Inventory Levels</CardTitle>
            <CardDescription>Daily inventory (% of capacity)</CardDescription>
          </div>
          <AreaChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeImpactData.inventoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <defs>
                <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="level"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorLevel)"
                name="Inventory"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle>Node Status</CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </div>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={nodeStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {nodeStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={NODE_STATUS_COLORS[index % NODE_STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-0">
            <CardTitle>Impact by Node</CardTitle>
            <CardDescription>Output reduction by node (%)</CardDescription>
          </div>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={impactByNodeData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="impact" fill="#3b82f6" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-full">
        <Skeleton className="h-[350px] w-full" />
      </div>
      <Skeleton className="h-[250px] w-full" />
      <Skeleton className="h-[250px] w-full" />
      <Skeleton className="h-[250px] w-full" />
    </div>
  )
}
