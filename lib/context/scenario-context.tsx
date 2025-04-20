"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { formatISO } from "date-fns"
import type { SupplyChain } from "@/lib/types/database"

// Define the scenario data types
export type ScenarioData = {
  scenarioName: string
  scenarioType: string
  disruptionSeverity: number
  disruptionDuration: number
  affectedNode: string
  description: string
  
  // Advanced props
  startDate: string
  endDate: string
  monteCarloRuns: number
  distributionType: string
  cascadeEnabled: boolean
  failureThreshold: number
  bufferPercent: number
  alternateRouting: boolean
  randomSeed: string
}

// Sample AI scenarios
export const aiScenarioSuggestions: ScenarioData[] = [
  {
    scenarioName: "Major Port Strike",
    scenarioType: "disruption",
    disruptionSeverity: 85,
    disruptionDuration: 21,
    affectedNode: "supplier-a",
    description: "A major workers' strike at a key port affecting all incoming and outgoing shipments.",
    startDate: formatISO(new Date()),
    endDate: formatISO(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)),
    monteCarloRuns: 120,
    distributionType: "normal",
    cascadeEnabled: true,
    failureThreshold: 25,
    bufferPercent: 15,
    alternateRouting: true,
    randomSeed: "port-strike-2025"
  },
  {
    scenarioName: "Natural Disaster - Hurricane",
    scenarioType: "natural",
    disruptionSeverity: 90,
    disruptionDuration: 30,
    affectedNode: "warehouse-b",
    description: "Category 4 hurricane expected to impact manufacturing operations and distribution centers.",
    startDate: formatISO(new Date()),
    endDate: formatISO(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    monteCarloRuns: 150,
    distributionType: "poisson",
    cascadeEnabled: true,
    failureThreshold: 40,
    bufferPercent: 10,
    alternateRouting: false,
    randomSeed: "hurricane-2025"
  },
  {
    scenarioName: "Political Instability",
    scenarioType: "political",
    disruptionSeverity: 70,
    disruptionDuration: 45,
    affectedNode: "factory-c",
    description: "Political unrest in a key manufacturing region leading to production delays and export restrictions.",
    startDate: formatISO(new Date()),
    endDate: formatISO(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)),
    monteCarloRuns: 100,
    distributionType: "uniform",
    cascadeEnabled: true,
    failureThreshold: 30,
    bufferPercent: 25,
    alternateRouting: true,
    randomSeed: "political-unrest-2025"
  },
  {
    scenarioName: "Demand Surge - Holiday Season",
    scenarioType: "demand",
    disruptionSeverity: 65,
    disruptionDuration: 14,
    affectedNode: "distribution-d",
    description: "Unexpected 65% increase in demand during holiday season affecting distribution centers.",
    startDate: formatISO(new Date()),
    endDate: formatISO(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
    monteCarloRuns: 80,
    distributionType: "normal",
    cascadeEnabled: false,
    failureThreshold: 20,
    bufferPercent: 30,
    alternateRouting: true,
    randomSeed: "demand-surge-2025"
  },
  {
    scenarioName: "Supplier Bankruptcy",
    scenarioType: "disruption",
    disruptionSeverity: 80,
    disruptionDuration: 60,
    affectedNode: "supplier-a",
    description: "A key tier 1 supplier has filed for bankruptcy, causing immediate supply disruption.",
    startDate: formatISO(new Date()),
    endDate: formatISO(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)),
    monteCarloRuns: 200,
    distributionType: "normal",
    cascadeEnabled: true,
    failureThreshold: 35,
    bufferPercent: 15,
    alternateRouting: false,
    randomSeed: "bankruptcy-2025"
  }
]

// Context type definition
type ScenarioContextType = {
  scenarioData: ScenarioData
  updateScenarioData: (data: Partial<ScenarioData>) => void
  supplyChains: SupplyChain[]
  setSupplyChains: (chains: SupplyChain[]) => void
  selectedSupplyChainId: string
  setSelectedSupplyChainId: (id: string) => void
}

// Default values
const defaultScenarioData: ScenarioData = {
  scenarioName: "Port Strike Scenario",
  scenarioType: "disruption",
  disruptionSeverity: 70,
  disruptionDuration: 14,
  affectedNode: "supplier-a",
  description: "Simulating a port strike affecting key suppliers...",
  startDate: formatISO(new Date()),
  endDate: formatISO(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
  monteCarloRuns: 100,
  distributionType: "normal",
  cascadeEnabled: true,
  failureThreshold: 30,
  bufferPercent: 20,
  alternateRouting: true,
  randomSeed: ""
}

// Create the context
const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined)

// Context provider component
export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenarioData, setScenarioData] = useState<ScenarioData>(defaultScenarioData)
  const [supplyChains, setSupplyChains] = useState<SupplyChain[]>([])
  const [selectedSupplyChainId, setSelectedSupplyChainId] = useState("")

  const updateScenarioData = (data: Partial<ScenarioData>) => {
    setScenarioData(prev => ({ ...prev, ...data }))
  }

  return (
    <ScenarioContext.Provider value={{
      scenarioData,
      updateScenarioData,
      supplyChains,
      setSupplyChains,
      selectedSupplyChainId,
      setSelectedSupplyChainId
    }}>
      {children}
    </ScenarioContext.Provider>
  )
}

// Hook to use the context
export function useScenario() {
  const context = useContext(ScenarioContext)
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider')
  }
  return context
}