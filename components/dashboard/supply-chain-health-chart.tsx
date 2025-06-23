"use client"

import { useTheme } from "next-themes"
import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Sample data for different periods
const weeklyData = [
  { time: "Mon", health: 72, disruptions: 1, recovery: 4.0 },
  { time: "Tue", health: 68, disruptions: 2, recovery: 4.5 },
  { time: "Wed", health: 65, disruptions: 3, recovery: 5.0 },
  { time: "Thu", health: 70, disruptions: 2, recovery: 4.2 },
  { time: "Fri", health: 75, disruptions: 1, recovery: 3.8 },
  { time: "Sat", health: 73, disruptions: 1, recovery: 3.9 },
  { time: "Sun", health: 71, disruptions: 2, recovery: 4.1 },
]

const monthlyData = [
  { time: "Week 1", health: 70, disruptions: 2, recovery: 4.2 },
  { time: "Week 2", health: 65, disruptions: 3, recovery: 4.8 },
  { time: "Week 3", health: 68, disruptions: 2, recovery: 4.5 },
  { time: "Week 4", health: 72, disruptions: 1, recovery: 4.0 },
]

const yearlyData = [
  { time: "Jan", health: 65, disruptions: 2, recovery: 5.2 },
  { time: "Feb", health: 59, disruptions: 4, recovery: 6.1 },
  { time: "Mar", health: 70, disruptions: 3, recovery: 4.8 },
  { time: "Apr", health: 75, disruptions: 1, recovery: 3.9 },
  { time: "May", health: 72, disruptions: 2, recovery: 4.2 },
  { time: "Jun", health: 68, disruptions: 3, recovery: 4.5 },
  { time: "Jul", health: 62, disruptions: 5, recovery: 5.8 },
  { time: "Aug", health: 58, disruptions: 4, recovery: 6.3 },
  { time: "Sep", health: 65, disruptions: 2, recovery: 5.1 },
  { time: "Oct", health: 70, disruptions: 1, recovery: 4.0 },
  { time: "Nov", health: 75, disruptions: 0, recovery: 3.5 },
  { time: "Dec", health: 68, disruptions: 3, recovery: 4.2 },
]

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  const healthScore = payload.find(p => p.name === "Health Score")?.value || 0;
  const disruptions = payload.find(p => p.name === "Disruptions")?.value || 0;
  const recovery = payload.find(p => p.name === "Recovery Time (days)")?.value || 0;

  return (
    <div className="rounded-xl border border-slate-200/10 bg-slate-900/80 backdrop-blur-md shadow-xl p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          <span className="text-sm font-semibold text-blue-400">{healthScore}%</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-slate-400">Disruptions</span>
            </div>
            <span className="text-xs font-medium text-slate-300">{disruptions}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-400">Recovery Time</span>
            </div>
            <span className="text-xs font-medium text-slate-300">{recovery} days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SupplyChainHealthChartProps {
  period?: 'weekly' | 'monthly' | 'yearly'
}

export function SupplyChainHealthChart({ period = 'monthly' }: SupplyChainHealthChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  // Get data based on selected period
  const data = useMemo(() => {
    switch (period) {
      case 'weekly':
        return weeklyData
      case 'monthly':
        return monthlyData
      case 'yearly':
        return yearlyData
      default:
        return monthlyData
    }
  }, [period])

  // Memoize grid and axis colors based on theme
  const chartColors = useMemo(() => ({
    grid: isDark ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.2)",
    axis: isDark ? "#64748b" : "#475569"
  }), [isDark]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
        <XAxis 
          dataKey="time" 
          stroke={chartColors.axis}
          tick={{ fill: chartColors.axis, fontSize: 12 }}
          tickLine={{ stroke: chartColors.grid }}
        />
        <YAxis 
          stroke={chartColors.axis}
          tick={{ fill: chartColors.axis, fontSize: 12 }}
          tickLine={{ stroke: chartColors.grid }}
        />
        <Tooltip 
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(148,163,184,0.2)", strokeWidth: 1 }}
        />
        <Legend 
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
        />
        <Line 
          type="monotone" 
          dataKey="health" 
          stroke="#3b82f6" 
          strokeWidth={2.5}
          dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: isDark ? '#1e293b' : '#fff' }}
          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#3b82f6' }}
          name="Health Score"
        />
        <Line 
          type="monotone" 
          dataKey="disruptions" 
          stroke="#ef4444" 
          strokeWidth={2}
          dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4, fill: isDark ? '#1e293b' : '#fff' }}
          activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2, fill: '#ef4444' }}
          name="Disruptions"
        />
        <Line 
          type="monotone" 
          dataKey="recovery" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: isDark ? '#1e293b' : '#fff' }}
          activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2, fill: '#10b981' }}
          name="Recovery Time (days)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
