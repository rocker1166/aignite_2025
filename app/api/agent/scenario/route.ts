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

const ScenariosOutputSchema = z.array(ScenarioOutputSchema).min(3).max(10);

// Request schema
const ScenarioRequestSchema = z.object({
  supplyChainId: z.string().min(1),
  customPrompt: z.string().optional(),
  scenarioCount: z.number().min(3).max(10).default(5),
  timeHorizon: z.number().min(30).max(365).default(90),
  focusType: z.enum(['ALL', 'HIGH_RISK', 'RANDOM', 'CRITICAL_NODES']).default('ALL'),
  includeHistorical: z.boolean().default(true)
});

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
  }
  private async fetchIntelligenceContext(supplyChainId: string): Promise<any> {
    try {
      // Try to get from Mem0 first using proper AI SDK method
      if (process.env.MEM0_API_KEY) {        try {
          const memories = await getMemories(
            `supply chain intelligence scenarios for ${supplyChainId}`,
            {
              user_id: `supply-chain-${supplyChainId}`,
              mem0ApiKey: process.env.MEM0_API_KEY,
              org_id: process.env.MEM0_ORG_ID,
              project_id: process.env.MEM0_PROJECT_ID
            }
          );

          if (memories && memories.length > 0) {
            // Find the most recent intelligence data
            const intelMemories = memories.filter((m: any) => 
              m.memory && (m.memory.includes('intelligence') || m.memory.includes('scenario'))
            );
            
            if (intelMemories.length > 0) {
              // Return the most recent intelligence context
              return {
                source: 'mem0',
                data: intelMemories,
                count: intelMemories.length
              };
            }
          }
        } catch (error) {
          console.warn('Mem0 intelligence retrieval failed:', error);
        }
      }

      // Fallback to Supabase intelligence data
      const { data: intelData, error } = await supabaseServer
        .from('supply_chain_intel')
        .select('*')
        .eq('supply_chain_id', supplyChainId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Supabase intelligence fetch error:', error);
        return null;
      }

      return {
        source: 'supabase',
        data: intelData || [],
        count: intelData?.length || 0
      };
    } catch (error) {
      console.error('Intelligence context fetch error:', error);
      return null;
    }
  }

  private async fetchSupplyChainStructure(supplyChainId: string): Promise<any> {
    try {
      const { data: chainData, error } = await supabaseServer
        .from('supply_chains')
        .select('*, nodes, edges')
        .eq('supply_chain_id', supplyChainId)
        .single();

      if (error) {
        console.error('Supply chain fetch error:', error);
        return null;
      }

      // Also fetch detailed node information
      const { data: nodesData } = await supabaseServer
        .from('nodes')
        .select('*')
        .eq('supply_chain_id', supplyChainId);

      const { data: edgesData } = await supabaseServer
        .from('edges')
        .select('*')
        .eq('supply_chain_id', supplyChainId);

      return {
        ...chainData,
        detailedNodes: nodesData || [],
        detailedEdges: edgesData || []
      };
    } catch (error) {
      console.error('Supply chain structure fetch error:', error);
      return null;
    }
  }

  private selectTargetNodes(
    chainData: any, 
    intelData: any[], 
    focusType: string, 
    count: number = 5
  ): string[] {
    const availableNodes = chainData.detailedNodes || chainData.nodes || [];
    
    if (!availableNodes.length) {
      console.warn('No nodes available for selection');
      return [];
    }

    switch (focusType) {
      case 'HIGH_RISK':
        // Sort by risk level and take top nodes
        const riskSorted = availableNodes
          .filter((n: any) => n.risk_level !== undefined)
          .sort((a: any, b: any) => (b.risk_level || 0) - (a.risk_level || 0));
        return riskSorted.slice(0, count).map((n: any) => n.node_id || n.id);

      case 'CRITICAL_NODES':
        // Focus on critical infrastructure nodes
        const criticalTypes = ['port', 'factory', 'warehouse', 'distribution_center'];
        const criticalNodes = availableNodes.filter((n: any) => 
          criticalTypes.includes(n.type?.toLowerCase())
        );
        const selected = sampleSize(criticalNodes, Math.min(count, criticalNodes.length));
        return selected.map((n: any) => n.node_id || n.id);

      case 'RANDOM':
        // Pure random selection
        const randomSelected = sampleSize(availableNodes, Math.min(count, availableNodes.length));
        return randomSelected.map((n: any) => n.node_id || n.id);

      case 'ALL':
      default:
        // Mix: top-2 by risk + critical nodes + random
        const riskNodes = availableNodes
          .filter((n: any) => n.risk_level !== undefined)
          .sort((a: any, b: any) => (b.risk_level || 0) - (a.risk_level || 0))
          .slice(0, 2);

        const criticalNodesMix = availableNodes.filter((n: any) => 
          ['port', 'factory', 'warehouse'].includes(n.type?.toLowerCase())
        );

        const remainingNodes = availableNodes.filter((n: any) => 
          !riskNodes.includes(n) && !criticalNodesMix.includes(n)
        );

        const randomNodes = sampleSize(remainingNodes, Math.max(0, count - riskNodes.length - 1));
        const criticalSample = sampleSize(criticalNodesMix, 1);

        const finalSelection = [
          ...riskNodes.map((n: any) => n.node_id || n.id),
          ...criticalSample.map((n: any) => n.node_id || n.id),
          ...randomNodes.map((n: any) => n.node_id || n.id)
        ].slice(0, count);

        return finalSelection;
    }
  }

  private buildScenarioPrompt(
    chainData: any,
    intelData: any[],
    selectedNodes: string[],
    customPrompt?: string,
    scenarioCount: number = 5,
    timeHorizon: number = 90
  ): string {
    const basePrompt = customPrompt || `
You are an expert supply chain risk analyst and scenario planning specialist. 
Analyze the provided supply chain structure and intelligence data to generate ${scenarioCount} distinct, realistic disruption scenarios over the next ${timeHorizon} days.

REQUIREMENTS:
- Generate diverse scenario types (natural disasters, geopolitical events, cyber attacks, etc.)
- Ensure scenarios are realistic and based on current intelligence
- Vary severity levels (mix of low, medium, high, critical impacts)
- Include specific mitigation strategies for each scenario
- Set appropriate Monte Carlo simulation parameters
- Avoid major holiday blackout periods when possible
- Focus on the selected high-risk and critical nodes
`;

    const nodeDetails = chainData.detailedNodes?.filter((n: any) => 
      selectedNodes.includes(n.node_id || n.id)    ) || [];

    const relevantIntel = intelData.filter((intel: any) => 
      selectedNodes.includes(intel.node_id)
    );

    return `
${basePrompt}

SUPPLY CHAIN OVERVIEW:
Name: ${chainData.name}
Description: ${chainData.description || 'N/A'}
Total Nodes: ${chainData.detailedNodes?.length || 0}
Total Edges: ${chainData.detailedEdges?.length || 0}

SELECTED TARGET NODES (${selectedNodes.length}):
${JSON.stringify(nodeDetails, null, 2)}

RECENT INTELLIGENCE DATA:
${JSON.stringify(relevantIntel, null, 2)}

SCENARIO GENERATION GUIDELINES:
1. Each scenario must target one of the selected nodes as the primary impact point
2. Consider cascade effects through connected nodes
3. Base scenarios on real-world intelligence patterns
4. Vary disruption types across scenarios
5. Include both short-term (1-7 days) and medium-term (1-12 weeks) scenarios
6. Set Monte Carlo runs between 10,000-50,000 based on complexity
7. Use appropriate statistical distributions (normal for most, lognormal for extreme events)
8. Enable cascade modeling for interconnected disruptions
9. Include realistic mitigation strategies based on node capabilities
10. Assign probability scores based on current risk indicators

OUTPUT FORMAT:
Generate exactly ${scenarioCount} scenarios as a JSON array matching the provided schema.
Each scenario should be unique, actionable, and grounded in the provided data.
`;
  }

  public async generateScenarios(request: any): Promise<any> {
    const startTime = Date.now();

    try {
      // Validate request
      const validatedRequest = ScenarioRequestSchema.parse(request);
      const { 
        supplyChainId, 
        customPrompt, 
        scenarioCount, 
        timeHorizon, 
        focusType,
        includeHistorical 
      } = validatedRequest;

      // Check for cached results first
      if (!request.forceRefresh) {
        const cached = await this.getCachedScenarios(supplyChainId);
        if (cached) {
          return {
            success: true,
            scenarios: cached.scenarios,
            fromCache: true,
            generatedAt: cached.generatedAt,
            processingTime: Date.now() - startTime
          };
        }
      }      // Fetch intelligence context
      const intelData = await this.fetchIntelligenceContext(supplyChainId);
      let actualIntelData: any[] = [];
      
      if (intelData) {
        // Handle different data structures from Mem0 vs Supabase
        if (intelData.source === 'mem0' && Array.isArray(intelData.data)) {
          actualIntelData = intelData.data;
        } else if (intelData.source === 'supabase' && Array.isArray(intelData.data)) {
          actualIntelData = intelData.data;
        } else if (Array.isArray(intelData)) {
          actualIntelData = intelData;
        }
        
        console.log(`Found ${actualIntelData.length} intelligence records from ${intelData.source || 'unknown'} source`);
      } else {
        console.warn(`No intelligence data found for chain ${supplyChainId}, proceeding with limited context`);
      }

      // Fetch supply chain structure
      const chainData = await this.fetchSupplyChainStructure(supplyChainId);
      if (!chainData) {
        throw new Error(`Supply chain ${supplyChainId} not found`);
      }      // Select target nodes for scenario generation
      const selectedNodes = this.selectTargetNodes(
        chainData, 
        actualIntelData, 
        focusType, 
        Math.min(scenarioCount + 2, 10) // Select a few extra for variety
      );

      if (!selectedNodes.length) {
        throw new Error('No suitable nodes found for scenario generation');
      }

      // Build comprehensive prompt
      const prompt = this.buildScenarioPrompt(
        chainData,
        actualIntelData,
        selectedNodes,
        customPrompt,
        scenarioCount,
        timeHorizon
      );

      // Generate scenarios using AI
      console.log(`Generating ${scenarioCount} scenarios for chain ${supplyChainId}...`);
      
      const { object: scenarios } = await generateObject({
        model: google('gemini-1.5-pro'),
        schema: ScenariosOutputSchema,
        prompt,
      });

      // Validate and enhance generated scenarios
      const enhancedScenarios = this.enhanceScenarios(scenarios, chainData, selectedNodes);

      // Store in memory for future reference
      await this.storeScenarios(supplyChainId, enhancedScenarios);

      // Cache results
      const result = {
        scenarios: enhancedScenarios,
        generatedAt: new Date().toISOString(),        metadata: {
          supplyChainId,
          selectedNodes,
          intelSourcesUsed: actualIntelData.length,
          intelSource: intelData?.source || 'none',
          focusType,
          timeHorizon,
          scenarioCount: enhancedScenarios.length
        }
      };

      await this.cacheScenarios(supplyChainId, result);

      return {
        success: true,
        ...result,
        fromCache: false,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Scenario generation error:', error);
      throw error;
    }
  }

  private enhanceScenarios(scenarios: any[], chainData: any, selectedNodes: string[]): any[] {
    return scenarios.map((scenario, index) => {
      // Ensure we have a valid affected node
      if (!selectedNodes.includes(scenario.affectedNode)) {
        scenario.affectedNode = selectedNodes[index % selectedNodes.length];
      }

      // Generate deterministic random seed
      scenario.randomSeed = `scenario-${chainData.supply_chain_id}-${Date.now()}-${index}`;

      // Set realistic dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Start within 30 days
      scenario.startDate = startDate.toISOString();

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + scenario.disruptionDuration);
      scenario.endDate = endDate.toISOString();

      // Ensure Monte Carlo parameters are realistic
      if (scenario.monteCarloRuns < 1000) scenario.monteCarloRuns = 10000;
      if (scenario.monteCarloRuns > 50000) scenario.monteCarloRuns = 50000;

      // Add node context to description
      const affectedNodeData = chainData.detailedNodes?.find((n: any) => 
        (n.node_id || n.id) === scenario.affectedNode
      );
      
      if (affectedNodeData) {
        scenario.description += ` The affected node (${affectedNodeData.name}) is a ${affectedNodeData.type} located in ${affectedNodeData.location}.`;
      }

      return scenario;
    });
  }
  private async storeScenarios(supplyChainId: string, scenarios: any[]): Promise<void> {
    try {
      // Store in Mem0 for agent memory using proper AI SDK method
      if (process.env.MEM0_API_KEY) {
        // Create memory messages for the scenario batch
        const memoryMessages = [
          {
            role: 'user' as const,
            content: [
              {
                type: 'text' as const,
                text: `Generated ${scenarios.length} supply chain disruption scenarios for supply chain ${supplyChainId}. Scenarios include: ${scenarios.map(s => s.scenarioName).join(', ')}`
              }
            ]
          }
        ];

        // Add batch memory
        await addMemories(memoryMessages, {
          user_id: `supply-chain-${supplyChainId}`,
          mem0ApiKey: process.env.MEM0_API_KEY,
          org_id: process.env.MEM0_ORG_ID,
          project_id: process.env.MEM0_PROJECT_ID,
          agent_id: 'scenario-generator-agent',
          app_id: 'intellisupply-agent'
        });

        // Store individual scenarios for easier retrieval
        for (const scenario of scenarios) {
          const scenarioMessage = [
            {
              role: 'user' as const,
              content: [
                {
                  type: 'text' as const,
                  text: `Scenario: ${scenario.scenarioName} - ${scenario.scenarioType} affecting ${scenario.affectedNode} with ${scenario.disruptionSeverity}% severity for ${scenario.disruptionDuration} days. Description: ${scenario.description}`
                }
              ]
            }
          ];

          await addMemories(scenarioMessage, {
            user_id: `supply-chain-${supplyChainId}`,
            mem0ApiKey: process.env.MEM0_API_KEY,
            org_id: process.env.MEM0_ORG_ID,
            project_id: process.env.MEM0_PROJECT_ID,
            agent_id: 'scenario-generator-agent',
            app_id: 'intellisupply-agent'
          });
        }
      }

      // Store in Supabase for persistence
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
        console.error('Supabase scenario storage error:', error);
      }

    } catch (error) {
      console.error('Scenario storage error:', error);
    }
  }
}

// ─────────────────────────────────────────────────────────
// 🌐 API Route Handlers
// ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    
    // Validate request body
    const validatedRequest = ScenarioRequestSchema.parse(body);
    const { supplyChainId } = validatedRequest;

    console.log(`Scenario generation request for chain: ${supplyChainId}`);

    // Create agent instance
    const agent = new ProductionScenarioAgent();

    // Generate scenarios
    const result = await agent.generateScenarios(validatedRequest);

    return NextResponse.json({
      ...result,
      totalProcessingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Scenario API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request parameters',
        details: error.errors,
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Scenario generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
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