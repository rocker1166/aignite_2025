"use client"

import { useTheme } from "next-themes"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", onTimeDelivery: 88, costVariance: 2, riskScore: 55 },
  { month: "Feb", onTimeDelivery: 85, costVariance: 5, riskScore: 60 },
  { month: "Mar", onTimeDelivery: 82, costVariance: 8, riskScore: 65 },
  { month: "Apr", onTimeDelivery: 80, costVariance: 10, riskScore: 70 },
  { month: "May", onTimeDelivery: 78, costVariance: 12, riskScore: 72 },
  { month: "Jun", onTimeDelivery: 75, costVariance: 15, riskScore: 75 },
  { month: "Jul", onTimeDelivery: 72, costVariance: 18, riskScore: 78 },
  { month: "Aug", onTimeDelivery: 70, costVariance: 20, riskScore: 80 },
  { month: "Sep", onTimeDelivery: 75, costVariance: 15, riskScore: 75 },
  { month: "Oct", onTimeDelivery: 78, costVariance: 12, riskScore: 72 },
  { month: "Nov", onTimeDelivery: 80, costVariance: 10, riskScore: 70 },
  { month: "Dec", onTimeDelivery: 82, costVariance: 8, riskScore: 68 },
]

export function PerformanceChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 20,
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
          formatter={(value, name) => {
            if (name === "onTimeDelivery") return [`${value}%`, "On-Time Delivery"]
            if (name === "costVariance") return [`${value}%`, "Cost Variance"]
            if (name === "riskScore") return [`${value}%`, "Risk Score"]
            return [value, name]
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="onTimeDelivery"
          name="On-Time Delivery (%)"
          stroke="#3b82f6"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="costVariance" name="Cost Variance (%)" stroke="#ef4444" />
        <Line type="monotone" dataKey="riskScore" name="Risk Score (%)" stroke="#f59e0b" />
      </LineChart>
    </ResponsiveContainer>
  )
}
