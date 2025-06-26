/**
 * LLM Module
 * 
 * Responsible for:
 * 1. Invoking the LLM with the generated prompt
 * 2. Handling retries and fallbacks
 * 3. Converting raw LLM output into structured forecast
 */

import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { ForecastConfig, ForecastOutput } from './types';
import { logError } from '../../monitoring';
import { getValidSupplyChainId, generateUUID } from './database-utils';

// Zod schema for LLM output validation using Vercel AI SDK
// This approach is more reliable than raw JSON schema
const forecastSchema = z.object({
  forecastData: z.object({
    forecastPeriod: z.number(),
    forecastStartDate: z.string().describe('ISO date-time string (YYYY-MM-DDThh:mm:ss.sssZ)'),
    forecastEndDate: z.string().describe('ISO date-time string (YYYY-MM-DDThh:mm:ss.sssZ)'),
    summary: z.string().min(50),
    keyFindings: z.array(z.string()).min(1),
    riskAssessment: z.object({
      overallRiskScore: z.number().min(0).max(100),
      riskTrend: z.enum(['increasing', 'decreasing', 'stable']),
      riskFactors: z.array(z.object({
        factor: z.string().min(5),
        probability: z.number().min(0).max(1),
        impact: z.number().min(0).max(100),
        mitigation: z.string().optional()
      })).min(1)
    }),
    demandForecast: z.object({
      trend: z.enum(['increasing', 'decreasing', 'stable']),
      percentage: z.number(),
      confidence: z.number().min(0).max(1),
      factors: z.array(z.string())
    }).optional(),
    supplyForecast: z.object({
      trend: z.enum(['increasing', 'decreasing', 'stable']),
      percentage: z.number(),
      confidence: z.number().min(0).max(1),
      factors: z.array(z.string())
    }).optional(),
    priceForecast: z.object({
      trend: z.enum(['increasing', 'decreasing', 'stable']),
      percentage: z.number(),
      confidence: z.number().min(0).max(1),
      factors: z.array(z.string())
    }).optional(),
    events: z.array(z.object({
      title: z.string().min(5),
      description: z.string().min(10),
      probability: z.number().min(0).max(1),
      impact: z.enum(['low', 'medium', 'high', 'critical']),
      estimatedDate: z.string().optional(),
      category: z.enum(['weather', 'geopolitical', 'economic', 'operational', 'regulatory', 'other'])
    })),
    recommendations: z.array(z.object({
      title: z.string().min(5),
      description: z.string().min(10),
      priority: z.enum(['low', 'medium', 'high']),
      estimatedImpact: z.number().min(0).max(100),
      timeframe: z.string().min(3)
    }))
  }),
  metadata: z.object({
    createdAt: z.string().describe('ISO date-time string'),
    confidenceScore: z.number().min(0).max(1),
    dataPoints: z.number().min(0),
    sources: z.array(z.string())
  }),
  supplyChainId: z.string().describe('The valid UUID of the supply chain - must be a proper UUID format')
});

/**
 * Invoke the LLM with the generated prompt using Vercel AI SDK's generateObject
 * This function properly uses generateObject to get structured JSON output
 * directly without having to parse it from text
 */
export async function invokeLLM(
  prompt: string,
  config: ForecastConfig,
  supplyChainId?: string
): Promise<ForecastOutput> {
  const start = Date.now();
  let attempts = 0;
  let lastError: Error | null = null;

  // Define the expected return type for TypeScript - matched exactly to ForecastOutput type
  type ForecastResponseType = z.infer<typeof forecastSchema>;

  // Try primary and fallback models with retries
  while (attempts < config.maxRetries) {
    attempts++;
    try {
      console.log(`LLM attempt ${attempts}/${config.maxRetries}`);
      
      // Use Gemini for forecast generation
      if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        try {
          console.log("Attempting to generate forecast with Gemini...");
          
          // Use generateObject with Zod schema
          const { object: result } = await generateObject({
            model: google('gemini-1.5-pro'),
            schema: forecastSchema,
            prompt: `You are a supply chain forecasting AI assistant. Generate a detailed forecast based on the following information.

The response MUST be a valid JSON object matching the schema I've defined.
Include detailed analysis, risks, and recommendations.

Note: The supplyChainId will be set automatically by the system, so you can use any placeholder value.

CONTEXT INFORMATION:
${prompt}`,
            maxTokens: 4000
          });
          
          console.log(`Successfully generated forecast using Gemini (${Date.now() - start}ms)`);
          
          // Always ensure we have a valid supplyChainId (don't trust LLM output for this)
          let validSupplyChainId = supplyChainId;
          if (!validSupplyChainId) {
            const dbSupplyChainId = await getValidSupplyChainId();
            if (dbSupplyChainId) {
              validSupplyChainId = dbSupplyChainId;
            } else {
              console.warn('No valid supply chain ID found in database, using generated UUID');
              validSupplyChainId = generateUUID();
            }
          }

          // Convert the result to ForecastOutput (always override supplyChainId)
          const forecast: ForecastOutput = {
            supplyChainId: validSupplyChainId, // Always use our validated ID, not LLM's
            forecastData: result.forecastData,
            metadata: {
              ...result.metadata,
              performanceMetrics: {
                totalTime: Date.now() - start,
                stepTimes: {
                  llm: Date.now() - start
                }
              }
            }
          };
          
          return forecast;
        } catch (error) {
          console.warn('Gemini generation failed:', error);
          lastError = error instanceof Error ? error : new Error(String(error));
        }
      } else {
        throw new Error('No Gemini API key configured (GOOGLE_GENERATIVE_AI_API_KEY)');
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`LLM invocation attempt ${attempts} failed:`, error);
      
      // Exponential backoff
      const backoffMs = Math.min(100 * Math.pow(2, attempts), 3000);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // After all retries fail, log error and return fallback
  await logError('forecast.llm', lastError || new Error('Unknown LLM error'), {
    attempts,
    promptLength: prompt.length,
    configMaxRetries: config.maxRetries
  });

  // Return fallback forecast
  return await createFallbackForecast(config.timeHorizon, supplyChainId);
}

/**
 * Create a fallback forecast when LLM calls fail
 */
async function createFallbackForecast(timeHorizon: number, supplyChainId?: string): Promise<ForecastOutput> {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + timeHorizon);
  
  // Ensure we have a valid supplyChainId
  let validSupplyChainId = supplyChainId;
  if (!validSupplyChainId) {
    const dbSupplyChainId = await getValidSupplyChainId();
    if (dbSupplyChainId) {
      validSupplyChainId = dbSupplyChainId;
    } else {
      console.warn('No valid supply chain ID found in database for fallback, using generated UUID');
      validSupplyChainId = generateUUID();
    }
  }
  
  return {
    supplyChainId: validSupplyChainId,
    forecastData: {
      forecastPeriod: timeHorizon,
      forecastStartDate: now.toISOString(),
      forecastEndDate: endDate.toISOString(),
      summary: "This is a fallback forecast generated due to technical issues. The system was unable to generate a complete forecast with the available data and models.",
      keyFindings: [
        "Forecast generation encountered technical difficulties",
        "Consider refreshing data sources and trying again",
        "Check system logs for specific error details"
      ],
      riskAssessment: {
        overallRiskScore: 50,
        riskTrend: 'stable',
        riskFactors: [
          {
            factor: "System reliability",
            probability: 1.0,
            impact: 50,
            mitigation: "Check system logs and retry forecast generation"
          }
        ]
      },
      events: [
        {
          title: "Forecast generation failure",
          description: "The system was unable to generate a complete forecast with the available data and models",
          probability: 1.0,
          impact: "medium",
          category: "operational"
        }
      ],
      recommendations: [
        {
          title: "Retry forecast generation",
          description: "Wait a few minutes and try generating the forecast again",
          priority: "high",
          estimatedImpact: 90,
          timeframe: "Immediate"
        },
        {
          title: "Check system logs",
          description: "Review system logs for specific error details",
          priority: "medium",
          estimatedImpact: 70,
          timeframe: "Today"
        }
      ]
    },
    metadata: {
      createdAt: now.toISOString(),
      confidenceScore: 0.1,
      dataPoints: 0,
      sources: ["system fallback"],
      performanceMetrics: {
        totalTime: 0,
        stepTimes: {}
      }
    }
  };
}
