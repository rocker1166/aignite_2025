import { NextRequest, NextResponse } from 'next/server';
import { streamText, tool, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createMem0, addMemories, retrieveMemories, getMemories } from '@mem0/vercel-ai-provider';
import { tavilyTools } from '@/lib/tavily';
import { tavily } from '@tavily/core';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';

// Initialize Redis for caching
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

// Initialize Mem0 with proper configuration following latest docs
const mem0 = createMem0({
  provider: 'google',
  mem0ApiKey: process.env.MEM0_API_KEY || '',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  config: {
    compatibility: 'strict',
  }
});

// Mem0 configuration constants
const MEM0_CONFIG = {
  user_id: 'supply-chain-agent', // Default user ID
  org_id: process.env.MEM0_ORG_ID || '',
  project_id: process.env.MEM0_PROJECT_ID || '',
  app_id: 'intellisupply-agent',
  agent_id: 'supply-chain-intel-agent',
  run_id: `run-${Date.now()}` // Generate a unique run ID
};

// Enhanced Intelligence Schema
const SupplyChainIntelligenceSchema = z.object({
  nodeId: z.string(),
  timestamp: z.string(),
  intelligence: z.object({
    criticalEvents: z.array(z.object({
      title: z.string().describe('Clear event title'),
      summary: z.string().describe('2-3 sentence summary'),
      severity: z.number().min(0).max(100).describe('Risk severity score 0-100'),
      impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      category: z.enum(['WEATHER', 'GEOPOLITICAL', 'OPERATIONAL', 'REGULATORY', 'ECONOMIC', 'SECURITY']),
      affectedEntities: z.array(z.string()).describe('Companies, ports, regions affected'),
      timeframe: z.string().describe('When this will impact operations'),
      confidence: z.number().min(0).max(1).describe('Confidence in this intelligence'),
      sources: z.array(z.object({
        title: z.string(),
        url: z.string(),
        publishedAt: z.string(),
        credibility: z.number().min(0).max(1)
      }))
    })),
    marketIntelligence: z.object({
      priceFluctuations: z.array(z.object({
        commodity: z.string(),
        change: z.number(),
        reason: z.string()
      })),
      demandShifts: z.array(z.string()),
      competitorActivities: z.array(z.string())
    }),
    riskAssessment: z.object({
      overallRiskScore: z.number().min(0).max(100),
      riskFactors: z.array(z.object({
        factor: z.string(),
        probability: z.number().min(0).max(1),
        impact: z.number().min(0).max(100)
      })),
      mitigationSuggestions: z.array(z.string())
    }),
    relationshipMapping: z.array(z.object({
      source: z.string(),
      target: z.string(),
      relationship: z.string(),
      strength: z.number().min(0).max(1),
      context: z.string()
    }))
  }),
  metadata: z.object({
    processingTime: z.number(),
    sourcesChecked: z.number(),
    qualityScore: z.number().min(0).max(1),
    nextUpdateRecommended: z.string(),
    memoryContext: z.boolean()
  })
});

class ProductionIntelligenceAgent {

  constructor() {
    // Agent is now initialized with proper Mem0 and Tavily integration
  }

  public async getCachedIntelligence(nodeId: string): Promise<any | null> {
    try {
      const cached = await redis.get(`intel:${nodeId}`);
      if (cached) {
        const data = JSON.parse(cached as string);
        const age = Date.now() - new Date(data.timestamp).getTime();
        // Return cached data if less than 30 minutes old
        if (age < 30 * 60 * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  public async cacheIntelligence(nodeId: string, data: any): Promise<void> {
    try {
      await redis.setex(`intel:${nodeId}`, 1800, JSON.stringify(data)); // 30 min TTL
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }  private async buildSearchContext(node: any): Promise<string> {
    let memoryContext = '';
    
    // Try to retrieve memories with proper error handling following latest Mem0 docs
    if (process.env.MEM0_API_KEY) {      try {
        const searchQuery = `supply chain intelligence for ${node.name} ${node.type} in ${node.location}`;
        
        // Simplify Mem0 API parameters as per latest docs
        memoryContext = await retrieveMemories(searchQuery, {
          user_id: `node:${node.node_id}`,
          mem0ApiKey: process.env.MEM0_API_KEY
        });
        
        // Log successful memory retrieval
        console.log(`Memory retrieved for node ${node.node_id}: ${memoryContext.length} chars`);
        
      } catch (error: any) {
        console.warn('Mem0 memory retrieval failed:', {
          nodeId: node.node_id,
          error: error.message,
          status: error.status || 'unknown'
        });
        
        // Provide specific error context based on error type
        if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
          memoryContext = 'Memory service authentication failed - check MEM0_API_KEY configuration.';
        } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
          memoryContext = 'Memory service quota exceeded - upgrade Mem0 plan or try again later.';
        } else {
          memoryContext = `Memory service temporarily unavailable: ${error.message}`;
        }
      }
    } else {
      console.warn('MEM0_API_KEY not configured, skipping memory retrieval');
      memoryContext = 'Memory service not configured - historical context unavailable.';
    }

    return `
      Node Context:
      - Name: ${node.name}
      - Type: ${node.type}
      - Location: ${node.location}
      - Industry: ${node.industry || 'General'}
      - Coordinates: ${node.coordinates}
      - Capacity: ${node.capacity || 'Unknown'}
      
      Historical Intelligence Memory:
      ${memoryContext}
      
      Focus Areas:
      - Supply chain disruptions affecting ${node.type} operations
      - Weather events in ${node.location}
      - Geopolitical events affecting trade routes
      - Regulatory changes in logistics/shipping
      - Economic factors affecting supply chains
      - Port congestions, strikes, closures
      - Manufacturing shutdowns or capacity changes
    `;
  }public async gatherComprehensiveIntelligence(node: any): Promise<any> {
    const startTime = Date.now();
    const context = await this.buildSearchContext(node);

    // Check quota first
    if (!QuotaManager.canMakeCall()) {
      const status = QuotaManager.getStatus();
      console.log(`Quota exceeded. ${status.callsRemaining} calls remaining, resets in ${status.resetsIn}`);
      return this.generateFallbackIntelligence(node, startTime);
    }

    // Check if we should use fallback mode (no API calls)
    const useFallback = !process.env.GOOGLE_GENERATIVE_AI_API_KEY || !process.env.TAVILY_API_KEY;
    
    if (useFallback) {
      console.log('Using fallback mode - missing API keys');
      return this.generateFallbackIntelligence(node, startTime);
    }

    // Record that we're making an API call
    QuotaManager.recordCall();

    // Initialize Tavily client
    const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! });try {
      // Optimize search queries - reduce from 4 to 2 most critical
      const searchQueries = [
        `supply chain disruption ${node.location} ${node.type} recent news`,
        `port congestion weather impact ${node.location} logistics`
      ];

      const searchResults = [];
      
      // Perform searches with reduced data
      for (const query of searchQueries) {
        try {
          const result = await tavilyClient.search(query, {
            maxResults: 3, // Reduced from 5 to 3
            searchDepth: 'basic', // Changed from 'advanced' to 'basic'
            topic: 'news',
            days: 7,
            includeAnswer: true,
            includeDomains: [
              'reuters.com', 'bloomberg.com', 'wsj.com', 'ft.com',
              'apnews.com', 'cnn.com', 'bbc.com'
            ],
            excludeDomains: ['twitter.com', 'facebook.com', 'reddit.com']
          });
            // Extract only essential information to reduce token usage
          const compactResult = {
            query,
            answer: result.answer?.substring(0, 300) || '', // Limit to 300 chars
            results: result.results?.slice(0, 2).map(r => ({
              title: r.title?.substring(0, 100) || '',
              content: r.content?.substring(0, 200) || '', // Limit content
              url: r.url,
              publishedDate: r.publishedDate || ''
            })) || []
          };
          
          searchResults.push(compactResult);
        } catch (error) {
          console.error(`Search error for query "${query}":`, error);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
      }      // Compact context to reduce token usage
      const compactContext = `
Node: ${node.name} (${node.type}) in ${node.location}
Memory: ${context.substring(0, 200)}...
      `;

      // Simplified prompt to reduce tokens
      const result = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: SupplyChainIntelligenceSchema,
        prompt: `
Analyze these supply chain search results for ${node.name} (${node.type}) in ${node.location}:

${JSON.stringify(searchResults, null, 1)}

Generate structured intelligence focusing on:
1. Critical events (severity >50, high impact)
2. Risk assessment (overall score 0-100)
3. 2-3 key mitigation suggestions

Be concise and focus only on actionable intelligence.
        `
      });

      const processingTime = Date.now() - startTime;        // Add new intelligence to memory for future context using latest Mem0 patterns
      if (process.env.MEM0_API_KEY) {
        try {
          // Format memory data according to Mem0 best practices
          const memoryMessages = [{
            role: 'user' as const,
            content: [{ 
              type: 'text' as const, 
              text: `Supply chain intelligence update for ${node.name} (${node.type}) in ${node.location}:
              
Risk Score: ${result.object.intelligence.riskAssessment.overallRiskScore}/100
Critical Events: ${result.object.intelligence.criticalEvents.length}
Key Risks: ${result.object.intelligence.riskAssessment.riskFactors.map(r => r.factor).join(', ')}
Quality Score: ${this.calculateQualityScore(result.object)}

Critical Events Summary:
${result.object.intelligence.criticalEvents.map(event => 
  `- ${event.title} (${event.impact}): ${event.summary}`
).join('\n')}

Generated at: ${new Date().toISOString()}` 
            }]
          }];          // Simplify Mem0 API call with minimal required parameters
          await addMemories(memoryMessages, {
            user_id: `node:${node.node_id}`,
            mem0ApiKey: process.env.MEM0_API_KEY
          });
          
          console.log(`Successfully stored memory for node ${node.node_id}`);
          
        } catch (error: any) {
          console.warn('Failed to store memories:', {
            nodeId: node.node_id,
            error: error.message,
            status: error.status || 'unknown'
          });
          
          // Don't fail the entire operation if memory storage fails
        }
      }

      return {
        ...result.object,
        metadata: {
          ...result.object.metadata,
          processingTime,
          sourcesChecked: searchResults.length,
          qualityScore: this.calculateQualityScore(result.object),
          nextUpdateRecommended: this.calculateNextUpdate(result.object),
          memoryContext: true
        }
      };

    } catch (error) {
      console.error('Intelligence gathering error:', error);
      throw new Error(`Failed to gather intelligence for node ${node.node_id}: ${error}`);
    }
  }

  private calculateQualityScore(intelligence: any): number {
    let score = 0;
    const events = intelligence.intelligence.criticalEvents;
    
    if (!events || events.length === 0) return 0;
    
    // Source credibility
    const avgCredibility = events.reduce((sum: number, event: any) => {
      return sum + event.sources.reduce((s: number, source: any) => s + source.credibility, 0) / event.sources.length;
    }, 0) / events.length;
    
    // Confidence levels
    const avgConfidence = events.reduce((sum: number, event: any) => sum + event.confidence, 0) / events.length;
    
    // Source diversity
    const uniqueSources = new Set(events.flatMap((e: any) => e.sources.map((s: any) => s.url))).size;
    const sourceDiversity = Math.min(uniqueSources / 10, 1);
    
    // Event relevance (critical events score higher)
    const criticalEventsRatio = events.filter((e: any) => e.impact === 'CRITICAL').length / events.length;
    
    score = (avgCredibility * 0.3 + avgConfidence * 0.3 + sourceDiversity * 0.2 + criticalEventsRatio * 0.2);
    return Math.round(score * 100) / 100;
  }

  private calculateNextUpdate(intelligence: any): string {
    const riskScore = intelligence.intelligence.riskAssessment.overallRiskScore;
    const criticalEvents = intelligence.intelligence.criticalEvents.filter((e: any) => e.impact === 'CRITICAL').length;
    
    if (riskScore > 80 || criticalEvents > 0) {
      return new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    } else if (riskScore > 60) {
      return new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    } else {
      return new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours
    }
  }

  async processSupplyChainIntelligence(supplyChainId: string, forceRefresh: boolean = false): Promise<any[]> {
    const results = [];
    
    // Get all nodes for this supply chain
    const { data: nodes, error } = await supabaseServer
      .from('nodes')
      .select('*')
      .eq('supply_chain_id', supplyChainId);

    if (error) throw error;
    if (!nodes?.length) return [];

    // Process nodes with intelligent prioritization
    const highPriorityNodes = nodes.filter(n => 
      ['port', 'factory', 'warehouse'].includes(n.type?.toLowerCase() || '')
    );
    const regularNodes = nodes.filter(n => 
      !['port', 'factory', 'warehouse'].includes(n.type?.toLowerCase() || '')
    );

    // Process high-priority nodes first
    for (const node of highPriorityNodes) {
      try {
        // Check cache first unless force refresh
        let intelligence = !forceRefresh ? await this.getCachedIntelligence(node.node_id) : null;
        
        if (!intelligence) {
          intelligence = await this.gatherComprehensiveIntelligence(node);
          await this.cacheIntelligence(node.node_id, intelligence);
        }
        
        results.push(intelligence);
        
        // Rate limiting between calls
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error processing high-priority node ${node.node_id}:`, error);
        results.push({
          nodeId: node.node_id,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Process regular nodes
    for (const node of regularNodes) {
      try {
        let intelligence = !forceRefresh ? await this.getCachedIntelligence(node.node_id) : null;
        
        if (!intelligence) {
          intelligence = await this.gatherComprehensiveIntelligence(node);
          await this.cacheIntelligence(node.node_id, intelligence);
        }
        
        results.push(intelligence);
        
        // Longer delay for regular nodes
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`Error processing regular node ${node.node_id}:`, error);
        results.push({
          nodeId: node.node_id,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }
  async getNodeMemories(nodeId: string): Promise<any[]> {
    if (!process.env.MEM0_API_KEY) {
      console.warn('MEM0_API_KEY not configured for memory retrieval');
      return [];
    }

    try {      // Simplify getMemories call with only required parameters
      const memories = await getMemories(`node:${nodeId}`, {
        user_id: `node:${nodeId}`,
        mem0ApiKey: process.env.MEM0_API_KEY
      });
      
      console.log(`Retrieved ${memories.length} memories for node ${nodeId}`);
      return memories;
      
    } catch (error: any) {
      console.error('Error retrieving memories:', {
        nodeId,
        error: error.message,
        status: error.status || 'unknown'
      });
      
      // Return empty array instead of throwing to maintain API stability
      return [];
    }
  }

  private generateFallbackIntelligence(node: any, startTime: number): any {
    return {
      nodeId: node.node_id,
      timestamp: new Date().toISOString(),
      intelligence: {
        criticalEvents: [
          {
            title: `Supply Chain Monitoring for ${node.name}`,
            summary: `Regular monitoring active for ${node.type} operations in ${node.location}. No critical issues detected in fallback mode.`,
            severity: 20,
            impact: 'LOW',
            category: 'OPERATIONAL',
            affectedEntities: [node.name],
            timeframe: 'Next 24 hours',
            confidence: 0.6,
            sources: [
              {
                title: 'System Generated Alert',
                url: 'internal://fallback-mode',
                publishedAt: new Date().toISOString(),
                credibility: 0.5
              }
            ]
          }
        ],
        marketIntelligence: {
          priceFluctuations: [],
          demandShifts: ['Normal operations expected'],
          competitorActivities: ['Monitoring in progress']
        },
        riskAssessment: {
          overallRiskScore: 25,
          riskFactors: [
            {
              factor: 'Limited intelligence gathering',
              probability: 1.0,
              impact: 20
            }
          ],
          mitigationSuggestions: [
            'Configure API keys for full intelligence gathering',
            'Monitor manual sources for critical updates',
            'Establish backup communication channels'
          ]
        },
        relationshipMapping: []
      },
      metadata: {
        processingTime: Date.now() - startTime,
        sourcesChecked: 0,
        qualityScore: 0.3,
        nextUpdateRecommended: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        memoryContext: false
      }
    };
  }
  async storeStructuredMemory(node: any, intelligenceData: any): Promise<boolean> {
    if (!process.env.MEM0_API_KEY) {
      return false;
    }
    
    try {
      // Create a structured memory with clear hierarchical organization
      const eventsSummary = intelligenceData.intelligence.criticalEvents
        .map((e: any) => `- ${e.title} (${e.impact}, ${e.severity}/100): ${e.summary}`)
        .join('\n');
      
      const riskFactors = intelligenceData.intelligence.riskAssessment.riskFactors
        .map((r: any) => `- ${r.factor}: Impact ${r.impact}/100, Probability ${Math.round(r.probability * 100)}%`)
        .join('\n');
      
      const mitigation = intelligenceData.intelligence.riskAssessment.mitigationSuggestions
        .map((m: any) => `- ${m}`)
        .join('\n');
      
      // Create message with structured intelligence
      const memoryMessages = [{
        role: 'user' as const,
        content: [{ 
          type: 'text' as const, 
          text: `## Supply Chain Intelligence Report: ${node.name}
Date: ${new Date().toISOString()}
Node: ${node.name} (${node.type}) in ${node.location}
Risk Score: ${intelligenceData.intelligence.riskAssessment.overallRiskScore}/100
Quality Score: ${intelligenceData.metadata.qualityScore}

### Critical Events
${eventsSummary || 'No critical events detected'}

### Risk Factors
${riskFactors || 'No significant risk factors identified'}

### Recommended Mitigation
${mitigation || 'No specific mitigation required at this time'}

### Market Intelligence
Price Fluctuations: ${intelligenceData.intelligence.marketIntelligence.priceFluctuations.length} detected
Demand Shifts: ${intelligenceData.intelligence.marketIntelligence.demandShifts.join(', ') || 'None detected'}
` 
          }]
      }];      // Simplify addMemories call with minimal required parameters
      await addMemories(memoryMessages, {
        user_id: `node:${node.node_id}`,
        mem0ApiKey: process.env.MEM0_API_KEY,
        run_id: `intel-${Date.now()}` // Keep the run_id as it's useful for tracking
      });
      
      console.log(`Successfully stored structured memory for node ${node.node_id}`);
      return true;
    } catch (error: any) {
      console.warn('Failed to store structured memory:', {
        nodeId: node.node_id,
        error: error.message,
        status: error.status || 'unknown'
      });
      return false;
    }
  }
}

// Quota Manager Class
class QuotaManager {
  private static callCount = 0;
  private static lastReset = Date.now();
  private static readonly MAX_CALLS_PER_HOUR = 5; // Limit to 5 calls per hour
  
  static canMakeCall(): boolean {
    const now = Date.now();
    const hoursSinceReset = (now - this.lastReset) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 1) {
      this.callCount = 0;
      this.lastReset = now;
    }
    
    return this.callCount < this.MAX_CALLS_PER_HOUR;
  }
  
  static recordCall(): void {
    this.callCount++;
  }
  
  static getStatus(): { callsRemaining: number; resetsIn: string } {
    const now = Date.now();
    const minutesUntilReset = Math.ceil(60 - ((now - this.lastReset) / (1000 * 60)));
    
    return {
      callsRemaining: Math.max(0, this.MAX_CALLS_PER_HOUR - this.callCount),
      resetsIn: `${minutesUntilReset} minutes`
    };
  }
}

// API Key Validation System
interface ApiKeyStatus {
  name: string;
  isValid: boolean;
  isConfigured: boolean;
  error?: string;
  details?: string;
}

interface ValidationResult {
  allValid: boolean;
  canProceed: boolean;
  issues: ApiKeyStatus[];
  recommendations: string[];
}

class ApiKeyValidator {
  
  static async validateAllKeys(): Promise<ValidationResult> {
    const results: ApiKeyStatus[] = [];
    
    // Validate Google Gemini API Key
    const geminiStatus = await this.validateGeminiKey();
    results.push(geminiStatus);
    
    // Validate Tavily API Key
    const tavilyStatus = await this.validateTavilyKey();
    results.push(tavilyStatus);
    
    // Validate Mem0 API Key (optional)
    const mem0Status = await this.validateMem0Key();
    results.push(mem0Status);
    
    // Validate Redis Keys (optional)
    const redisStatus = await this.validateRedisKeys();
    results.push(redisStatus);
    
    // Validate Supabase Keys
    const supabaseStatus = await this.validateSupabaseKeys();
    results.push(supabaseStatus);
    
    const allValid = results.every(r => r.isValid);
    const criticalServices = results.filter(r => 
      ['Google Gemini', 'Tavily', 'Supabase'].includes(r.name)
    );
    const canProceed = criticalServices.every(r => r.isValid);
    
    const recommendations = this.generateRecommendations(results);
    
    return {
      allValid,
      canProceed,
      issues: results.filter(r => !r.isValid),
      recommendations
    };
  }
  
  // Public method to validate just the Mem0 key
  static async validateMem0ApiKey(): Promise<ApiKeyStatus> {
    return this.validateMem0Key();
  }
  
  private static async validateGeminiKey(): Promise<ApiKeyStatus> {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    
    if (!key) {
      return {
        name: 'Google Gemini',
        isValid: false,
        isConfigured: false,
        error: 'API key not configured',
        details: 'GOOGLE_GENERATIVE_AI_API_KEY environment variable is missing'
      };
    }
    
    try {
      // Test Gemini API with minimal request
      const testModel = google('gemini-2.0-flash');
      const testResult = await generateObject({
        model: testModel,
        schema: z.object({ test: z.string() }),
        prompt: 'Return {"test": "ok"}'
      });
      
      return {
        name: 'Google Gemini',
        isValid: true,
        isConfigured: true,
        details: 'API key validated successfully'
      };
    } catch (error) {
      let errorDetails = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          errorDetails = 'API quota exceeded - upgrade your plan or wait for quota reset';
        } else if (error.message.includes('invalid')) {
          errorDetails = 'Invalid API key - check your Google AI Studio credentials';
        } else if (error.message.includes('permission')) {
          errorDetails = 'Permission denied - ensure API is enabled in Google Cloud';
        } else {
          errorDetails = error.message;
        }
      }
      
      return {
        name: 'Google Gemini',
        isValid: false,
        isConfigured: true,
        error: 'API validation failed',
        details: errorDetails
      };
    }
  }
  
  private static async validateTavilyKey(): Promise<ApiKeyStatus> {
    const key = process.env.TAVILY_API_KEY;
    
    if (!key) {
      return {
        name: 'Tavily',
        isValid: false,
        isConfigured: false,
        error: 'API key not configured',
        details: 'TAVILY_API_KEY environment variable is missing'
      };
    }
    
    try {
      // Test Tavily API with minimal search
      const tavilyClient = tavily({ apiKey: key });
      const testResult = await tavilyClient.search('test', {
        maxResults: 1,
        searchDepth: 'basic'
      });
      
      return {
        name: 'Tavily',
        isValid: true,
        isConfigured: true,
        details: 'API key validated successfully'
      };
    } catch (error) {
      let errorDetails = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorDetails = 'Invalid API key - check your Tavily dashboard credentials';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
          errorDetails = 'API quota exceeded - upgrade your Tavily plan';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorDetails = 'Network error - check internet connection';
        } else {
          errorDetails = error.message;
        }
      }
      
      return {
        name: 'Tavily',
        isValid: false,
        isConfigured: true,
        error: 'API validation failed',
        details: errorDetails
      };
    }
  }
  private static async validateMem0Key(): Promise<ApiKeyStatus> {
    const key = process.env.MEM0_API_KEY;
    
    if (!key) {
      return {
        name: 'Mem0 (Optional)',
        isValid: true, // Optional service
        isConfigured: false,
        details: 'Memory features disabled - MEM0_API_KEY not configured'
      };
    }
    
    try {
      // Test Mem0 API with minimal request using minimal parameters
      // Following the latest docs, we'll simplify the validation call
      const testMemories = await retrieveMemories('health check test', {
        user_id: 'health-check',
        mem0ApiKey: key
      });
      
      // If we get here, the API key is valid
      return {
        name: 'Mem0 (Optional)',
        isValid: true,
        isConfigured: true,
        details: `Memory features enabled - API key validated successfully`
      };
    } catch (error: any) {
      let errorDetails = 'Unknown error';
      
      // Better error handling with specific messages
      if (error.message?.includes('401') || error.message?.includes('unauthorized') || error.message?.includes('Authentication')) {
        errorDetails = 'Invalid API key - Obtain a valid key from https://app.mem0.ai/dashboard/api-keys';
      } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
        errorDetails = 'API quota exceeded - upgrade your Mem0 plan';
      } else if (error.message?.includes('project') || error.message?.includes('organization')) {
        errorDetails = 'Invalid org_id or project_id - these are optional, try without them';
      } else {
        errorDetails = error.message;
      }
      
      console.error('Mem0 validation error:', {
        message: error.message,
        stack: error.stack,
        details: errorDetails
      });
      
      return {
        name: 'Mem0 (Optional)',
        isValid: false,
        isConfigured: true,
        error: 'Memory service unavailable',
        details: `Memory features disabled: ${errorDetails}`
      };
    }
  }
  
  private static async validateRedisKeys(): Promise<ApiKeyStatus> {
    const url = process.env.UPSTASH_REDIS_URL;
    const token = process.env.UPSTASH_REDIS_TOKEN;
    
    if (!url || !token) {
      return {
        name: 'Redis Cache (Optional)',
        isValid: true, // Optional service
        isConfigured: false,
        details: 'Caching disabled - Redis credentials not configured'
      };
    }
    
    try {
      // Test Redis connection
      const testRedis = new Redis({ url, token });
      await testRedis.set('test-key', 'test-value', { ex: 1 });
      await testRedis.del('test-key');
      
      return {
        name: 'Redis Cache (Optional)',
        isValid: true,
        isConfigured: true,
        details: 'Caching enabled - Redis connection validated'
      };
    } catch (error) {
      let errorDetails = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('authentication')) {
          errorDetails = 'Invalid credentials - check your Upstash Redis token';
        } else if (error.message.includes('network')) {
          errorDetails = 'Network error - check Redis URL and connectivity';
        } else {
          errorDetails = error.message;
        }
      }
      
      return {
        name: 'Redis Cache (Optional)',
        isValid: false,
        isConfigured: true,
        error: 'Cache service unavailable',
        details: `Caching disabled: ${errorDetails}`
      };
    }
  }
  
  private static async validateSupabaseKeys(): Promise<ApiKeyStatus> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      return {
        name: 'Supabase',
        isValid: false,
        isConfigured: false,
        error: 'Database credentials not configured',
        details: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing'
      };
    }
    
    try {
      // Test Supabase connection
      const { data, error } = await supabaseServer
        .from('supply_chains')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      return {
        name: 'Supabase',
        isValid: true,
        isConfigured: true,
        details: 'Database connection validated successfully'
      };
    } catch (error) {
      let errorDetails = 'Unknown error';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid API key')) {
          errorDetails = 'Invalid API key - check your Supabase project credentials';
        } else if (error.message.includes('not found')) {
          errorDetails = 'Database table not found - run migrations first';
        } else {
          errorDetails = error.message;
        }
      }
      
      return {
        name: 'Supabase',
        isValid: false,
        isConfigured: true,
        error: 'Database validation failed',
        details: errorDetails
      };
    }
  }
  
  private static generateRecommendations(results: ApiKeyStatus[]): string[] {
    const recommendations: string[] = [];
    
    const invalidServices = results.filter(r => !r.isValid);
    
    if (invalidServices.some(s => s.name === 'Google Gemini')) {
      recommendations.push('Configure GOOGLE_GENERATIVE_AI_API_KEY for AI analysis features');
    }
    
    if (invalidServices.some(s => s.name === 'Tavily')) {
      recommendations.push('Configure TAVILY_API_KEY for real-time intelligence gathering');
    }
    
    if (invalidServices.some(s => s.name === 'Supabase')) {
      recommendations.push('Configure Supabase credentials for data persistence');
    }
    
    if (invalidServices.some(s => s.name.includes('Mem0'))) {
      recommendations.push('Configure MEM0_API_KEY for enhanced memory features (optional)');
    }
    
    if (invalidServices.some(s => s.name.includes('Redis'))) {
      recommendations.push('Configure Redis credentials for improved performance (optional)');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All services configured correctly!');
    }
    
    return recommendations;
  }
}

// API Route Handler
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const url = new URL(request.url);
    const supplyChainId = url.searchParams.get('supply_chain_id');
    const nodeId = url.searchParams.get('node_id');
    const forceRefresh = url.searchParams.get('force_refresh') === 'true';
    const getMemories = url.searchParams.get('get_memories') === 'true';
    const healthCheck = url.searchParams.get('health') === 'true';

    // Health check endpoint
    if (healthCheck) {
      const validation = await ApiKeyValidator.validateAllKeys();
      
      return NextResponse.json({
        status: validation.canProceed ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          allValid: validation.allValid,
          canProceed: validation.canProceed,
          issues: validation.issues,
          recommendations: validation.recommendations
        },
        quota: QuotaManager.getStatus(),
        processingTime: Date.now() - startTime
      });
    }

    if (!supplyChainId) {
      return NextResponse.json({
        error: 'supply_chain_id parameter is required'
      }, { status: 400 });
    }

    // Validate API keys before processing
    const validation = await ApiKeyValidator.validateAllKeys();
    
    // Log validation results
    console.log('API Key Validation Results:', {
      canProceed: validation.canProceed,
      issues: validation.issues.map(i => `${i.name}: ${i.error || 'OK'}`),
      mode: validation.canProceed ? 'LIVE' : 'FALLBACK'
    });

    const agent = new ProductionIntelligenceAgent();

    // Handle memory retrieval request
    if (getMemories && nodeId) {
      const memories = await agent.getNodeMemories(nodeId);
      return NextResponse.json({
        success: true,
        nodeId,
        memories,
        count: memories.length
      });
    }

    let results;

    if (nodeId) {
      // Process single node
      const { data: node } = await supabaseServer
        .from('nodes')
        .select('*')
        .eq('node_id', nodeId)
        .eq('supply_chain_id', supplyChainId)
        .single();

      if (!node) {
        return NextResponse.json({ error: 'Node not found' }, { status: 404 });
      }

      if (!forceRefresh) {
        const cached = await agent.getCachedIntelligence(nodeId);
        if (cached) {
          return NextResponse.json({
            success: true,
            cached: true,
            data: [cached],
            processingTime: Date.now() - startTime
          });
        }
      }

      const intelligence = await agent.gatherComprehensiveIntelligence(node);
      await agent.cacheIntelligence(nodeId, intelligence);
      results = [intelligence];
    } else {
      // Process entire supply chain
      results = await agent.processSupplyChainIntelligence(supplyChainId, forceRefresh);
    }

    // Store results in database
    const dbResults = results.filter(r => !r.error).map(result => ({
      supply_chain_id: supplyChainId,
      node_id: result.nodeId,
      intelligence_data: result,
      risk_score: result.intelligence?.riskAssessment?.overallRiskScore || 0,
      quality_score: result.metadata?.qualityScore || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    if (dbResults.length > 0) {
      await supabaseServer
        .from('supply_chain_intel')
        .upsert(dbResults, { 
          onConflict: 'supply_chain_id,node_id',
          ignoreDuplicates: false 
        });
    }

    const summary = {
      totalNodes: results.length,
      successfulNodes: results.filter(r => !r.error).length,
      failedNodes: results.filter(r => r.error).length,
      averageRiskScore: results
        .filter(r => !r.error && r.intelligence?.riskAssessment?.overallRiskScore)
        .reduce((sum, r) => sum + r.intelligence.riskAssessment.overallRiskScore, 0) / 
        results.filter(r => !r.error && r.intelligence?.riskAssessment?.overallRiskScore).length || 0,
      criticalEvents: results
        .filter(r => !r.error)
        .reduce((sum, r) => sum + (r.intelligence?.criticalEvents?.filter((e: any) => e.impact === 'CRITICAL').length || 0), 0),
      memoryEnhanced: results.filter(r => r.metadata?.memoryContext).length
    };    return NextResponse.json({
      success: true,
      data: results,
      summary,
      apiValidation: {
        canProceed: validation.canProceed,
        mode: validation.canProceed ? 'LIVE' : 'FALLBACK',
        issues: validation.issues,
        recommendations: validation.recommendations
      },
      quota: QuotaManager.getStatus(),
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Intelligence API error:', error);
    return NextResponse.json({
      error: 'Intelligence gathering failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supply_chain_id, node_id, stream = false, query } = body;

    if (!supply_chain_id) {
      return NextResponse.json({
        error: 'supply_chain_id is required'
      }, { status: 400 });
    }    // If streaming is requested, use streamText with memory-enhanced intelligence
    if (stream) {
      // Get node information
      const { data: node } = await supabaseServer
        .from('nodes')
        .select('*')
        .eq('node_id', node_id)
        .eq('supply_chain_id', supply_chain_id)
        .single();

      if (!node && node_id) {
        return NextResponse.json({ error: 'Node not found' }, { status: 404 });
      }
        // Validate Mem0 key configuration before proceeding
      const apiKeyStatus = await ApiKeyValidator.validateMem0ApiKey();
      const memoryEnabled = apiKeyStatus.isValid && apiKeyStatus.isConfigured;
      
      // Get Tavily tools for real-time search
      const tavily = tavilyTools({ apiKey: process.env.TAVILY_API_KEY! });
        // Streaming with Mem0-enhanced intelligence - simplified config
      const streamingModel = memoryEnabled
        ? mem0('gemini-2.0-flash', {
            user_id: `node:${node_id || 'chain'}`
          })
        : google('gemini-2.0-flash');
      
      console.log(`Using streaming model with memory: ${memoryEnabled ? 'enabled' : 'disabled'}`);

      const result = streamText({
        model: streamingModel,
        tools: {
          ...tavily,
          getNodeContext: tool({
            description: 'Get supply chain node context and historical intelligence',
            parameters: z.object({
              nodeId: z.string().describe('The node ID to get context for')
            }),
            execute: async ({ nodeId }) => {
              const agent = new ProductionIntelligenceAgent();
              const cached = await agent.getCachedIntelligence(nodeId);
              
              // Use proper Mem0 API with error handling
              let memories = [];
              if (memoryEnabled) {
                try {
                  memories = await agent.getNodeMemories(nodeId);
                } catch (error) {
                  console.error('Memory retrieval failed in streaming context:', error);
                }
              }
              
              return {
                cached: cached ? 'Recent intelligence available' : 'No recent intelligence',
                memories: memories.slice(0, 5), // Last 5 memories
                nodeInfo: node,
                memoryStatus: memoryEnabled ? 'enabled' : 'disabled'
              };
            }
          }),
            storeIntelligence: tool({
            description: 'Store gathered intelligence in the database and memory system',
            parameters: z.object({              intelligence: z.object({
                nodeId: z.string(),
                riskScore: z.number(),
                criticalEvents: z.array(z.any()),
                summary: z.string(),
                // Optional fields for enhanced intelligence
                marketIntelligence: z.object({
                  priceFluctuations: z.array(z.any()),
                  demandShifts: z.array(z.string()),
                  competitorActivities: z.array(z.string())
                }).optional(),
                riskFactors: z.array(z.any()).optional(),
                mitigationSuggestions: z.array(z.string()).optional(),
                relationshipMapping: z.array(z.any()).optional(),
                sourcesChecked: z.number().optional(),
                qualityScore: z.number().optional()
              })
            }),
            execute: async ({ intelligence }) => {
              try {
                const agent = new ProductionIntelligenceAgent();
                
                // Format the intelligence data in our expected structure
                const formattedIntelligence = {
                  nodeId: intelligence.nodeId,
                  timestamp: new Date().toISOString(),
                  intelligence: {
                    criticalEvents: intelligence.criticalEvents.map((e: any) => ({
                      ...e,
                      confidence: e.confidence || 0.8,
                      sources: e.sources || [{ 
                        title: 'Agent Generated',
                        url: 'internal://streaming',
                        publishedAt: new Date().toISOString(),
                        credibility: 0.7
                      }]
                    })),
                    marketIntelligence: intelligence.marketIntelligence || {
                      priceFluctuations: [],
                      demandShifts: [],
                      competitorActivities: []
                    },
                    riskAssessment: {
                      overallRiskScore: intelligence.riskScore,
                      riskFactors: intelligence.riskFactors || [],
                      mitigationSuggestions: intelligence.mitigationSuggestions || []
                    },
                    relationshipMapping: intelligence.relationshipMapping || []
                  },
                  metadata: {
                    processingTime: 0,
                    sourcesChecked: intelligence.sourcesChecked || 0,
                    qualityScore: intelligence.qualityScore || 0.8,
                    nextUpdateRecommended: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                    memoryContext: memoryEnabled
                  }
                };
                
                // Store in database
                await supabaseServer
                  .from('supply_chain_intel')
                  .upsert({
                    supply_chain_id,
                    node_id: intelligence.nodeId,
                    intelligence_data: formattedIntelligence,
                    risk_score: intelligence.riskScore,
                    quality_score: formattedIntelligence.metadata.qualityScore,
                    created_at: formattedIntelligence.timestamp,
                    updated_at: formattedIntelligence.timestamp
                  }, { 
                    onConflict: 'supply_chain_id,node_id',
                    ignoreDuplicates: false 
                  });
                
                // Store in memory if enabled
                let memoryStored = false;
                if (memoryEnabled && node) {
                  memoryStored = await agent.storeStructuredMemory(node, formattedIntelligence);
                }
                
                // Cache intelligence 
                await agent.cacheIntelligence(intelligence.nodeId, formattedIntelligence);
                
                return { 
                  success: true, 
                  message: 'Intelligence stored successfully',
                  memoryStored: memoryStored,
                  timestamp: formattedIntelligence.timestamp
                };
              } catch (error) {
                console.error('Intelligence storage error:', error);
                return { 
                  success: false, 
                  error: error instanceof Error ? error.message : 'Storage failed',
                  memoryStored: false
                };
              }
            }
          })
        },
        prompt: `
          You are an advanced AI supply chain intelligence analyst with real-time access to web search and memory systems. 
          
          Current Task: ${query || 'Gather comprehensive supply chain intelligence'}
          
          Supply Chain Context:
          - Supply Chain ID: ${supply_chain_id}
          ${node ? `- Node: ${node.name} (${node.type}) in ${node.location}` : '- Analyzing entire supply chain'}
          
          INSTRUCTIONS:
          
          1. USE TOOLS STRATEGICALLY:
             - Start with getNodeContext to understand historical patterns
             - Use search tools to find current events and disruptions
             - Use searchQNA for specific questions about supply chain impacts
             - Use storeIntelligence to save important findings
          
          2. INTELLIGENCE PRIORITIES:
             - Critical disruptions affecting operations (severity >70)
             - Weather events impacting transportation
             - Port congestions, strikes, or closures
             - Regulatory changes affecting trade
             - Market shifts and price fluctuations
             - Geopolitical events affecting supply routes
          
          3. ANALYSIS APPROACH:
             - Search for recent news (last 7 days) about supply chain disruptions
             - Focus on specific locations and industries relevant to this supply chain
             - Cross-reference multiple sources for accuracy
             - Assess probability and impact of identified risks
             - Provide actionable recommendations
          
          4. COMMUNICATION STYLE:
             - Stream your analysis in real-time as you gather information
             - Explain your reasoning and search strategy
             - Highlight critical findings immediately
             - Provide confidence levels for your assessments
             - Summarize key takeaways at the end
          
          5. SEARCH STRATEGY:
             - Use domain-specific searches for different types of intelligence
             - Search news sites for breaking developments
             - Search logistics sites for industry-specific issues
             - Search government sites for regulatory changes
             - Search weather services for environmental impacts
          
          Begin your analysis now. Use the available tools to gather comprehensive intelligence and provide streaming updates on your findings.
        `,
        maxSteps: 15,
        temperature: 0.3
      });

      return result.toDataStreamResponse();
    }

    // Non-streaming fallback - use existing GET logic
    const params = new URLSearchParams({
      supply_chain_id,
      force_refresh: 'false'
    });

    if (node_id) {
      params.append('node_id', node_id);
    }

    const response = await fetch(`${request.url}?${params}`, {
      method: 'GET',
      headers: request.headers
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });

  } catch (error) {
    console.error('POST Intelligence API error:', error);
    return NextResponse.json({
      error: 'Failed to process intelligence request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}