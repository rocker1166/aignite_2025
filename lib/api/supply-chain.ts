import { supabaseClient } from "@/lib/supabase/client"
import type { SupplyChain, Node, Edge } from "@/lib/types/database"

// Supply Chain CRUD operations
export async function getSupplyChains(userId :any): Promise<SupplyChain[]> {
  const query = supabaseClient.from("supply_chains").select("*").order("created_at", { ascending: false })
  // Only filter by user_id if not a placeholder
  if (userId && userId !== "placeholder-user-id") {
    query.eq("user_id", userId)
  }
  const { data, error } = await query
  if (error) {
    console.error("Error fetching supply chains:", error)
    throw error
  }
  return data || []
}

export async function getSupplyChainById(supplyChainId: string): Promise<SupplyChain | null> {
  const { data, error } = await supabaseClient
    .from("supply_chains")
    .select("*")
    .eq("supply_chain_id", supplyChainId)
    .single()

  if (error) {
    console.error("Error fetching supply chain:", error)
    throw error
  }

  return data
}

export async function createSupplyChain(supplyChain: Partial<SupplyChain>): Promise<SupplyChain> {
  const { data, error } = await supabaseClient.from("supply_chains").insert(supplyChain).select().single()

  if (error) {
    console.error("Error creating supply chain:", error)
    throw error
  }

  return data
}

export async function updateSupplyChain(supplyChainId: string, updates: Partial<SupplyChain>): Promise<SupplyChain> {
  const { data, error } = await supabaseClient
    .from("supply_chains")
    .update(updates)
    .eq("supply_chain_id", supplyChainId)
    .select()
    .single()

  if (error) {
    console.error("Error updating supply chain:", error)
    throw error
  }

  return data
}

export async function deleteSupplyChain(supplyChainId: string): Promise<void> {
  const { error } = await supabaseClient.from("supply_chains").delete().eq("supply_chain_id", supplyChainId)

  if (error) {
    console.error("Error deleting supply chain:", error)
    throw error
  }
}

// Node CRUD operations
export async function getNodes(supplyChainId: string): Promise<Node[]> {
  const { data, error } = await supabaseClient.from("nodes").select("*").eq("supply_chain_id", supplyChainId)

  if (error) {
    console.error("Error fetching nodes:", error)
    throw error
  }

  return data || []
}

export async function createNode(node: Partial<Node>): Promise<Node> {
  const { data, error } = await supabaseClient.from("nodes").insert(node).select().single()

  if (error) {
    console.error("Error creating node:", error)
    throw error
  }

  return data
}

export async function updateNode(nodeId: string, updates: Partial<Node>): Promise<Node> {
  const { data, error } = await supabaseClient.from("nodes").update(updates).eq("node_id", nodeId).select().single()

  if (error) {
    console.error("Error updating node:", error)
    throw error
  }

  return data
}

export async function deleteNode(nodeId: string): Promise<void> {
  const { error } = await supabaseClient.from("nodes").delete().eq("node_id", nodeId)

  if (error) {
    console.error("Error deleting node:", error)
    throw error
  }
}

// Edge CRUD operations
export async function getEdges(supplyChainId: string): Promise<Edge[]> {
  const { data, error } = await supabaseClient.from("edges").select("*").eq("supply_chain_id", supplyChainId)

  if (error) {
    console.error("Error fetching edges:", error)
    throw error
  }

  return data || []
}

export async function createEdge(edge: Partial<Edge>): Promise<Edge> {
  const { data, error } = await supabaseClient.from("edges").insert(edge).select().single()

  if (error) {
    console.error("Error creating edge:", error)
    throw error
  }

  return data
}

export async function updateEdge(edgeId: string, updates: Partial<Edge>): Promise<Edge> {
  const { data, error } = await supabaseClient.from("edges").update(updates).eq("edge_id", edgeId).select().single()

  if (error) {
    console.error("Error updating edge:", error)
    throw error
  }

  return data
}

export async function deleteEdge(edgeId: string): Promise<void> {
  const { error } = await supabaseClient.from("edges").delete().eq("edge_id", edgeId)

  if (error) {
    console.error("Error deleting edge:", error)
    throw error
  }
}

/**
 * Retrieves a supply chain along with its associated nodes and edges by supply chain ID.
 *
 * @param supplyChainId - The unique identifier of the supply chain to retrieve
 * @returns An object containing the supply chain, its nodes, and its edges
 */
export async function getCompleteSupplyChain(supplyChainId: string): Promise<{
  supplyChain: SupplyChain | null
  nodes: Node[]
  edges: Edge[]
}> {
  const supplyChainPromise = getSupplyChainById(supplyChainId)
  const nodesPromise = getNodes(supplyChainId)
  const edgesPromise = getEdges(supplyChainId)

  const [supplyChain, nodes, edges] = await Promise.all([supplyChainPromise, nodesPromise, edgesPromise])

  return {
    supplyChain,
    nodes,
    edges,
  }
}

/**
 * Retrieves supply chains associated with a user by invoking the 'super-worker' Supabase edge function.
 *
 * @param userId - The unique identifier of the user whose supply chains are to be fetched.
 * @returns The supply chains data returned by the edge function.
 * @throws If the edge function returns an error or no data is received.
 */
export async function getUserSupplyChains(userId: string) {
  try {
    const { data, error } = await supabaseClient.functions.invoke('super-worker', {
      body: {
        user_id: userId,
      },
    });

    if (error) {
      console.error('Super-worker edge function error:', error);
      throw new Error(error.message || 'Failed to fetch user supply chains');
    }

    if (!data) {
      throw new Error('No data returned from super-worker edge function');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user supply chains:', error);
    throw error;
  }
}

/**
 * Saves a supply chain, including its metadata, nodes, and edges, to the database using a Supabase edge function.
 *
 * @param supplyChainData - An object containing the supply chain's name, optional description, timestamp, optional organization and form data, and arrays of nodes and edges.
 * @returns The response data returned by the edge function after saving the supply chain.
 * @throws If the edge function returns an error or no data is returned.
 */
export async function saveSupplyChainToDatabase(supplyChainData: {
  name: string;
  description?: string;
  timestamp: string;
  organisation?: any;
  formData?: any;
  nodes: any[];
  edges: any[];
}) {

  console.log("supplyChainData", supplyChainData);
  try {
    const { data, error } = await supabaseClient.functions.invoke('bright-processor', {
      body: supplyChainData,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to save supply chain');
    }

    if (!data) {
      throw new Error('No data returned from edge function');
    }

    return data;
  } catch (error) {
    console.error('Error saving supply chain:', error);
    throw error;
  }
}
