"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { formatISO } from "date-fns"
import type { SupplyChain } from "@/lib/types/database"
import { useUser } from "../stores/user"

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
  const { userData } = useUser()
  

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