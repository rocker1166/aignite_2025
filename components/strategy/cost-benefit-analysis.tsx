"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function CostBenefitAnalysis() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  const [implementationCost, setImplementationCost] = useState(150000)
  const [riskReduction, setRiskReduction] = useState(35)
  const [recoveryTime, setRecoveryTime] = useState(4.2)
  const [selectedStrategy, setSelectedStrategy] = useState("dual-sourcing")
  const [maintenanceCost, setMaintenanceCost] = useState(25000)
  const [trainingCost, setTrainingCost] = useState(15000)
  const [timeHorizon, setTimeHorizon] = useState(3)
  
  // Calculate ROI and other metrics based on inputs
  const annualDisruptionCost = 500000 // Baseline annual cost of disruptions
  const costSavings = annualDisruptionCost * (riskReduction / 100)
  const totalCost = implementationCost + maintenanceCost + trainingCost
  const roi = ((costSavings * timeHorizon) / totalCost - 1) * 100
  const paybackPeriod = totalCost / costSavings
  const newRecoveryTime = recoveryTime * (1 - (riskReduction / 100))
  const npv = calculateNPV(costSavings, totalCost, timeHorizon, 0.1) // 10% discount rate

  const comparisonData = [
    {
      name: "Current State",
      cost: annualDisruptionCost,
      recoveryTime: recoveryTime,
      riskScore: 68,
    },
    {
      name: "With Strategy",
      cost: annualDisruptionCost - costSavings,
      recoveryTime: newRecoveryTime,
      riskScore: 68 - (68 * riskReduction / 100),
    },
  ]

  const projectedSavings = Array.from({ length: timeHorizon }, (_, i) => ({
    year: `Year ${i + 1}`,
    savings: costSavings,
    cumulativeSavings: costSavings * (i + 1),
    costs: i === 0 ? totalCost : maintenanceCost
  }))
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Cost-Benefit Calculator</CardTitle>
          <CardDescription>
            Adjust parameters to see the impact of different strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy</Label>
            <Select 
              value={selectedStrategy} 
              onValueChange={setSelectedStrategy}
            >
              <SelectTrigger id="strategy">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dual-sourcing">Dual-Sourcing Strategy</SelectItem>
                <SelectItem value="safety-stock">Safety Stock Optimization</SelectItem>
                <SelectItem value="alt-routes">Alternative Transportation Routes</SelectItem>
                <SelectItem value="risk-monitoring">Supplier Risk Monitoring System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation-cost">Implementation Cost ($)</Label>
            <Input
              id="implementation-cost"
              type="number"
              value={implementationCost}
              onChange={(e) => setImplementationCost(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-cost">Annual Maintenance Cost ($)</Label>
            <Input
              id="maintenance-cost"
              type="number"
              value={maintenanceCost}
              onChange={(e) => setMaintenanceCost(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="training-cost">Training Cost ($)</Label>
            <Input
              id="training-cost"
              type="number"
              value={trainingCost}
              onChange={(e) => setTrainingCost(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Risk Reduction (%)</Label>
            <Slider
              value={[riskReduction]}
              onValueChange={([value]) => setRiskReduction(value)}
              min={0}
              max={100}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-right">{riskReduction}%</div>
          </div>

          <div className="space-y-2">
            <Label>Time Horizon (Years)</Label>
            <Slider
              value={[timeHorizon]}
              onValueChange={([value]) => setTimeHorizon(value)}
              min={1}
              max={5}
              step={1}
            />
            <div className="text-sm text-muted-foreground text-right">{timeHorizon} years</div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Financial Impact Analysis</CardTitle>
          <CardDescription>
            Key financial metrics and projected returns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{roi.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">Over {timeHorizon} years</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payback Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{paybackPeriod.toFixed(1)} years</div>
                <p className="text-sm text-muted-foreground">Break-even timeline</p>
              </CardContent>
            </Card>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectedSavings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulativeSavings"
                  name="Cumulative Savings"
                  stroke="#10b981"
                />
                <Line
                  type="monotone"
                  dataKey="costs"
                  name="Costs"
                  stroke="#ef4444"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>After Implementation</TableHead>
                <TableHead>Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Annual Disruption Cost</TableCell>
                <TableCell>${annualDisruptionCost.toLocaleString()}</TableCell>
                <TableCell>${(annualDisruptionCost - costSavings).toLocaleString()}</TableCell>
                <TableCell className="text-green-600">-${costSavings.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Recovery Time (Days)</TableCell>
                <TableCell>{recoveryTime.toFixed(1)}</TableCell>
                <TableCell>{newRecoveryTime.toFixed(1)}</TableCell>
                <TableCell className="text-green-600">-{(recoveryTime - newRecoveryTime).toFixed(1)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Risk Score</TableCell>
                <TableCell>68</TableCell>
                <TableCell>{(68 - (68 * riskReduction / 100)).toFixed(1)}</TableCell>
                <TableCell className="text-green-600">-{(68 * riskReduction / 100).toFixed(1)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to calculate Net Present Value
function calculateNPV(annualCashFlow: number, initialInvestment: number, years: number, discountRate: number): number {
  let npv = -initialInvestment
  for (let t = 1; t <= years; t++) {
    npv += annualCashFlow / Math.pow(1 + discountRate, t)
  }
  return npv
}
