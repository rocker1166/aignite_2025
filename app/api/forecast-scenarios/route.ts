import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { agentTools } from '../coordination/agent-tools';
import { logger } from '@/lib/monitoring';

// Input validation schema
const ForecastScenariosRequestSchema = z.object({
  supply_chain_id: z.string().uuid(),
  count: z.number().min(1).max(10).default(5),
  focusArea: z.enum(['weather', 'disruptions', 'market', 'all']).default('all')
});

/**
 * GET /api/forecast-scenarios
 * Generates forecast-based scenarios for a supply chain using cached data
 */
export async function GET(request: NextRequest) {
  const traceId = `forecast-scenarios-${Date.now()}`;
  const startTime = Date.now();

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const supply_chain_id = searchParams.get('supply_chain_id');
    const count = parseInt(searchParams.get('count') || '5');
    const focusArea = searchParams.get('focusArea') || 'all';

    // Validate input
    const validationResult = ForecastScenariosRequestSchema.safeParse({
      supply_chain_id,
      count,
      focusArea
    });

    if (!validationResult.success) {
      logger.error({
        message: 'Invalid forecast scenarios request',
        errors: validationResult.error.errors,
        traceId
      });

      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const { supply_chain_id: supplyChainId } = validationResult.data;

    console.log(`[FORECAST-SCENARIOS] 🎯 Generating scenarios for supply chain: ${supplyChainId}`);

    // Check for cached scenarios first
    const supabase = supabaseServer;
    const { data: cachedScenarios, error: cacheError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('supply_chain_id', supplyChainId)
      .order('created_at', { ascending: false })
      .limit(count);

    if (cacheError) {
      console.warn(`[FORECAST-SCENARIOS] ⚠️ Cache lookup failed: ${cacheError.message}`);
    }

    // If we have recent cached scenarios (within last 24 hours), return them
    if (cachedScenarios && cachedScenarios.length > 0) {
      const recentScenarios = cachedScenarios.filter(scenario => {
        const createdAt = new Date(scenario.created_at);
        const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation < 24; // Cache valid for 24 hours
      });

      if (recentScenarios.length > 0) {
        console.log(`[FORECAST-SCENARIOS] ✅ Returning ${recentScenarios.length} cached scenarios`);
        
        const transformedScenarios = recentScenarios.map(scenario => ({
          scenarioName: scenario.scenario_name || 'Forecast Scenario',
          scenarioType: scenario.scenario_type || 'operational',
          description: scenario.description || 'AI-generated forecast scenario',
          disruptionSeverity: scenario.disruption_severity || 75,
          disruptionDuration: scenario.disruption_duration || 14,
          affectedNode: scenario.affected_node || 'all',
          startDate: scenario.start_date || '',
          endDate: scenario.end_date || '',
          monteCarloRuns: scenario.monte_carlo_runs || 1000,
          distributionType: scenario.distribution_type || 'normal',
          cascadeEnabled: scenario.cascade_enabled || true,
          failureThreshold: scenario.failure_threshold || 0.5,
          bufferPercent: scenario.buffer_percent || 15,
          alternateRouting: scenario.alternate_routing || true,
          randomSeed: scenario.random_seed || '',
          createdAt: scenario.created_at
        }));

        return NextResponse.json({
          success: true,
          scenarios: transformedScenarios,
          fromCache: true,
          processingTime: Date.now() - startTime,
          message: `Retrieved ${transformedScenarios.length} cached forecast scenarios`
        });
      }
    }

    // No recent cached scenarios, generate new ones using the agent tools
    console.log(`[FORECAST-SCENARIOS] 🤖 Generating new scenarios using AI agents`);

    try {
      // Use the generateScenarios tool from coordination agent-tools
      const scenarioResult = await agentTools.generateScenarios.execute({
        supplyChainId,
        disruptionType: 'all', // Generate various types of disruptions
        nodeId: 'all', // Analyze all nodes
        userId: 'system' // System-generated scenarios
      });

      if (scenarioResult && scenarioResult.originalResult) {
        const generatedScenarios = scenarioResult.originalResult.scenarios || [];
        
        console.log(`[FORECAST-SCENARIOS] ✅ Generated ${generatedScenarios.length} new scenarios`);

        // Transform the agent output to match the expected format
        const transformedScenarios = generatedScenarios.slice(0, count).map((scenario: any, index: number) => ({
          scenarioName: scenario.scenarioName || `Forecast Scenario ${index + 1}`,
          scenarioType: scenario.scenarioType || 'operational',
          description: scenario.description || 'AI-generated forecast scenario based on current risk analysis',
          disruptionSeverity: scenario.disruptionSeverity || Math.floor(Math.random() * 50) + 50, // 50-100
          disruptionDuration: scenario.disruptionDuration || Math.floor(Math.random() * 21) + 5, // 5-25 days
          affectedNode: scenario.affectedNode || 'all',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + (scenario.disruptionDuration || 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monteCarloRuns: 1000,
          distributionType: 'normal',
          cascadeEnabled: true,
          failureThreshold: 0.5,
          bufferPercent: 15,
          alternateRouting: true,
          randomSeed: Math.random().toString(36).substring(7)
        }));

        return NextResponse.json({
          success: true,
          scenarios: transformedScenarios,
          fromCache: false,
          processingTime: Date.now() - startTime,
          message: `Generated ${transformedScenarios.length} new forecast scenarios`
        });
      } else {
        throw new Error('Failed to generate scenarios using agent tools');
      }

    } catch (agentError) {
      console.error(`[FORECAST-SCENARIOS] ❌ Agent generation failed:`, agentError);
      
      // Fallback: Generate basic scenarios
      const fallbackScenarios = [
        {
          scenarioName: "Supply Chain Disruption - Weather",
          scenarioType: "weather",
          description: "Severe weather conditions affecting transportation and logistics",
          disruptionSeverity: 80,
          disruptionDuration: 10,
          affectedNode: "all",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monteCarloRuns: 1000,
          distributionType: "normal",
          cascadeEnabled: true,
          failureThreshold: 0.5,
          bufferPercent: 15,
          alternateRouting: true,
          randomSeed: Math.random().toString(36).substring(7)
        },
        {
          scenarioName: "Port Congestion Impact",
          scenarioType: "operational",
          description: "Major port experiencing significant delays and congestion",
          disruptionSeverity: 70,
          disruptionDuration: 14,
          affectedNode: "all",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monteCarloRuns: 1000,
          distributionType: "normal",
          cascadeEnabled: true,
          failureThreshold: 0.5,
          bufferPercent: 15,
          alternateRouting: true,
          randomSeed: Math.random().toString(36).substring(7)
        },
        {
          scenarioName: "Supplier Manufacturing Delays",
          scenarioType: "operational",
          description: "Key supplier experiencing production delays and capacity constraints",
          disruptionSeverity: 60,
          disruptionDuration: 21,
          affectedNode: "all",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          monteCarloRuns: 1000,
          distributionType: "normal",
          cascadeEnabled: true,
          failureThreshold: 0.5,
          bufferPercent: 15,
          alternateRouting: true,
          randomSeed: Math.random().toString(36).substring(7)
        }
      ];

      console.log(`[FORECAST-SCENARIOS] 🔄 Using fallback scenarios`);

      return NextResponse.json({
        success: true,
        scenarios: fallbackScenarios.slice(0, count),
        fromCache: false,
        processingTime: Date.now() - startTime,
        message: `Generated ${Math.min(fallbackScenarios.length, count)} fallback forecast scenarios`
      });
    }

  } catch (error) {
    console.error(`[FORECAST-SCENARIOS] ❌ Error:`, error);
    
    logger.error({
      message: 'Forecast scenarios generation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      traceId,
      processingTime: Date.now() - startTime
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to generate forecast scenarios',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

/**
 * POST /api/forecast-scenarios
 * Alternative endpoint for generating scenarios with more control
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    
    // Set supply_chain_id from body or query params
    if (body.supply_chain_id) {
      searchParams.set('supply_chain_id', body.supply_chain_id);
    }
    if (body.count) {
      searchParams.set('count', body.count.toString());
    }
    if (body.focusArea) {
      searchParams.set('focusArea', body.focusArea);
    }

    // Reconstruct the request URL and delegate to GET
    const newRequest = new NextRequest(
      `${request.url.split('?')[0]}?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: request.headers
      }
    );

    return GET(newRequest);
  } catch (error) {
    console.error(`[FORECAST-SCENARIOS] ❌ POST Error:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process POST request',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
