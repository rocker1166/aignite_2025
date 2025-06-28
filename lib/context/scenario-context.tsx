"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react"
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

// Default values - all empty for placeholder-only approach
const defaultScenarioData: ScenarioData = {
  scenarioName: "",
  scenarioType: "",
  disruptionSeverity: 0,
  disruptionDuration: 0,
  affectedNode: "",
  description: "",
  startDate: "",
  endDate: "",
  monteCarloRuns: 0,
  distributionType: "",
  cascadeEnabled: false,
  failureThreshold: 0,
  bufferPercent: 0,
  alternateRouting: false,
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
  

  const updateScenarioData = useCallback((data: Partial<ScenarioData>) => {
    setScenarioData(prev => ({ ...prev, ...data }))
  }, [])

  const contextValue = useMemo(() => ({
    scenarioData,
    updateScenarioData,
    supplyChains,
    setSupplyChains,
    selectedSupplyChainId,
    setSelectedSupplyChainId
  }), [scenarioData, updateScenarioData, supplyChains, selectedSupplyChainId])

  return (
    <ScenarioContext.Provider value={contextValue}>
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