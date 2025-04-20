"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Download, Filter, Search } from "lucide-react"

interface StrategyDashboardProps {
  scenarioId: string
}

export default function StrategyDashboard({ scenarioId }: StrategyDashboardProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([])
  const [appliedStrategies, setAppliedStrategies] = useState<string[]>([])

  const toggleStrategy = (id: string) => {
    if (selectedStrategies.includes(id)) {
      setSelectedStrategies(selectedStrategies.filter((s) => s !== id))
    } else {
      setSelectedStrategies([...selectedStrategies, id])
    }
  }

  const applySimulation = (id: string) => {
    if (!appliedStrategies.includes(id)) {
      setAppliedStrategies([...appliedStrategies, id])
    }
  }

  // Dummy data for strategies
  const strategies = [
    {
      id: "alt-port",
      title: "Alternate Port Routing",
      description: "Reroute shipments through alternative ports to avoid closure impact",
      cost: 600000,
      savings: 2900000,
      roi: 4.8,
      time: 3,
      impactReduction: 45,
    },
    {
      id: "dual-source",
      title: "Dual-Sourcing",
      description: "Implement dual-sourcing strategy for critical components",
      cost: 450000,
      savings: 2300000,
      roi: 5.1,
      time: 5,
      impactReduction: 38,
    },
    {
      id: "temp-warehouse",
      title: "Temporary Warehousing",
      description: "Secure temporary warehousing near alternative ports",
      cost: 300000,
      savings: 1200000,
      roi: 4.0,
      time: 2,
      impactReduction: 25,
    },
    {
      id: "air-freight",
      title: "Air-freight Triage",
      description: "Use air-freight for high-priority items to maintain service levels",
      cost: 500000,
      savings: 3200000,
      roi: 6.4,
      time: 1,
      impactReduction: 52,
    },
  ]

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)} M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value}`
  }

  // Calculate totals
  const totalCost = selectedStrategies.reduce((sum, id) => {
    const strategy = strategies.find((s) => s.id === id)
    return sum + (strategy?.cost || 0)
  }, 0)

  const totalSavings = selectedStrategies.reduce((sum, id) => {
    const strategy = strategies.find((s) => s.id === id)
    return sum + (strategy?.savings || 0)
  }, 0)

  const averageROI =
    selectedStrategies.length > 0
      ? selectedStrategies.reduce((sum, id) => {
          const strategy = strategies.find((s) => s.id === id)
          return sum + (strategy?.roi || 0)
        }, 0) / selectedStrategies.length
      : 0

  const averageTime =
    selectedStrategies.length > 0
      ? selectedStrategies.reduce((sum, id) => {
          const strategy = strategies.find((s) => s.id === id)
          return sum + (strategy?.time || 0)
        }, 0) / selectedStrategies.length
      : 0

  return (
    <div className="bg-[#F7F9FC]">
      {/* Header */}
      <div className="bg-white p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="ghost" size="sm" className="mb-2">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Scenario
            </Button>
            <h1 className="text-3xl font-bold text-[#1D3557]">Disruption Strategy Dashboard</h1>
            <p className="text-[#4A4A4A] mt-1">Scenario: {scenarioId}</p>
          </div>
          <div className="text-sm text-[#888]">Updated: Apr 22, 2025 10:45 AM</div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Executive Summary Panel */}
        <Card className="bg-[#F7F9FC] border mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <p className="text-xs font-bold text-[#333]">Disruption Type</p>
                <p className="text-lg">Port Closure</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#333]">Projected Impact Cost</p>
                <p className="text-xl font-semibold text-[#D62828]">$4.2 M (next 30 days)</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#333]">Estimated Downtime</p>
                <p className="text-lg">10 days</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#333]">Affected Volume</p>
                <p className="text-lg">25,000 TEUs</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#333]">Current Mitigation Spend</p>
                <p className="text-lg">$350K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select defaultValue="roi">
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roi">Highest ROI</SelectItem>
                    <SelectItem value="cost">Lowest Cost</SelectItem>
                    <SelectItem value="time">Fastest Implementation</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search strategies" className="pl-8 w-full sm:w-[200px]" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-[#3366FF] w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" /> Export Plan
              </Button>
            </div>

            {/* Strategy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {strategies.map((strategy) => (
                <Card
                  key={strategy.id}
                  className={`
                    border hover:shadow-md transition-all
                    ${selectedStrategies.includes(strategy.id) ? "border-[#3366FF] border-2 bg-[#F0F6FF]" : ""}
                  `}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-[#1D3557]">{strategy.title}</CardTitle>
                      {strategy.roi > 5 && <Badge className="bg-[#FFB703] text-white">Top ROI</Badge>}
                    </div>
                    <p className="text-sm text-[#4A4A4A] line-clamp-2">{strategy.description}</p>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <span className="text-xs font-bold bg-[#F0F0F0] px-2 py-1 rounded-full">
                        💰 Cost: {formatCurrency(strategy.cost)}
                      </span>
                      <span className="text-xs font-bold bg-[#F0F0F0] px-2 py-1 rounded-full">
                        ↗️ ROI: {strategy.roi}×
                      </span>
                      <span className="text-xs font-bold bg-[#F0F0F0] px-2 py-1 rounded-full">
                        ⏱ Time: {strategy.time} days
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-semibold text-[#2A9D8F]">
                        Projected Savings: {formatCurrency(strategy.savings)}
                      </p>
                      <p className="text-base font-semibold text-[#E76F51]">
                        Impact Reduction: {strategy.impactReduction}%
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-[#3366FF] hover:bg-[#3366FF]/90"
                      onClick={() => applySimulation(strategy.id)}
                      disabled={appliedStrategies.includes(strategy.id)}
                    >
                      {appliedStrategies.includes(strategy.id) ? "Simulated" : "Apply Simulation"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-[#3366FF] text-[#3366FF]"
                      onClick={() => toggleStrategy(strategy.id)}
                    >
                      {selectedStrategies.includes(strategy.id) ? "Remove" : "Add to Plan"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Numerical Data Table */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Strategy Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#1D3557]">Strategy Name</TableHead>
                      <TableHead className="text-[#1D3557]">Cost</TableHead>
                      <TableHead className="text-[#1D3557]">Savings</TableHead>
                      <TableHead className="text-[#1D3557]">ROI</TableHead>
                      <TableHead className="text-[#1D3557]">Time</TableHead>
                      <TableHead className="text-[#1D3557]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {strategies.map((strategy, index) => (
                      <TableRow key={strategy.id} className={index % 2 === 0 ? "bg-[#F9F9F9]" : ""}>
                        <TableCell>{strategy.title}</TableCell>
                        <TableCell>{formatCurrency(strategy.cost)}</TableCell>
                        <TableCell>{formatCurrency(strategy.savings)}</TableCell>
                        <TableCell>{strategy.roi}×</TableCell>
                        <TableCell>{strategy.time} days</TableCell>
                        <TableCell>
                          {selectedStrategies.includes(strategy.id) && <span className="text-[#2A9D8F]">Added ✓</span>}
                          {appliedStrategies.includes(strategy.id) && !selectedStrategies.includes(strategy.id) && (
                            <span className="text-[#3366FF]">Applied 🔄</span>
                          )}
                          {!selectedStrategies.includes(strategy.id) && !appliedStrategies.includes(strategy.id) && (
                            <span>—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Next Steps & Call-to-Action */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea placeholder="Add notes about your strategy plan (max 500 characters)" maxLength={500} />
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <Button variant="link" className="text-[#3366FF]">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back to Scenario
                    </Button>
                    <Button className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90">Finalize Plan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aggregated ROI Dashboard */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Plan Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="bg-[#F5F5F5] p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💰</span>
                      <div>
                        <p className="text-xs">Total Cost</p>
                        <p className="text-base font-semibold">{formatCurrency(totalCost)}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-[#F5F5F5] p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📈</span>
                      <div>
                        <p className="text-xs">Total Savings</p>
                        <p className="text-base font-semibold">{formatCurrency(totalSavings)}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-[#F5F5F5] p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🔄</span>
                      <div>
                        <p className="text-xs">Average ROI</p>
                        <p className="text-base font-semibold">{averageROI.toFixed(1)}×</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-[#F5F5F5] p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⏱</span>
                      <div>
                        <p className="text-xs">Avg. Implementation</p>
                        <p className="text-base font-semibold">{averageTime.toFixed(1)} days</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ROI Chart */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2">ROI Over Time</h3>
                  <div className="bg-white border rounded-md p-4 h-[200px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      {selectedStrategies.length === 0 ? (
                        <p>Add strategies to see ROI projection</p>
                      ) : (
                        <div className="relative w-full h-full">
                          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-300"></div>
                          <div className="absolute left-0 bottom-0 h-full w-[1px] bg-gray-300"></div>

                          {/* Cost line */}
                          <div className="absolute bottom-[30px] left-[20px] w-[80%] h-[2px] bg-red-500"></div>

                          {/* Savings line (curved upward) */}
                          <div className="absolute bottom-[30px] left-[20px] w-[80%] h-[80px] border-t-2 border-green-500 rounded-t-full"></div>

                          {/* Labels */}
                          <div className="absolute bottom-[10px] left-0 text-[10px] text-gray-500">0</div>
                          <div className="absolute bottom-[10px] right-0 text-[10px] text-gray-500">30 days</div>
                          <div className="absolute bottom-0 left-[10px] text-[10px] text-gray-500 rotate-90 origin-top-left">
                            $ (millions)
                          </div>

                          {/* Legend */}
                          <div className="absolute top-0 right-0 flex flex-col gap-1 text-[10px]">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500"></div>
                              <span>Savings</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500"></div>
                              <span>Cost</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Strategies */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Selected Strategies</h3>
                  {selectedStrategies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No strategies selected yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedStrategies.map((id) => {
                        const strategy = strategies.find((s) => s.id === id)
                        return strategy ? (
                          <li key={id} className="text-sm flex justify-between">
                            <span>{strategy.title}</span>
                            <span className="text-[#2A9D8F]">{formatCurrency(strategy.savings)}</span>
                          </li>
                        ) : null
                      })}
                    </ul>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Net Benefit:</span>
                  <span className="font-bold text-lg text-[#2A9D8F]">{formatCurrency(totalSavings - totalCost)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
