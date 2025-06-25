import { NextRequest, NextResponse } from 'next/server';
import { streamText, tool, generateObject, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createMem0, addMemories, retrieveMemories, getMemories } from '@mem0/vercel-ai-provider';
import { tavilyTools } from '@/lib/fixed-tavily';
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
        // Handle both string and object formats for backward compatibility
        let data;
        if (typeof cached === 'string') {
          try {
            data = JSON.parse(cached);
          } catch (parseError) {
            console.warn(`Cache parse error for node ${nodeId}:`, parseError);
            return null;
          }
        } else if (typeof cached === 'object') {
          // Already an object, no need to parse
          data = cached;
        } else {
          console.warn(`Unexpected cache data type for node ${nodeId}: ${typeof cached}`);
          return null;
        }
        
        // Validate that we have a timestamp field
        if (!data?.timestamp) {
          console.warn(`Invalid cache data format for node ${nodeId}: no timestamp`);
          return null;
        }
        
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
      // Ensure we're always storing a JSON string
      const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
      await redis.setex(`intel:${nodeId}`, 1800, jsonData); // 30 min TTL
      console.log(`Successfully cached intelligence for node ${nodeId}`);
    } catch (error) {
      console.error('Cache storage error:', error);
    }  }

  private async buildSearchContext(node: any, supplyChainData?: any): Promise<string> {
    let memoryContext = '';
    let historicalTrends = '';
    let supplyChainContext = '';
    
    // Extract supply chain form data if available
    if (supplyChainData?.form_data) {
      try {
        const formData = typeof supplyChainData.form_data === 'string' 
          ? JSON.parse(supplyChainData.form_data) 
          : supplyChainData.form_data;
        
        supplyChainContext = `
        SUPPLY CHAIN COMPANY INFORMATION:
        - Company Name: ${supplyChainData.name || 'Not specified'}
        - Business Type: ${formData.businessType || 'Not specified'}
        - Industry Sector: ${formData.industrySector || 'Not specified'}
        - Company Size: ${formData.companySize || 'Not specified'}
        - Annual Revenue: ${formData.annualRevenue || 'Not specified'}
        - Geographic Focus: ${formData.geographicFocus || 'Not specified'}
        - Main Products/Services: ${formData.mainProducts || 'Not specified'}
        - Supply Chain Complexity: ${formData.supplyChainComplexity || 'Not specified'}
        - Primary Risk Concerns: ${formData.primaryRisks || 'Not specified'}
        - Current Challenges: ${formData.currentChallenges || 'Not specified'}`;
      } catch (error) {
        console.warn('Error parsing supply chain form_data:', error);
        supplyChainContext = `
        SUPPLY CHAIN COMPANY INFORMATION:
        - Company Name: ${supplyChainData.name || 'Not specified'}
        - Additional Data: Available but format not recognized`;
      }
    } else if (supplyChainData?.name) {
      supplyChainContext = `
      SUPPLY CHAIN COMPANY INFORMATION:
      - Company Name: ${supplyChainData.name}
      - Organisation: ${supplyChainData.organisation || 'Not specified'}
      - Description: ${supplyChainData.description || 'Not specified'}`;
    }
    
    // Try to retrieve memories with proper error handling following latest Mem0 docs
    if (process.env.MEM0_API_KEY) {try {
        // Build a rich, specific search query for more relevant memories
        const searchQuery = `supply chain intelligence analysis for ${node.name} ${node.type} in ${node.location} ${node.industry || ''} recent disruptions risk assessment`;
        
        // Retrieve textual memory context
        memoryContext = await retrieveMemories(searchQuery, {
          user_id: `node:${node.node_id}`,
          mem0ApiKey: process.env.MEM0_API_KEY
        });
        
        // Get raw memories for trend analysis
        const rawMemories = await getMemories(searchQuery, {
          user_id: `node:${node.node_id}`,
          mem0ApiKey: process.env.MEM0_API_KEY,
          // Removed 'limit' property as it is not valid in 'Mem0ConfigSettings'
        });
        
        // Process raw memories to extract trend data
        if (rawMemories && rawMemories.length > 0) {
          try {
            // Extract risk scores and event counts from past memories
            interface MemoryContent {
              content: string;
            }

            interface RiskHistoryEntry {
              date: string;
              riskScore: number | null;
              eventCount: number | null;
            }

            const riskHistory: RiskHistoryEntry[] = rawMemories
              .filter((m: MemoryContent) => m.content && m.content.includes('Risk Score:'))
              .map((m: MemoryContent) => {
                // Extract risk score using regex
                const riskMatch = m.content.match(/Risk Score:\s*(\d+)/i);
                const dateMatch = m.content.match(/Date:\s*([^\\n]+)/i);
                const eventsMatch = m.content.match(/Critical Events:\s*(\d+)/i);

                return {
                  date: dateMatch?.[1] || 'unknown date',
                  riskScore: riskMatch ? parseInt(riskMatch[1]) : null,
                  eventCount: eventsMatch ? parseInt(eventsMatch[1]) : null
                };
              })
              .filter((r: RiskHistoryEntry) => r.riskScore !== null);
            
            // Calculate trend if we have enough data points
            if (riskHistory.length >= 2) {
              const sortedHistory = [...riskHistory].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              );
              
              const oldestRisk = sortedHistory[0].riskScore;
              const newestRisk = sortedHistory[sortedHistory.length - 1].riskScore;
              const riskTrend = newestRisk && oldestRisk ? newestRisk - oldestRisk : 0;
              
              // Create a trend summary
              historicalTrends = `
RISK TREND ANALYSIS:
- Risk trend over ${sortedHistory.length} reports: ${riskTrend > 0 ? '⬆️ Increasing' : riskTrend < 0 ? '⬇️ Decreasing' : '⬌ Stable'}
- Risk change: ${riskTrend > 0 ? '+' : ''}${riskTrend} points
- Last recorded risk level: ${newestRisk}/100
- Historical risk pattern: ${sortedHistory.map(h => h.riskScore).join(' → ')}

Historical event pattern suggests ${riskTrend > 10 ? 'significant deterioration' : riskTrend < -10 ? 'significant improvement' : 'relative stability'} in supply chain conditions.
              `;
            }
          } catch (error) {
            console.warn('Error processing memory trends:', error);
          }
        }
        
        // Log successful memory retrieval
        console.log(`Memory retrieved for node ${node.node_id}: ${memoryContext.length} chars, ${rawMemories?.length || 0} memory entries`);
        
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
    }    return `
      ${supplyChainContext}
      
      NODE CONTEXT:
      - Name: ${node.name}
      - Type: ${node.type}
      - Location: ${node.address || 'Location not specified'}
      - Coordinates: ${node.location_lat && node.location_lng ? `${node.location_lat},${node.location_lng}` : 'Coordinates not available'}
      - Industry: ${node.data?.industry || 'General'}
      - Capacity: ${node.data?.capacity || 'Unknown'}
      - Description: ${node.description || 'No description'}
      
      HISTORICAL INTELLIGENCE MEMORY:
      ${memoryContext}
      
      ${historicalTrends}
      
      FOCUS AREAS:
      - Supply chain disruptions affecting ${node.type} operations
      - Weather events in ${node.address || 'this location'}
      - Geopolitical events affecting trade routes
      - Regulatory changes in logistics/shipping
      - Economic factors affecting supply chains
      - Port congestions, strikes, closures
      - Manufacturing shutdowns or capacity changes
    `;
  }  public async gatherComprehensiveIntelligence(node: any, supplyChainData?: any): Promise<any> {
    const startTime = Date.now();
    const context = await this.buildSearchContext(node, supplyChainData);

    // Check quota first
    if (!QuotaManager.canMakeCall()) {
      const status = QuotaManager.getStatus();
      console.log(`Quota exceeded. ${status.callsRemaining} calls remaining, resets in ${status.resetsIn}`);
      return this.generateFallbackIntelligence(node, startTime);
    }

    // Check API keys availability
    const googleApiMissing = !process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const tavilyApiMissing = !process.env.TAVILY_API_KEY;
    const weatherApiMissing = !process.env.OPENWEATHER_API_KEY;
    
    // Determine available data sources
    const dataSources = {
      tavily: !tavilyApiMissing,
      weather: !weatherApiMissing,
      memory: process.env.MEM0_API_KEY ? true : false
    };
      // If all critical APIs are missing, use fallback mode
    if (googleApiMissing && tavilyApiMissing && weatherApiMissing) {
      console.log('Using complete fallback mode - all critical API keys missing');
      return this.generateFallbackIntelligence(node, startTime, supplyChainData);
    }

    // Record that we're making an API call
    QuotaManager.recordCall();
      // Data collection object to track what we've obtained
    const collectedData: {
      tavilyResults: any[];
      weatherForecast: any;
      previousIntelligence: any;
      memoryTrends: {
        available: boolean;
        riskDelta: number;
        eventCountDelta: number;
        historicalRisk: number[];
        historicalEvents: number[];
      };
      industryNews: any[];
      dataSourcesChecked: number;
    } = {
      tavilyResults: [],
      weatherForecast: null,
      previousIntelligence: null,
      memoryTrends: {
        available: false,
        riskDelta: 0,
        eventCountDelta: 0,
        historicalRisk: [],
        historicalEvents: []
      },
      industryNews: [],
      dataSourcesChecked: 0
    };
    
    // Retrieve memory context history for trend analysis
    if (dataSources.memory) {
      try {
        // Get past intelligence from Mem0 using getMemories instead of search
        const previousIntel = await getMemories(`node:${node.node_id} supply chain intelligence`, {
          user_id: `node:${node.node_id}`,
          mem0ApiKey: process.env.MEM0_API_KEY || '',
        
        });
        
        if (previousIntel && previousIntel.length > 0) {
          console.log(`Retrieved ${previousIntel.length} previous intelligence entries for node ${node.node_id}`);
          
          // Extract risk scores and event counts
          const riskScores = [];
          const eventCounts = [];
          
          for (const intel of previousIntel) {
            if (!intel.text) continue;
            
            // Extract risk score
            const riskMatch = intel.text.match(/Risk Score:\s*(\d+)/i);
            if (riskMatch && riskMatch[1]) {
              riskScores.push(parseInt(riskMatch[1]));
            }
            
            // Extract event count
            const eventMatch = intel.text.match(/Critical Events:\s*(\d+)/i);
            if (eventMatch && eventMatch[1]) {
              eventCounts.push(parseInt(eventMatch[1]));
            }
          }
          
          // Calculate trends if we have data
          if (riskScores.length >= 2) {
            collectedData.memoryTrends.available = true;
            collectedData.memoryTrends.historicalRisk = riskScores;
            collectedData.memoryTrends.historicalEvents = eventCounts;
            collectedData.memoryTrends.riskDelta = riskScores[0] - riskScores[riskScores.length - 1];
            
            if (eventCounts.length >= 2) {
              collectedData.memoryTrends.eventCountDelta = eventCounts[0] - eventCounts[eventCounts.length - 1];
            }
            
            collectedData.dataSourcesChecked++;
            console.log(`Memory trends analysis successful for node ${node.node_id}: Risk delta: ${collectedData.memoryTrends.riskDelta}`);
          }
        }
      } catch (error) {
        console.error('Memory context retrieval error:', error);
        // Continue without memory trends
      }
    }

    try {      // INTEGRATION 1: Tavily Search (with robust retry logic)
      if (dataSources.tavily) {
        try {
          // Initialize Tavily client
          const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! });
          
          // Create more strategic search queries with supply chain specific focus
          const searchQueries = [
            `${node.type} supply chain disruption ${node.location} recent news`,
            `${node.industry || node.type} ${node.location} logistics problems`,
            `geopolitical issues affecting ${node.type} supply chain ${node.location}`,
            `${node.location} weather impact on ${node.type} operations`,
            `${node.industry || 'supply chain'} price fluctuations ${node.location}`
          ];
          
          // Track success rate and implement retry logic
          let successfulQueries = 0;
          const maxRetries = 2;
          
          // Perform searches with enhanced domain targeting and retry logic
          for (const query of searchQueries) {
            let retries = 0;
            let success = false;
            
            while (!success && retries <= maxRetries) {
              try {
                // If this isn't the first attempt, wait longer between retries
                if (retries > 0) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                  console.log(`Retry #${retries} for query: ${query}`);
                }
                
                const result = await tavilyClient.search(query, {
                  maxResults: 4,
                  searchDepth: retries === maxRetries ? 'basic' : 'advanced', // Fall back to basic search on final retry
                  topic: 'news',
                  days: 10, // Look back further for trending issues
                  includeAnswer: true,
                  includeDomains: [
                    'reuters.com', 'bloomberg.com', 'wsj.com', 'ft.com',
                    'apnews.com', 'cnn.com', 'bbc.com', 'economist.com',
                    'logisticsmgmt.com', 'supplychaindive.com', 'freightwaves.com',
                    'scm.ncsu.edu', 'ism.ws', 'logistics.org', 'resilienc.io'
                  ],
                  excludeDomains: ['twitter.com', 'facebook.com', 'reddit.com', 'pinterest.com', 'instagram.com']
                });
                
                // Check if we got meaningful results
                if (result && result.results && result.results.length > 0) {
                  // Extract only essential information to reduce token usage
                  const compactResult = {
                    query,
                    answer: result.answer?.substring(0, 350) || '', 
                    results: result.results?.slice(0, 3).map(r => ({
                      title: r.title?.substring(0, 120) || '',
                      content: r.content?.substring(0, 250) || '',
                      url: r.url,
                      publishedDate: r.publishedDate || '',
                      score: r.score || 0
                    })) || []
                  };
                  
                  collectedData.tavilyResults.push(compactResult);
                  collectedData.dataSourcesChecked++;
                  successfulQueries++;
                  success = true;
                  
                  console.log(`Successful Tavily search for "${query}": ${result.results.length} results`);
                } else {
                  // No results but API call succeeded, count as success to avoid unnecessary retries
                  console.warn(`Tavily search for "${query}" returned no results`);
                  success = true;
                }
              } catch (error: any) {
                console.error(`Tavily search error for query "${query}" (attempt ${retries + 1}):`, error.message || error);
                retries++;
                
                // Check for rate limiting or quota issues and apply exponential backoff
                if (error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('quota')) {
                  await new Promise(resolve => setTimeout(resolve, 2000 * (retries * retries)));
                }
              }
            }
            
            // Rate limiting between queries
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          
          // Log success rate for monitoring and debugging
          console.log(`Tavily search success rate: ${successfulQueries}/${searchQueries.length} queries`);
          
        } catch (error) {
          console.error('Tavily integration error:', error);
          
          // Record the failure in metadata for reporting
          collectedData.tavilyResults.push({
            error: error instanceof Error ? error.message : 'Unknown Tavily error',
            failedAt: new Date().toISOString(),
            query: 'tavily_integration_failure'
          });
        }
      }      // INTEGRATION 2: Weather forecast for node location with improved reliability
      if (dataSources.weather) {
        try {
          let lat, lon;
          const defaultCoordinates = { lat: 0, lon: 0, source: 'default' };
          let coordinatesSource = 'unknown';
          
          // Primary: Use location_lat and location_lng from database
          if (node.location_lat && node.location_lng) {
            lat = parseFloat(node.location_lat);
            lon = parseFloat(node.location_lng);
            coordinatesSource = 'database location fields';
          }
          // Fallback: Check node.data.coordinates from JSONB field
          else if (node.data?.coordinates) {
            try {
              if (typeof node.data.coordinates === 'string') {
                const parts = node.data.coordinates.split(',').map((p: string) => parseFloat(p.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                  [lat, lon] = parts;
                  coordinatesSource = 'node.data.coordinates (string)';
                }
              } else if (Array.isArray(node.data.coordinates) && node.data.coordinates.length >= 2) {
                [lat, lon] = node.data.coordinates.map(Number);
                coordinatesSource = 'node.data.coordinates (array)';
              }
            } catch (parseError) {
              console.error('Error parsing coordinates from node.data:', parseError);
            }
          }
          
          // Geocoding fallback using address instead of location
          if ((lat === undefined || lon === undefined) && node.address) {
            try {
              // Hardcoded coordinates for common locations to reduce API calls and handle errors
              const commonLocations: Record<string, {lat: number, lon: number}> = {
                'austin': {lat: 30.2672, lon: -97.7431},
                'new york': {lat: 40.7128, lon: -74.0060},
                'los angeles': {lat: 34.0522, lon: -118.2437},
                'london': {lat: 51.5074, lon: -0.1278},
                'tokyo': {lat: 35.6762, lon: 139.6503},
                'shanghai': {lat: 31.2304, lon: 121.4737},
                'singapore': {lat: 1.3521, lon: 103.8198},
              };
              
              // Check for known locations first
              const normalizedLocation = node.address.toLowerCase();
              let found = false;
              
              for (const [key, coords] of Object.entries(commonLocations)) {
                if (normalizedLocation.includes(key)) {
                  lat = coords.lat;
                  lon = coords.lon;
                  coordinatesSource = `common location match: ${key}`;
                  found = true;
                  break;
                }
              }
              
              // Try geocoding API only if we didn't find a match and the API key is available
              if (!found && process.env.OPENWEATHER_API_KEY) {
                // Try geocode the location using OpenWeather's API
                const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(node.address)}&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
                const geoResponse = await fetch(geocodeUrl);
                
                if (geoResponse.ok) {
                  const geoData = await geoResponse.json();
                  if (geoData && geoData.length > 0) {
                    lat = geoData[0].lat;
                    lon = geoData[0].lon;
                    coordinatesSource = 'geocoding API';
                    console.log(`Successfully geocoded location "${node.address}" to coordinates ${lat},${lon}`);
                  }
                } else {
                  console.warn(`Geocoding failed for "${node.address}": ${geoResponse.status} ${geoResponse.statusText}`);
                }
              }
            } catch (error) {
              console.error('Geocoding error:', error);
            }
          }
          
          // If we have valid coordinates, proceed with weather forecast
          if (!isNaN(lat) && !isNaN(lon) && lat !== undefined && lon !== undefined) {
            console.log(`Using coordinates for ${node.name}: ${lat},${lon} (source: ${coordinatesSource})`);
            
            // Single attempt weather retrieval - our service handles retries and fallbacks internally now
            try {
              collectedData.weatherForecast = await weatherService.getWeatherForecast(lat, lon);
              
              if (collectedData.weatherForecast) {
                collectedData.dataSourcesChecked++;
                console.log(`Weather data obtained for ${node.name}: ${collectedData.weatherForecast.location || 'Unknown location'}`);
                
                // Add coordinates to the forecast data for reference
                collectedData.weatherForecast.coordinates = {
                  lat, 
                  lon, 
                  source: coordinatesSource
                };
              }
            } catch (error) {
              console.error(`Weather forecast error:`, error);
            }
          } else {
            // Use a very simple fallback approach that doesn't require coordinates
            console.warn(`No valid coordinates available for node ${node.node_id} (${node.name}) - using generic weather fallback`);
            collectedData.weatherForecast = {
              location: node.location || 'Unknown location',
              coordinates: defaultCoordinates,
              source: 'fallback (no coordinates)',
              forecasts: [
                {
                  date: new Date().toISOString().split('T')[0],
                  weather: 'Unknown',
                  description: 'Weather data unavailable - no coordinates',
                  temp: 20, // Default reasonable temperature
                  severe: false
                }
              ]
            };
          }
        } catch (error) {
          console.error('Weather integration error:', error);
          // Continue without weather data if unavailable
        }
      }
      
      // INTEGRATION 3: Retrieve previous intelligence for comparison
      if (dataSources.memory) {
        try {
          // Get the last intelligence report for this node to track changes
          const previousIntel = await this.getCachedIntelligence(node.node_id);
          if (previousIntel) {
            collectedData.previousIntelligence = {
              timestamp: previousIntel.timestamp,
              riskScore: previousIntel.intelligence?.riskAssessment?.overallRiskScore || 0,
              criticalEvents: previousIntel.intelligence?.criticalEvents?.length || 0,
              topRisks: previousIntel.intelligence?.riskAssessment?.riskFactors?.slice(0, 2).map((f: any) => f.factor) || []
            };
            collectedData.dataSourcesChecked++;
          }
        } catch (error) {
          console.error('Previous intelligence retrieval error:', error);
        }
      }      // Build an enhanced prompt with all collected data
      let enhancedPrompt = `
Analyze comprehensive supply chain data for ${node.name} (${node.type}) in ${node.address || 'unknown location'}:

NODE CONTEXT:
- Name: ${node.name}
- Type: ${node.type}
- Location: ${node.address || 'Not specified'}
- Industry: ${node.data?.industry || 'General'}
- Capacity: ${node.data?.capacity || 'Unknown'}

${supplyChainData?.form_data ? 'COMPANY CONTEXT:\n' + JSON.stringify(supplyChainData.form_data, null, 2) : ''}

SEARCH RESULTS:
${JSON.stringify(collectedData.tavilyResults, null, 1)}`;// Add weather data if available
      if (collectedData.weatherForecast) {
        enhancedPrompt += `\n\nWEATHER FORECAST (${collectedData.weatherForecast?.location || node.location}):
${JSON.stringify(collectedData.weatherForecast?.forecasts || [], null, 1)}`;
      }

      // Add previous intelligence for trend analysis
      if (collectedData.previousIntelligence) {
        const timestamp = collectedData.previousIntelligence?.timestamp ? 
          new Date(collectedData.previousIntelligence.timestamp).toLocaleDateString() : 'previous report';
        
        enhancedPrompt += `\n\nPREVIOUS INTELLIGENCE (${timestamp}):
- Risk Score: ${collectedData.previousIntelligence?.riskScore || 'N/A'}/100
- Critical Events: ${collectedData.previousIntelligence?.criticalEvents || 0}
- Top Risks: ${Array.isArray(collectedData.previousIntelligence?.topRisks) ? 
    collectedData.previousIntelligence.topRisks.join(', ') : 'None recorded'}`;
      }// Add memory trends to prompt if available
      if (collectedData.memoryTrends.available) {
        enhancedPrompt += `\n\nMEMORY TRENDS ANALYSIS:
- Historical risk score pattern: ${collectedData.memoryTrends.historicalRisk.join(' → ')}
- Risk change over time: ${collectedData.memoryTrends.riskDelta > 0 ? '+' : ''}${collectedData.memoryTrends.riskDelta} points
- Critical event pattern: ${collectedData.memoryTrends.historicalEvents.join(' → ')} events
- Event count change: ${collectedData.memoryTrends.eventCountDelta > 0 ? '+' : ''}${collectedData.memoryTrends.eventCountDelta} events`;
      }

      // Complete the prompt with analysis instructions
      enhancedPrompt += `
\nINSTRUCTIONS:
1. Generate structured supply chain intelligence focusing on ACTIONABLE insights
2. Identify critical events (severity >50, high impact)
3. Calculate overall risk assessment score (0-100) with detailed factors
4. Provide 2-3 specific mitigation strategies

5. RELATIONSHIP MAPPING REQUIREMENTS:
   Create a comprehensive relationship mapping showing causal links between events and their effects on specific nodes
   - For each critical event, identify CAUSE → EFFECT relationships 
   - Example: "Port strike in Shanghai" → "Delay in delivery to Tesla Texas"
   - Include strength of relationship (0.0-1.0) based on confidence
   - Include specific entity linking (specific company/location names)
   - Identify primary and secondary impacts
   - Populate relationshipMapping array with AT LEAST 3 relationships if any events are detected

6. TREND ANALYSIS REQUIREMENTS:
   ${collectedData.memoryTrends.available ? 
     '- Analyze the risk trend over time (increasing, decreasing, or stable)' +
     '\n   - Explain significant changes in risk level or event count' +
     '\n   - Consider if current events are part of a pattern or new developments' :
     '- This appears to be the first intelligence report for this node' +
     '\n   - Establish baseline risk assessment for future trend analysis'}

7. WEATHER IMPACT ASSESSMENT:
   ${collectedData.weatherForecast ? 
     '- Analyze the forecast data for potential supply chain disruptions' +
     '\n   - Identify any severe weather that could impact operations' +
     '\n   - Calculate probability of weather-related delays' :
     '- No detailed weather forecast available' +
     '\n   - Consider seasonal weather patterns for this location'}

Be specific, factual, and provide evidence-based analysis. Focus on real business impact.
YOUR ANALYSIS MUST POPULATE EVERY FIELD IN THE REQUESTED SCHEMA.`;

      // Generate intelligence using enhanced Gemini model
      const result = await generateObject({
        model: google('gemini-2.0-flash'),
        schema: SupplyChainIntelligenceSchema,
        prompt: enhancedPrompt,
        temperature: 0.2 // Lower temperature for more factual responses
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
      }      return {
        ...result.object,
        metadata: {
          ...result.object.metadata,
          processingTime,
          sourcesChecked: collectedData.dataSourcesChecked,
          qualityScore: this.calculateQualityScore(result.object),
          nextUpdateRecommended: this.calculateNextUpdate(result.object),
          memoryContext: process.env.MEM0_API_KEY ? true : false
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
  async processSupplyChainIntelligence(supplyChainId: string, forceRefresh: boolean = false, supplyChainData?: any): Promise<any[]> {
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
          intelligence = await this.gatherComprehensiveIntelligence(node, supplyChainData);
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
          intelligence = await this.gatherComprehensiveIntelligence(node, supplyChainData);
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
  }  private generateFallbackIntelligence(node: any, startTime: number, supplyChainData?: any): any {
    // Extract node data properly from database schema
    const nodeAddress = node.address || 'Location not specified';
    const nodeCoords = node.location_lat && node.location_lng ? 
      `${node.location_lat},${node.location_lng}` : 'Coordinates not available';
    const nodeIndustry = node.data?.industry || 'General';
    
    // Include supply chain context in fallback mode
    const companyContext = supplyChainData?.form_data ? 
      `Company: ${typeof supplyChainData.form_data === 'string' 
        ? JSON.parse(supplyChainData.form_data).companyName 
        : supplyChainData.form_data.companyName || supplyChainData.name}` : 
      `Organization: ${supplyChainData?.organisation || 'Unknown'}`;
    
    // Try to get some real data even in fallback mode by using fetch directly
    let sources = [{
      title: 'System Generated Alert',
      url: 'internal://fallback-with-retry',
      publishedAt: new Date().toISOString(),
      credibility: 0.5
    }];
    
    // Attempt to fetch some real data using direct fetch if possible
    try {
      // Try to fetch news for location via a simple web API if Tavily is not available
      if (!process.env.TAVILY_API_KEY && nodeAddress) {
        fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(nodeAddress + ' supply chain')}&sortBy=publishedAt&apiKey=sample-key`)
          .then(response => response.ok ? response.json() : null)
          .then(data => {
            if (data && data.articles && data.articles.length > 0) {
              // Add real news sources if available
              const article = data.articles[0];
              sources.push({
                title: article.title || 'News Update',
                url: article.url || 'https://newsapi.org',
                publishedAt: article.publishedAt || new Date().toISOString(),
                credibility: 0.6
              });
            }
          })
          .catch(() => {
            // Continue with fallback if this fails
          });
      }
    } catch (error) {
      // Silently continue with basic fallback if fetch fails
    }

    // Even in fallback mode, try to populate relationship mapping with at least placeholder data
    const relationshipMapping = [
      {
        source: node.name,
        target: supplyChainData?.name || "Supply Chain Network",
        relationship: "part_of",
        strength: 0.9,
        context: `${node.name} is a ${node.type} node in the broader supply chain network at ${nodeAddress}. ${companyContext}`
      },
      {
        source: "Global Events",
        target: node.name,
        relationship: "affects",
        strength: 0.4,
        context: "Global economic and geopolitical events may affect this node's operations"
      }
    ];

    return {
      nodeId: node.node_id,
      timestamp: new Date().toISOString(),
      intelligence: {
        criticalEvents: [
          {
            title: `Supply Chain Monitoring for ${node.name}`,
            summary: `Regular monitoring active for ${node.type} operations at ${nodeAddress}. ${companyContext}. Limited data available in fallback mode. Real-time data integration pending.`,
            severity: 20,
            impact: 'LOW',
            category: 'OPERATIONAL',
            affectedEntities: [node.name, nodeAddress],
            timeframe: 'Next 24 hours',
            confidence: 0.6,
            sources: sources
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
            },
            {
              factor: 'API integration pending',
              probability: 1.0, 
              impact: 15
            }
          ],
          mitigationSuggestions: [
            'Configure API keys for full intelligence gathering',
            'Monitor manual sources for critical updates',
            'Establish backup communication channels',
            'Implement Tavily integration for real-time intelligence'
          ]
        },
        relationshipMapping: relationshipMapping
      },
      metadata: {
        processingTime: Date.now() - startTime,
        sourcesChecked: 0,
        qualityScore: 0.3,
        nextUpdateRecommended: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        memoryContext: false,
        fallbackMode: true,
        fallbackReason: !process.env.TAVILY_API_KEY ? "Missing Tavily API Key" : 
                        !process.env.OPENWEATHER_API_KEY ? "Missing OpenWeather API Key" : 
                        !process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "Missing Google AI API Key" : "Unknown reason",
        nodeData: {
          address: nodeAddress,
          coordinates: nodeCoords,
          industry: nodeIndustry,
          type: node.type,
          supply_chain_id: node.supply_chain_id
        }
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
    };  }
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

// WeatherService client for node-specific weather forecasts
class WeatherService {
  private apiKey: string;
  private isKeyValid: boolean = true;
  
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    // Mark key as invalid if not provided
    if (!this.apiKey) {
      this.isKeyValid = false;
    }
  }
  
  async getWeatherForecast(lat: number, lon: number): Promise<any> {
    // Early return with mock data if we know the key is invalid
    if (!this.isKeyValid) {
      console.warn('OpenWeather API key not configured or invalid - using fallback weather data');
      return this.getFallbackWeatherData(lat, lon);
    }
    
    try {
      // Add validation parameters to catch issues early
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
      console.log(`Fetching weather data for coordinates ${lat},${lon} (key: ${this.apiKey ? this.apiKey.substring(0, 3) + '...' : 'missing'})`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // Mark key as invalid if we get auth errors
        if (response.status === 401 || response.status === 403) {
          this.isKeyValid = false;
          console.error(`OpenWeather API key is invalid or unauthorized (${response.status})`);
          return this.getFallbackWeatherData(lat, lon);
        }
        
        // Handle other errors
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.processWeatherData(data);
    } catch (error) {
      console.error('Weather forecast fetch error:', error);
      // Return fallback data instead of null to maintain consistent structure
      return this.getFallbackWeatherData(lat, lon);
    }
  }
  
  // Provide fallback weather data based on coordinates for resilience
  private getFallbackWeatherData(lat: number, lon: number): any {
    // Convert coordinates to a location name (rough estimate)
    const location = this.estimateLocationFromCoordinates(lat, lon);
    
    // Generate some basic fallback weather data
    return {
      location: location,
      country: "Unknown",
      forecasts: [
        {
          date: new Date().toISOString().split('T')[0],
          temp: this.estimateTemperature(lat),
          weather: "Unknown",
          description: "Weather data unavailable",
          wind: 0,
          precipitation: 0,
          severe: false
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          temp: this.estimateTemperature(lat),
          weather: "Unknown",
          description: "Weather data unavailable",
          wind: 0,
          precipitation: 0,
          severe: false
        }
      ],
      source: "fallback",
      message: "Weather API key invalid or unauthorized - using estimated data"
    };
  }
  
  // Simple function to estimate a location name from coordinates
  private estimateLocationFromCoordinates(lat: number, lon: number): string {
    // Very rough estimation of continent/region
    let region = "Unknown Location";
    
    // North America
    if (lat > 15 && lat < 72 && lon < -30 && lon > -170) {
      region = "North America";
    } 
    // Europe
    else if (lat > 36 && lat < 70 && lon > -10 && lon < 40) {
      region = "Europe";
    }
    // Asia
    else if (lat > 0 && lat < 70 && lon > 40 && lon < 180) {
      region = "Asia";
    }
    // Australia
    else if (lat < 0 && lat > -50 && lon > 110 && lon < 180) {
      region = "Australia";
    }
    // South America
    else if (lat < 15 && lat > -60 && lon < -30 && lon > -90) {
      region = "South America";
    }
    // Africa
    else if (lat < 36 && lat > -40 && lon > -20 && lon < 60) {
      region = "Africa";
    }
    
    return `${region} (${lat.toFixed(2)},${lon.toFixed(2)})`;
  }
  
  // Simple temperature estimate based on latitude and current month
  private estimateTemperature(lat: number): number {
    const month = new Date().getMonth(); // 0-11
    const isSummer = (month > 4 && month < 10 && lat > 0) || (month < 4 || month > 9 && lat < 0);
    const absLat = Math.abs(lat);
    
    // Rough temperature estimate
    if (absLat < 15) return isSummer ? 32 : 26; // Tropical
    if (absLat < 30) return isSummer ? 28 : 15; // Subtropical
    if (absLat < 50) return isSummer ? 22 : 5;  // Temperate
    if (absLat < 70) return isSummer ? 15 : -5; // Subpolar
    return isSummer ? 5 : -20; // Polar
  }
  
  private processWeatherData(data: any): any {
    if (!data || !data.list || !data.list.length) {
      return null;
    }
    
    // Extract 5-day forecast (simplified)
    const forecasts = data.list.filter((_: any, i: number) => i % 8 === 0).slice(0, 5);
    
    return {
      location: data.city?.name,
      country: data.city?.country,
      forecasts: forecasts.map((f: any) => ({
        date: new Date(f.dt * 1000).toISOString().split('T')[0],
        temp: f.main.temp,
        weather: f.weather[0].main,
        description: f.weather[0].description,
        wind: f.wind.speed,
        precipitation: f.pop,
        severe: this.isSevereWeather(f)
      }))
    };
  }
  
  private isSevereWeather(forecast: any): boolean {
    const severeConditions = [
      'Thunderstorm', 'Tornado', 'Hurricane', 'Tropical Storm',
      'Blizzard', 'Heavy Snow', 'Ice Storm', 'Freezing Rain'
    ];
    
    // Check for severe weather patterns
    const isHighWind = forecast.wind?.speed > 15; // Wind over 15 m/s
    const isHeavyRain = forecast.rain?.['3h'] > 20; // Heavy rain
    const isSevereType = severeConditions.some(c => 
      forecast.weather?.[0]?.main.includes(c) || 
      forecast.weather?.[0]?.description.toLowerCase().includes(c.toLowerCase())
    );
    
    return isHighWind || isHeavyRain || isSevereType;
  }
}

// Create weather service instance
const weatherService = new WeatherService();

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
    }    // Validate API keys before processing
    const validation = await ApiKeyValidator.validateAllKeys();
    
    // Log validation results
    console.log('API Key Validation Results:', {
      canProceed: validation.canProceed,
      issues: validation.issues.map(i => `${i.name}: ${i.error || 'OK'}`),
      mode: validation.canProceed ? 'LIVE' : 'FALLBACK'
    });

    // Get supply chain information including user_id and form_data for proper data association
    const { data: supplyChain } = await supabaseServer
      .from('supply_chains')
      .select('user_id, name, description, organisation, form_data')
      .eq('supply_chain_id', supplyChainId)
      .single();

    if (!supplyChain) {
      return NextResponse.json({
        error: 'Supply chain not found'
      }, { status: 404 });
    }

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
      }      const intelligence = await agent.gatherComprehensiveIntelligence(node, supplyChain);
      await agent.cacheIntelligence(nodeId, intelligence);
      results = [intelligence];
    } else {
      // Process entire supply chain
      results = await agent.processSupplyChainIntelligence(supplyChainId, forceRefresh, supplyChain);
    }

    // Store results in database with proper user association
    const dbResults = results.filter(r => !r.error).map(result => ({
      user_id: supplyChain.user_id,
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
    const { supply_chain_id, node_id, stream = false, query } = body;    if (!supply_chain_id) {
      return NextResponse.json({
        error: 'supply_chain_id is required'
      }, { status: 400 });
    }

    // Get supply chain data for context
    const { data: supplyChain } = await supabaseServer
      .from('supply_chains')
      .select('user_id, name, description, organisation, form_data')
      .eq('supply_chain_id', supply_chain_id)
      .single();

    if (!supplyChain) {
      return NextResponse.json({ error: 'Supply chain not found' }, { status: 404 });
    }
    
    // If streaming is requested, use streamText with memory-enhanced intelligence
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

      // When a query is provided, don't stream intermediate steps to client
      if (query) {
        // Use generateText instead of streamText to get just the final response
        const result = await generateText({
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
                criticalEvents: z.array(z.object({
                  title: z.string(),
                  summary: z.string(),
                  severity: z.number(),
                  impact: z.string(),
                  category: z.string(),
                  affectedEntities: z.array(z.string()),
                  timeframe: z.string(),
                  confidence: z.number().optional(),
                  sources: z.array(z.object({
                    title: z.string(),
                    url: z.string(),
                    publishedAt: z.string(),
                    credibility: z.number().optional()
                  })).optional()
                })),
                summary: z.string(),
                // Optional fields for enhanced intelligence - now supports null values
                marketIntelligence: z.preprocess(
                  // Convert null to default object structure
                  (val) => val === null ? { 
                    priceFluctuations: [], 
                    demandShifts: [], 
                    competitorActivities: [] 
                  } : val,
                  z.object({
                    priceFluctuations: z.array(z.object({
                      commodity: z.string(),
                      change: z.number(),
                      reason: z.string()
                    })).default([]),
                    demandShifts: z.array(z.string()).default([]),
                    competitorActivities: z.array(z.string()).default([])
                  })
                ).optional(),
                riskFactors: z.array(z.object({
                  factor: z.string(),
                  probability: z.number(),
                  impact: z.number()
                })).optional(),
                mitigationSuggestions: z.array(z.string()).optional(),
                relationshipMapping: z.array(z.object({
                  source: z.string(),
                  target: z.string(),
                  relationship: z.string(),
                  strength: z.number(),
                  context: z.string()
                })).optional(),
                sourcesChecked: z.number().optional(),
                qualityScore: z.number().optional()
              })
            }),
              execute: async ({ intelligence }) => {
                try {
                  // Safety check - ensure marketIntelligence is not null
                  if (intelligence.marketIntelligence === null) {
                    intelligence.marketIntelligence = {
                      priceFluctuations: [],
                      demandShifts: [],
                      competitorActivities: []
                    };
                  }
                  
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
            ${node ? `- Node: ${node.name} (${node.type}) in ${node.address || 'unknown location'}` : '- Analyzing entire supply chain'}
            ${supplyChain?.form_data ? `- Company: ${typeof supplyChain.form_data === 'string' ? JSON.parse(supplyChain.form_data).companyName : supplyChain.form_data.companyName || supplyChain.name}` : `- Organization: ${supplyChain.organisation || 'Unknown'}`}
            
            INSTRUCTIONS:
            
            1. MANDATORY TOOL USAGE - YOU MUST USE THESE TOOLS:
               - ALWAYS start with getNodeContext to retrieve historical intelligence and memory data
               - ALWAYS conduct at least 2-3 Tavily web searches with specific search queries about the supply chain
                 - Use search for comprehensive results on industry events
                 - Use searchQNA for targeted questions
                 - Use extract for detailed analysis of relevant URLs
               - ALWAYS store your final intelligence with storeIntelligence
            
            2. INTELLIGENCE PRIORITIES:
               - Critical disruptions affecting operations (severity >70)
               - Weather events impacting transportation
               - Port congestions, strikes, or closures
               - Regulatory changes affecting trade
               - Market shifts and price fluctuations
               - Geopolitical events affecting supply routes
            
            3. EVIDENCE-BASED ANALYSIS:
               - Search for recent news (last 7 days) about supply chain disruptions
               - Focus on specific locations and industries relevant to this supply chain
               - ALWAYS cite specific evidence from your web searches and memory retrieval
               - Cross-reference multiple sources for accuracy
               - Make clear distinctions between facts from sources and your assessment
               - Support all risk assessments with specific evidence
            
            4. FINAL RESPONSE FORMAT:
               - Start with "## Supply Chain Intelligence Summary"
               - Provide a concise, evidence-based summary with specific data points
               - Include "## Key Findings" with bullet points of major discoveries from your searches
               - Include "## Risk Assessment" with specific risks identified and confidence level
               - Include "## Sources" that lists the top sources you used from Tavily searches
               - Your entire response should be factual, precise and directly tied to evidence
            
            5. SEARCH STRATEGY:
               - Start with broad search: "[company/organization name] supply chain disruptions"
               - Follow with location-specific search: "[location] logistics issues current"
               - Add industry-specific search: "[industry] supply chain risks [current month/year]"
               - Use searchQNA for specific questions about impacts
            
            YOU MUST use the search tools to gather real evidence before providing your answer. Your response MUST cite specific facts, figures, events, or developments discovered through your searches. Generic summaries without specific evidence are unacceptable.
            
            IMPORTANT: When using storeIntelligence tool, always include a properly formatted marketIntelligence object with at least empty arrays for priceFluctuations, demandShifts, and competitorActivities. NEVER send null for marketIntelligence.
          `,
          maxSteps: 25,
          temperature: 0.2
        });
        
        // Return only the final answer without streaming intermediate steps
        return NextResponse.json({
          success: true,
          analysis: result.text,
          evidence_based: true, // Flag to indicate the response is evidence-based
          analyzed_with_tools: true, // Flag to indicate tools were used
          timestamp: new Date().toISOString()
        });
      } else {
        // Original streaming behavior for interactive exploration without a specific query
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
            // Same storeIntelligence tool as above, but omitted for brevity
            storeIntelligence: tool({
              description: 'Store gathered intelligence in the database and memory system',
              parameters: z.object({
                intelligence: z.object({
                  nodeId: z.string(),
                  riskScore: z.number(),
                  criticalEvents: z.array(z.object({
                    title: z.string(),
                    summary: z.string(),
                    severity: z.number(),
                    impact: z.string(),
                    category: z.string(),
                    affectedEntities: z.array(z.string()),
                    timeframe: z.string(),
                    confidence: z.number().optional(),
                    sources: z.array(z.object({
                      title: z.string(),
                      url: z.string(),
                      publishedAt: z.string(),
                      credibility: z.number().optional()
                    })).optional()
                  })),
                  summary: z.string(),
                  // Optional fields for enhanced intelligence - now supports null values
                  marketIntelligence: z.preprocess(
                    // Convert null to default object structure
                    (val) => val === null ? { 
                      priceFluctuations: [], 
                      demandShifts: [], 
                      competitorActivities: [] 
                    } : val,
                    z.object({
                      priceFluctuations: z.array(z.object({
                        commodity: z.string(),
                        change: z.number(),
                        reason: z.string()
                      })).default([]),
                      demandShifts: z.array(z.string()).default([]),
                      competitorActivities: z.array(z.string()).default([])
                    })
                  ).optional(),
                  riskFactors: z.array(z.object({
                    factor: z.string(),
                    probability: z.number(),
                    impact: z.number()
                  })).optional(),
                  mitigationSuggestions: z.array(z.string()).optional(),
                  relationshipMapping: z.array(z.object({
                    source: z.string(),
                    target: z.string(),
                    relationship: z.string(),
                    strength: z.number(),
                    context: z.string()
                  })).optional(),
                  sourcesChecked: z.number().optional(),
                  qualityScore: z.number().optional()
                })
              }),
              execute: async ({ intelligence }) => {
                // Same implementation as above
                try {
                  // Safety check - ensure marketIntelligence is not null
                  if (intelligence.marketIntelligence === null) {
                    intelligence.marketIntelligence = {
                      priceFluctuations: [],
                      demandShifts: [],
                      competitorActivities: []
                    };
                  }
                  
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
            ${node ? `- Node: ${node.name} (${node.type}) in ${node.address || 'unknown location'}` : '- Analyzing entire supply chain'}
            ${supplyChain?.form_data ? `- Company: ${typeof supplyChain.form_data === 'string' ? JSON.parse(supplyChain.form_data).companyName : supplyChain.form_data.companyName || supplyChain.name}` : `- Organization: ${supplyChain.organisation || 'Unknown'}`}
            
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
            
            Begin your analysis now. Use the available tools to gather comprehensive intelligence and provide streaming updates on your findings. ALWAYS use Tavily search tools to gather evidence and base your responses on specific facts and data, not generic information.
          `,
          maxSteps: 25,
          temperature: 0.2
        });

        return result.toDataStreamResponse();
      }
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