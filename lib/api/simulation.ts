import { supabaseClient } from "@/lib/supabase/client"
import type { Simulation, ImpactResult, Strategy } from "@/lib/types/database"

// Simulation CRUD operations
export async function getSimulations(supplyChainId: string): Promise<Simulation[]> {
  const { data, error } = await supabaseClient
    .from("simulations")
    .select("*")
    .eq("supply_chain_id", supplyChainId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching simulations:", error)
    throw error
  }

  return data || []
}

export async function getSimulationById(simulationId: string): Promise<Simulation | null> {
  const { data, error } = await supabaseClient
    .from("simulations")
    .select("*")
    .eq("simulation_id", simulationId)
    .single()

  if (error) {
    console.error("Error fetching simulation:", error)
    throw error
  }

  return data
}

export async function createSimulation(simulation: Partial<Simulation>): Promise<Simulation> {
  const { data, error } = await supabaseClient.from("simulations").insert(simulation).select().single()

  if (error) {
    console.error("Error creating simulation:", error)
    throw error
  }

  return data
}

export async function updateSimulation(simulationId: string, updates: Partial<Simulation>): Promise<Simulation> {
  const { data, error } = await supabaseClient
    .from("simulations")
    .update(updates)
    .eq("simulation_id", simulationId)
    .select()
    .single()

  if (error) {
    console.error("Error updating simulation:", error)
    throw error
  }

  return data
}

export async function deleteSimulation(simulationId: string): Promise<void> {
  const { error } = await supabaseClient.from("simulations").delete().eq("simulation_id", simulationId)

  if (error) {
    console.error("Error deleting simulation:", error)
    throw error
  }
}

// Impact Results operations
export async function getImpactResults(simulationId: string): Promise<ImpactResult[]> {
  const { data, error } = await supabaseClient.from("impact_results").select("*").eq("simulation_id", simulationId)

  if (error) {
    console.error("Error fetching impact results:", error)
    throw error
  }

  return data || []
}

export async function createImpactResults(impactResults: Partial<ImpactResult>[]): Promise<ImpactResult[]> {
  const { data, error } = await supabaseClient.from("impact_results").insert(impactResults).select()

  if (error) {
    console.error("Error creating impact results:", error)
    throw error
  }

  return data || []
}

// Strategy operations
export async function getStrategies(simulationId: string): Promise<Strategy[]> {
  const { data, error } = await supabaseClient.from("strategies").select("*").eq("simulation_id", simulationId)

  if (error) {
    console.error("Error fetching strategies:", error)
    throw error
  }

  return data || []
}

export async function createStrategy(strategy: Partial<Strategy>): Promise<Strategy> {
  const { data, error } = await supabaseClient.from("strategies").insert(strategy).select().single()

  if (error) {
    console.error("Error creating strategy:", error)
    throw error
  }

  return data
}

export async function updateStrategy(strategyId: string, updates: Partial<Strategy>): Promise<Strategy> {
  const { data, error } = await supabaseClient
    .from("strategies")
    .update(updates)
    .eq("strategy_id", strategyId)
    .select()
    .single()

  if (error) {
    console.error("Error updating strategy:", error)
    throw error
  }

  return data
}

// Get complete simulation with impact results and strategies
export async function getCompleteSimulation(simulationId: string): Promise<{
  simulation: Simulation | null
  impactResults: ImpactResult[]
  strategies: Strategy[]
}> {
  const simulationPromise = getSimulationById(simulationId)
  const impactResultsPromise = getImpactResults(simulationId)
  const strategiesPromise = getStrategies(simulationId)

  const [simulation, impactResults, strategies] = await Promise.all([
    simulationPromise,
    impactResultsPromise,
    strategiesPromise,
  ])

  return {
    simulation,
    impactResults,
    strategies,
  }
}
