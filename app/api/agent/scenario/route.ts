import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { createMem0, getMemories, addMemories } from '@mem0/vercel-ai-provider';
import { supabaseServer } from '@/lib/supabase/server';
import { sampleSize, shuffle } from 'lodash';

// ─────────────────────────────────────────────────────────
// 🔧 Configuration & Initialization
// ─────────────────────────────────────────────────────────

// Initialize Redis for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

// Initialize Mem0 with proper configuration following AI SDK docs
const mem0 = createMem0({
  provider: 'google',
  mem0ApiKey: process.env.MEM0_API_KEY || '',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  config: {
    compatibility: 'strict',
  },
  // Global Mem0 Config for all operations
  mem0Config: {
    user_id: 'scenario-agent',
    org_id: process.env.MEM0_ORG_ID || '',
    project_id: process.env.MEM0_PROJECT_ID || '',
    app_id: 'intellisupply-agent',
    agent_id: 'scenario-generator-agent',
    run_id: `scenario-run-${Date.now()}`
  }
});

// ─────────────────────────────────────────────────────────
// 🧠 Zod Schemas & Types
// ─────────────────────────────────────────────────────────

const ScenarioOutputSchema = z.object({
  scenarioName: z.string().describe('Descriptive name for the scenario'),
  scenarioType: z.enum(['NATURAL_DISASTER', 'GEOPOLITICAL', 'CYBER_ATTACK', 'SUPPLY_SHORTAGE', 'DEMAND_SURGE', 'REGULATORY', 'ECONOMIC', 'PANDEMIC', 'INFRASTRUCTURE', 'CLIMATE']).describe('Category of disruption'),
  disruptionSeverity: z.number().min(0).max(100).describe('Severity score 0-100'),
  disruptionDuration: z.number().min(1).max(365).describe('Duration in days'),
  affectedNode: z.string().describe('Primary node ID affected'),
  description: z.string().min(50).describe('Detailed scenario description'),
  startDate: z.string().describe('ISO date when scenario begins'),
  endDate: z.string().describe('ISO date when scenario ends'),
  monteCarloRuns: z.number().min(1000).max(50000).describe('Number of simulation runs'),
  distributionType: z.enum(['normal', 'lognormal', 'uniform', 'exponential', 'beta']).describe('Statistical distribution for simulation'),
  cascadeEnabled: z.boolean().describe('Whether to enable cascade failure modeling'),
  failureThreshold: z.number().min(0).max(1).describe('Threshold for node failure (0-1)'),
  bufferPercent: z.number().min(0).max(100).describe('Buffer capacity percentage'),
  alternateRouting: z.boolean().describe('Whether alternate routing is available'),
  randomSeed: z.string().describe('Seed for reproducible simulations'),
  impactMetrics: z.object({
    costImpact: z.number().describe('Estimated cost impact in USD'),
    timeImpact: z.number().describe('Time delay impact in hours'),
    qualityImpact: z.number().min(0).max(100).describe('Quality degradation percentage'),
    customerImpact: z.number().min(0).max(100).describe('Customer satisfaction impact')
  }),
  mitigationStrategies: z.array(z.string()).describe('Potential mitigation approaches'),
  probability: z.number().min(0).max(1).describe('Likelihood of occurrence (0-1)'),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).describe('Response urgency level')
});

const ScenariosOutputSchema = z.array(ScenarioOutputSchema).min(3).max(5); // Reduced from 10 to 5

// Request schema with optimized defaults
const ScenarioRequestSchema = z.object({
  supplyChainId: z.string().min(1),
  customPrompt: z.string().optional(),
  scenarioCount: z.number().min(3).max(5).default(3), // Reduced from 10 to 5 max
  timeHorizon: z.number().min(30).max(365).default(90),
  focusType: z.enum(['ALL', 'HIGH_RISK', 'RANDOM', 'CRITICAL_NODES']).default('ALL'),
  includeHistorical: z.boolean().default(true),
  forceRefresh: z.boolean().default(false) // Add this field
});

// ─────────────────────────────────────────────────────────
// 🚀 Performance Optimization Utilities
// ─────────────────────────────────────────────────────────

interface PerformanceTimer {
  start: number;
  checkpoint: (label: string) => void;
  total: () => number;
}

function createPerformanceTimer(): PerformanceTimer {
  const start = Date.now();
  const checkpoints: { [key: string]: number } = {};
  
  return {
    start,
    checkpoint: (label: string) => {
      checkpoints[label] = Date.now() - start;
      console.log(`⚡ ${label}: ${checkpoints[label]}ms`);
    },
    total: () => Date.now() - start
  };
}

// ─────────────────────────────────────────────────────────
// 🎯 Production Scenario Generator Agent
// ─────────────────────────────────────────────────────────

class ProductionScenarioAgent {
  
  constructor() {
    // Agent initialized with comprehensive tooling
  }

  public async getCachedScenarios(supplyChainId: string): Promise<any | null> {
    try {
      const cached = await redis.get(`scenarios:${supplyChainId}`);
      if (cached) {
        const parsedData = typeof cached === 'string' ? JSON.parse(cached) : cached;
        console.log(`Retrieved cached scenarios for chain ${supplyChainId}`);
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  public async cacheScenarios(supplyChainId: string, data: any): Promise<void> {
    try {
      const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
      await redis.setex(`scenarios:${supplyChainId}`, 3600, jsonData); // 1 hour TTL
      console.log(`Successfully cached scenarios for chain ${supplyChainId}`);
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }  private async fetchIntelligenceContext(supplyChainId: string): Promise<any> {
    try {
      // Use Promise.race for faster response - first source wins
      const intelligencePromises = [];

      // Add Mem0 promise if available
      if (process.env.MEM0_API_KEY) {
        intelligencePromises.push(
          Promise.race([
            getMemories(
              `intelligence ${supplyChainId}`,
              {
                user_id: `supply-chain-${supplyChainId}`,
                mem0ApiKey: process.env.MEM0_API_KEY,
                org_id: process.env.MEM0_ORG_ID,
                project_id: process.env.MEM0_PROJECT_ID
              }
            ).then(memories => ({
              source: 'mem0',
              data: memories?.slice(0, 3) || [], // Limit to 3 most relevant
              count: memories?.length || 0
            })),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Mem0 timeout')), 2000))
          ])
        );
      }

      // Add Supabase promise with timeout
      intelligencePromises.push(
        Promise.race([
          supabaseServer
            .from('supply_chain_intel')
            .select('id, risk_level, intel_type, summary') // Only essential fields
            .eq('supply_chain_id', supplyChainId)
            .order('created_at', { ascending: false })
            .limit(3) // Limit to 3 records for speed
            .then(({ data }) => ({
              source: 'supabase',
              data: data || [],
              count: data?.length || 0
            })),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 2000))
        ])
      );      // Return first successful result
      const result = await Promise.any(intelligencePromises).catch(() => null);
      
      if (result && typeof result === 'object' && 'source' in result) {
        const typedResult = result as any;
        console.log(`Fast intel fetch: ${typedResult.count} records from ${typedResult.source} (2s max)`);
        return result;
      }

      return { source: 'none', data: [], count: 0 };
    } catch (error) {
      console.warn('Intelligence context fetch timeout/error:', error);
      return { source: 'none', data: [], count: 0 };
    }
  }  private async fetchSupplyChainStructure(supplyChainId: string): Promise<any> {
    try {
      // Parallel fetch with timeout for speed
      const [chainResult, nodesResult] = await Promise.allSettled([
        Promise.race([
          supabaseServer
            .from('supply_chains')
            .select('supply_chain_id, name, description, nodes, edges') // Include nodes and edges JSONB
            .eq('supply_chain_id', supplyChainId)
            .single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Chain timeout')), 3000))
        ]),
        Promise.race([
          supabaseServer
            .from('nodes')
            .select('node_id, id, name, type, location, risk_level') // Only essential fields
            .eq('supply_chain_id', supplyChainId)
            .limit(50), // Limit nodes for faster processing
          new Promise((_, reject) => setTimeout(() => reject(new Error('Nodes timeout')), 3000))
        ])
      ]);

      const chainData = chainResult.status === 'fulfilled' ? (chainResult.value as any)?.data : null;
      const nodesData = nodesResult.status === 'fulfilled' ? (nodesResult.value as any)?.data : [];

      if (!chainData) {
        throw new Error(`Supply chain ${supplyChainId} not found`);
      }

      // Handle nodes from both sources: JSONB in supply_chains table AND nodes table
      let allNodes = [];
      
      // 1. PRIORITIZE nodes from supply_chains.nodes JSONB column (primary source)
      if (chainData.nodes && Array.isArray(chainData.nodes) && chainData.nodes.length > 0) {
        const jsonbNodes = chainData.nodes.map((node: any) => ({
          node_id: node.id, // Map 'id' to 'node_id'
          id: node.id,
          name: node.data?.label || node.data?.name || node.label || node.name || 'Unknown Node',
          type: node.data?.type?.toLowerCase() || node.type?.toLowerCase() || 'unknown',
          location: node.data?.address || node.data?.location || node.location || 'Unknown Location',
          risk_level: node.data?.riskScore || node.riskScore || 0.3, // Default risk score
          capacity: node.data?.capacity || node.capacity || 500,
          leadTime: node.data?.leadTime || node.leadTime || 7,
          description: node.data?.description || node.description || `${node.data?.type || node.type || 'Node'} in supply chain`
        }));
        allNodes = jsonbNodes;
        console.log(`✅ Found ${jsonbNodes.length} nodes from supply_chains.nodes JSONB`);
      }
      
      // 2. Merge/Append nodes from dedicated nodes table (secondary source)
      if (nodesData && nodesData.length > 0) {        // Check for duplicates by node_id before merging
        const existingIds = new Set(allNodes.map((n: any) => n.node_id || n.id));
        const uniqueNodes = nodesData.filter((node: any) => !existingIds.has(node.node_id || node.id));
        
        if (uniqueNodes.length > 0) {
          allNodes = [...allNodes, ...uniqueNodes];
          console.log(`✅ Added ${uniqueNodes.length} unique nodes from nodes table`);
        }
      }

      // 3. Ensure we have at least some nodes for scenario generation
      if (allNodes.length === 0) {
        console.warn(`⚠️ No nodes found for supply chain ${supplyChainId}. Creating fallback nodes.`);
        // Create fallback nodes from chain metadata
        allNodes = [
          {
            node_id: `fallback-${supplyChainId}-supplier`,
            id: `fallback-${supplyChainId}-supplier`,
            name: `${chainData.name || 'Supply Chain'} - Primary Supplier`,
            type: 'supplier',
            location: 'Unknown Location',
            risk_level: 0.3,
            capacity: 1000,
            leadTime: 7,
            description: `Primary supplier node for ${chainData.name || 'supply chain'}`
          },
          {
            node_id: `fallback-${supplyChainId}-factory`,
            id: `fallback-${supplyChainId}-factory`,
            name: `${chainData.name || 'Supply Chain'} - Main Factory`,
            type: 'factory',
            location: 'Unknown Location',
            risk_level: 0.2,
            capacity: 800,
            leadTime: 5,
            description: `Main factory node for ${chainData.name || 'supply chain'}`
          },
          {
            node_id: `fallback-${supplyChainId}-distribution`,
            id: `fallback-${supplyChainId}-distribution`,
            name: `${chainData.name || 'Supply Chain'} - Distribution Center`,
            type: 'distribution',
            location: 'Unknown Location',
            risk_level: 0.25,
            capacity: 1200,
            leadTime: 3,
            description: `Distribution center for ${chainData.name || 'supply chain'}`
          }
        ];
        console.log(`🔧 Created ${allNodes.length} fallback nodes for scenario generation`);
      }

      console.log(`🚀 Fast chain fetch: ${allNodes.length} total nodes (3s max)`);
      console.log(`📊 Node types: ${allNodes.map((n: any) => n.type).join(', ')}`);

      return {
        ...chainData,
        detailedNodes: allNodes,
        detailedEdges: chainData.edges || [] // Use JSONB edges or empty array
      };
    } catch (error) {
      console.error('❌ Supply chain structure fetch error:', error);
      throw error;
    }
  }  private selectTargetNodes(
    chainData: any, 
    intelData: any[], 
    focusType: string, 
    count: number = 3 // Reduced from 5 for speed
  ): string[] {
    const availableNodes = chainData.detailedNodes || chainData.nodes || [];
    
    if (!availableNodes.length) {
      console.warn('⚠️ No nodes available for selection - this should not happen after fallback creation');
      return [`fallback-node-${chainData.supply_chain_id}-1`];
    }

    console.log(`🎯 Available nodes for selection: ${availableNodes.length}`);
    console.log(`🏷️ Node types: ${availableNodes.map((n: any) => n.type || 'unknown').join(', ')}`);

    // Limit to max 3 nodes for faster processing
    const maxNodes = Math.min(count, 3);

    switch (focusType) {
      case 'HIGH_RISK':
        const riskSorted = availableNodes
          .filter((n: any) => n.risk_level !== undefined && n.risk_level !== null)
          .sort((a: any, b: any) => (b.risk_level || 0) - (a.risk_level || 0))
          .slice(0, maxNodes);
        
        // Always return nodes, fallback to any available if no risk data
        const riskNodes = riskSorted.length ? riskSorted : availableNodes.slice(0, maxNodes);
        console.log(`🎯 HIGH_RISK selection: ${riskNodes.length} nodes`);
        return riskNodes.map((n: any) => n.node_id || n.id);

      case 'CRITICAL_NODES':
        const criticalTypes = ['port', 'factory', 'warehouse', 'supplier', 'distribution'];
        const criticalNodes = availableNodes
          .filter((n: any) => criticalTypes.includes(n.type?.toLowerCase()))
          .slice(0, maxNodes);
        
        // Always return nodes, fallback to any available if no critical types found
        const criticalSelected = criticalNodes.length ? criticalNodes : availableNodes.slice(0, maxNodes);
        console.log(`🎯 CRITICAL_NODES selection: ${criticalSelected.length} nodes`);
        return criticalSelected.map((n: any) => n.node_id || n.id);

      case 'RANDOM':
        const randomSelected = sampleSize(availableNodes, maxNodes);
        console.log(`🎯 RANDOM selection: ${randomSelected.length} nodes`);
        return randomSelected.map((n: any) => n.node_id || n.id);

      case 'ALL':
      default:
        // Improved mix strategy with guaranteed fallbacks
        const result = [];
        
        // 1. Try to get highest risk node
        const riskNode = availableNodes
          .filter((n: any) => n.risk_level !== undefined && n.risk_level !== null)
          .sort((a: any, b: any) => (b.risk_level || 0) - (a.risk_level || 0))[0];
        if (riskNode) result.push(riskNode);

        // 2. Try to get critical node
        const criticalNode = availableNodes
          .find((n: any) => ['port', 'factory', 'warehouse', 'supplier', 'distribution'].includes(n.type?.toLowerCase()));
        if (criticalNode && !result.includes(criticalNode)) result.push(criticalNode);

        // 3. Fill remaining slots with other nodes
        const usedNodes = new Set(result.map((n: any) => n.node_id || n.id));
        const remainingNodes = availableNodes.filter((n: any) => 
          !usedNodes.has(n.node_id || n.id)
        );
        
        while (result.length < maxNodes && remainingNodes.length > 0) {
          const randomIndex = Math.floor(Math.random() * remainingNodes.length);
          result.push(remainingNodes.splice(randomIndex, 1)[0]);
        }

        // Ensure we have at least some nodes
        const finalSelection = result.length ? result : availableNodes.slice(0, maxNodes);
        console.log(`🎯 ALL (mixed) selection: ${finalSelection.length} nodes`);
        return finalSelection.map((n: any) => n.node_id || n.id);
    }
  }  private buildScenarioPrompt(
    chainData: any,
    intelData: any[],
    selectedNodes: string[],
    customPrompt?: string,
    scenarioCount: number = 3, // Reduced default
    timeHorizon: number = 90
  ): string {
    // Simplified, focused prompt for faster AI generation
    const basePrompt = customPrompt || `Generate ${scenarioCount} diverse supply chain disruption scenarios for the next ${timeHorizon} days. Focus on realistic, actionable scenarios with varied severity levels.`;

    // Build node context - handle both real and fallback nodes
    const nodeContext = selectedNodes.slice(0, 3).map(id => {
      if (id.startsWith('fallback-')) {
        // Extract node type from fallback ID and create meaningful context
        const nodeType = id.includes('supplier') ? 'Supplier' : 
                         id.includes('factory') ? 'Factory' : 
                         id.includes('distribution') ? 'Distribution Center' : 'Node';
        return `${nodeType} (${chainData.name || 'Supply Chain'})`;
      }
      
      // Find real node data from both possible sources
      const nodeData = chainData.detailedNodes?.find((n: any) => 
        (n.node_id === id || n.id === id)
      ) || chainData.nodes?.find((n: any) => 
        (n.node_id === id || n.id === id)
      );
      
      if (nodeData) {
        const name = nodeData.name || nodeData.data?.label || nodeData.data?.name || 'Unknown Node';
        const type = nodeData.type || nodeData.data?.type || 'unknown';
        const location = nodeData.location || nodeData.data?.address || nodeData.data?.location || 'Unknown Location';
        const riskLevel = nodeData.risk_level || nodeData.data?.riskScore || 0.3;
        
        return `${name} (${type}) at ${location} [Risk: ${(riskLevel * 100).toFixed(0)}%]`;
      }
      
      return `Node ${id} (Unknown details)`;
    }).join(', ');

    // Build intelligence context (limited for speed)
    const intelContext = intelData.slice(0, 2).map((intel: any) => {
      if (intel.summary) return intel.summary;
      if (intel.content) return intel.content.substring(0, 200) + '...';
      if (intel.memory) return intel.memory;
      return 'Intelligence data available';
    }).join('; ');

    return `
${basePrompt}

CHAIN: ${chainData.name || 'Supply Chain'}
DESCRIPTION: ${chainData.description || 'Supply chain disruption analysis'}
TARGET NODES: ${nodeContext}
RECENT INTEL: ${intelContext || 'No specific intelligence available'}

Generate exactly ${scenarioCount} realistic scenarios with:
- Varied types (natural disaster, cyber attack, geopolitical event, supply shortage, demand surge, etc.)
- Different severity levels (0-100) - include both moderate (30-60) and high (70-90) scenarios
- Realistic timeframes (1-365 days) - mix of short-term (1-30) and longer disruptions
- Specific affected nodes from the targets above
- Monte Carlo simulation runs: 1000-50000 (vary based on complexity)
- Quantified impact estimates (cost in USD, time delays in hours, quality %, customer satisfaction %)
- Practical mitigation strategies for each scenario
- Probability scores (0-1) and urgency levels (LOW/MEDIUM/HIGH/CRITICAL)
- Use current date as reference: ${new Date().toISOString().split('T')[0]}

Keep descriptions detailed but actionable. Focus on realistic business impacts.
Each scenario should target one of the specified nodes as the primary disruption point.
Ensure scenarios are diverse in type, impact, and mitigation approaches.
`;
  }
  public async generateScenarios(request: any): Promise<any> {
    const timer = createPerformanceTimer();

    try {
      // Validate request
      const validatedRequest = ScenarioRequestSchema.parse(request);
      const { 
        supplyChainId, 
        customPrompt, 
        scenarioCount, 
        timeHorizon, 
        focusType,
        includeHistorical,
        forceRefresh
      } = validatedRequest;
      timer.checkpoint('Request validation');

      // Check for cached results first (super fast path)
      if (!forceRefresh) {
        const cached = await this.getCachedScenarios(supplyChainId);
        if (cached) {
          timer.checkpoint('Cache hit');
          return {
            success: true,
            scenarios: cached.scenarios,
            fromCache: true,
            generatedAt: cached.generatedAt,
            processingTime: timer.total(),
            metadata: cached.metadata
          };
        }
      }
      timer.checkpoint('Cache check');

      // Fetch data in parallel for speed
      const [intelData, chainData] = await Promise.allSettled([
        this.fetchIntelligenceContext(supplyChainId),
        this.fetchSupplyChainStructure(supplyChainId)
      ]);
      timer.checkpoint('Data fetching');

      // Handle intelligence data
      let actualIntelData: any[] = [];
      if (intelData.status === 'fulfilled' && intelData.value) {
        const intel = intelData.value;
        if (intel.source === 'mem0' && Array.isArray(intel.data)) {
          actualIntelData = intel.data.slice(0, 2); // Limit for speed
        } else if (intel.source === 'supabase' && Array.isArray(intel.data)) {
          actualIntelData = intel.data.slice(0, 2); // Limit for speed
        }
        console.log(`Found ${actualIntelData.length} intel records from ${intel.source || 'unknown'}`);
      }

      // Handle chain data
      if (chainData.status !== 'fulfilled' || !chainData.value) {
        throw new Error(`Supply chain ${supplyChainId} not found or fetch failed`);
      }
      const chain = chainData.value;
      timer.checkpoint('Data processing');      // Select target nodes for scenario generation (reduced count for speed)
      const selectedNodes = this.selectTargetNodes(
        chain, 
        actualIntelData, 
        focusType, 
        Math.min(scenarioCount, 3) // Max 3 nodes for faster processing
      );

      console.log(`🎯 Node selection result: ${selectedNodes.length} nodes selected`);
      console.log(`📋 Selected node IDs: ${selectedNodes.join(', ')}`);

      if (!selectedNodes.length) {
        console.error('❌ CRITICAL ERROR: No suitable nodes found for scenario generation');
        console.error('📊 Chain data:', {
          name: chain.name,
          supply_chain_id: chain.supply_chain_id,
          detailedNodesCount: chain.detailedNodes?.length || 0,
          nodesCount: chain.nodes?.length || 0,
          detailedNodes: chain.detailedNodes?.slice(0, 3) || [],
          nodes: chain.nodes?.slice(0, 3) || []
        });
        throw new Error(`No suitable nodes found for scenario generation. Supply chain ${supplyChainId} appears to have no processable node data.`);
      }
      timer.checkpoint('Node selection');

      // Build simplified prompt for faster AI generation
      const prompt = this.buildScenarioPrompt(
        chain,
        actualIntelData,
        selectedNodes,
        customPrompt,
        scenarioCount,
        timeHorizon
      );
      timer.checkpoint('Prompt building');

      // Generate scenarios using faster model configuration
      console.log(`🚀 Fast generating ${scenarioCount} scenarios...`);
      
      const { object: scenarios } = await generateObject({
        model: google('gemini-1.5-flash'), // Use Flash model for speed
        schema: ScenariosOutputSchema,
        prompt,
        temperature: 0.7, // Slightly reduce creativity for speed
        maxTokens: 2000, // Limit response size for speed
      });
      timer.checkpoint('AI generation');

      // Minimal enhancement for speed
      const enhancedScenarios = this.enhanceScenarios(scenarios, chain, selectedNodes);
      timer.checkpoint('Scenario enhancement');

      // Background storage (don't wait for it)
      this.storeScenarios(supplyChainId, enhancedScenarios).catch(err => 
        console.warn('Background storage failed:', err)
      );

      // Cache results
      const result = {
        scenarios: enhancedScenarios,
        generatedAt: new Date().toISOString(),        metadata: {
          supplyChainId,
          selectedNodes,
          intelSourcesUsed: actualIntelData.length,
          intelSource: intelData.status === 'fulfilled' && intelData.value ? (intelData.value as any).source : 'none',
          focusType,
          timeHorizon,
          scenarioCount: enhancedScenarios.length
        }
      };

      // Background caching (don't wait for it)
      this.cacheScenarios(supplyChainId, result).catch(err => 
        console.warn('Background caching failed:', err)
      );
      timer.checkpoint('Final processing');

      console.log(`✅ Scenario generation completed in ${timer.total()}ms`);

      return {
        success: true,
        ...result,
        fromCache: false,
        processingTime: timer.total()
      };

    } catch (error) {
      console.error('Scenario generation error:', error);
      console.log(`❌ Failed after ${timer.total()}ms`);
      throw error;
    }
  }
  private enhanceScenarios(scenarios: any[], chainData: any, selectedNodes: string[]): any[] {
    return scenarios.map((scenario, index) => {
      // Minimal enhancement for speed
      
      // Ensure valid affected node
      if (!selectedNodes.includes(scenario.affectedNode)) {
        scenario.affectedNode = selectedNodes[index % selectedNodes.length];
      }

      // Generate deterministic random seed
      scenario.randomSeed = `scenario-${chainData.supply_chain_id || chainData.id}-${Date.now()}-${index}`;

      // Quick date calculation
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14)); // Start within 14 days
      scenario.startDate = startDate.toISOString();

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.min(scenario.disruptionDuration, 30)); // Cap at 30 days
      scenario.endDate = endDate.toISOString();

      // Optimize Monte Carlo parameters
      scenario.monteCarloRuns = Math.min(Math.max(scenario.monteCarloRuns, 10000), 25000);

      return scenario;
    });
  }  private async storeScenarios(supplyChainId: string, scenarios: any[]): Promise<void> {
    // Background storage - don't block main response
    try {
      // Store in Supabase only (skip Mem0 for speed in background)
      const dbRecords = scenarios.map(scenario => ({
        supply_chain_id: supplyChainId,
        name: scenario.scenarioName,
        scenario_type: scenario.scenarioType,
        parameters: scenario,
        status: 'generated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabaseServer
        .from('simulations')
        .insert(dbRecords);

      if (error) {
        console.error('Background Supabase storage error:', error);
      } else {
        console.log(`Background stored ${scenarios.length} scenarios`);
      }

      // Store in Mem0 only if quick
      if (process.env.MEM0_API_KEY && scenarios.length <= 3) {
        const quickMemory = [
          {
            role: 'user' as const,
            content: [
              {
                type: 'text' as const,
                text: `Generated ${scenarios.length} scenarios: ${scenarios.map(s => s.scenarioName).join(', ')}`
              }
            ]
          }
        ];

        await Promise.race([
          addMemories(quickMemory, {
            user_id: `supply-chain-${supplyChainId}`,
            mem0ApiKey: process.env.MEM0_API_KEY,
            org_id: process.env.MEM0_ORG_ID,
            project_id: process.env.MEM0_PROJECT_ID,
            agent_id: 'scenario-generator-agent',
            app_id: 'intellisupply-agent'
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Mem0 timeout')), 3000))
        ]);
      }

    } catch (error) {
      console.error('Background scenario storage error:', error);
    }
  }
}

// ─────────────────────────────────────────────────────────
// 🌐 API Route Handlers
// ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const timer = createPerformanceTimer();

  try {
    const body = await request.json();
    timer.checkpoint('Request parsing');
    
    // Validate request body
    const validatedRequest = ScenarioRequestSchema.parse(body);
    const { supplyChainId } = validatedRequest;
    timer.checkpoint('Request validation');

    console.log(`🚀 Scenario generation request for chain: ${supplyChainId}`);

    // Create agent instance
    const agent = new ProductionScenarioAgent();

    // Generate scenarios
    const result = await agent.generateScenarios(validatedRequest);
    timer.checkpoint('Scenario generation');

    console.log(`✅ Total API response time: ${timer.total()}ms`);

    return NextResponse.json({
      ...result,
      totalProcessingTime: timer.total(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scenario API error:', error);
    console.log(`❌ API failed after ${timer.total()}ms`);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request parameters',
        details: error.errors,
        processingTime: timer.total()
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Scenario generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: timer.total()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const supplyChainId = url.searchParams.get('supply_chain_id');
    const fromCache = url.searchParams.get('from_cache') !== 'false';

    if (!supplyChainId) {
      return NextResponse.json({
        error: 'supply_chain_id parameter is required'
      }, { status: 400 });
    }

    const agent = new ProductionScenarioAgent();

    if (fromCache) {
      const cached = await agent.getCachedScenarios(supplyChainId);
      if (cached) {
        return NextResponse.json({
          success: true,
          ...cached,
          fromCache: true
        });
      }
    }

    // If no cache or cache disabled, return empty result
    return NextResponse.json({
      success: true,
      scenarios: [],
      message: 'No cached scenarios found. Use POST endpoint to generate new scenarios.'
    });

  } catch (error) {
    console.error('Scenario GET error:', error);
    return NextResponse.json({
      error: 'Failed to retrieve scenarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}