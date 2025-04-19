"use client"

import { useTheme } from "next-themes"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", health: 65, disruptions: 2, recovery: 5.2 },
  { month: "Feb", health: 59, disruptions: 4, recovery: 6.1 },
  { month: "Mar", health: 70, disruptions: 3, recovery: 4.8 },
  { month: "Apr", health: 75, disruptions: 1, recovery: 3.9 },
  { month: "May", health: 72, disruptions: 2, recovery: 4.2 },
  { month: "Jun", health: 68, disruptions: 3, recovery: 4.5 },
  { month: "Jul", health: 62, disruptions: 5, recovery: 5.8 },
  { month: "Aug", health: 58, disruptions: 4, recovery: 6.3 },
  { month: "Sep", health: 65, disruptions: 2, recovery: 5.1 },
  { month: "Oct", health: 70, disruptions: 1, recovery: 4.0 },
  { month: "Nov", health: 75, disruptions: 0, recovery: 3.5 },
  { month: "Dec", health: 68, disruptions: 3, recovery: 4.2 },
]

export function SupplyChainHealthChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
        <XAxis dataKey="month" stroke={isDark ? "#888" : "#666"} />
        <YAxis stroke={isDark ? "#888" : "#666"} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#fff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="health" stroke="#3b82f6" activeDot={{ r: 8 }} name="Health Score" />
        <Line type="monotone" dataKey="disruptions" stroke="#ef4444" name="Disruptions" />
        <Line type="monotone" dataKey="recovery" stroke="#10b981" name="Recovery Time (days)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
