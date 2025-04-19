// /app/api/scenario-impact/route.ts

import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
// ───────────────────────────────────────────────────────────────────────────────
// 1️⃣ Define Zod schemas matching your SupplyChainImpactData shape
// ───────────────────────────────────────────────────────────────────────────────

const MetricSchema = z.object({
  day: z.number(),
  actual: z.number().nullable(),
  projected: z.number().optional(),
  level: z.number().optional(),
  output: z.number().optional(),
  inventory: z.number().optional(),
});

const NodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  statusDetail: z.string(),
  downtime: z.string(),
  outputDrop: z.string(),
  recovery: z.string(),
  riskScore: z.number(),
  x: z.number(),
  y: z.number(),
  dailyMetrics: z.array(MetricSchema).optional(),
});

const LinkSchema = z.object({
  source: z.string(),
  target: z.string(),
  value: z.number(),
});

const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  supplyChain: z.string(),
  affectedNode: z.string(),
  duration: z.string(),
  severity: z.string(),
  monteCarloRuns: z.number(),
  cascadingThreshold: z.string(),
  inventoryBuffer: z.string(),
  lastUpdated: z.string(),
});

const SupplyChainImpactDataSchema = z.object({
  scenario: ScenarioSchema,
  nodes: z.array(NodeSchema),
  links: z.array(LinkSchema),
  productionData: z.array(MetricSchema),
  inventoryData: z.array(MetricSchema),
});

// ───────────────────────────────────────────────────────────────────────────────
// 2️⃣ API handler: accepts POST with { simulationConfig, company_sitemap }
// ───────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    let supplyChains;

    try {
        // Use the existing supabaseServer client
        const supabase = supabaseServer;
    
        // Fetch users from the database
        console.log("Fetching users from database...");
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .limit(1);
          
        if (!users || users.length === 0) {
          return NextResponse.json({ error: "No users found in the database" }, { status: 404 });
        }
        
        const userData = users[0];
        console.log("Using user:", userData.id);
        console.log("userdata", userData);
        
        // Get the user's supply chains
        console.log("Fetching supply chains for user:", userData.id);
        const { data } = await supabase
          .from('supply_chains')
          .select('*')
          .eq('user_id', userData.id);
        
        if (!data || data.length === 0) {
          return NextResponse.json({ error: "No supply chains found for user" }, { status: 404 });
        }

        supplyChains = data;
    } catch (innerError) {
        console.error('❌ Inner Error:', innerError);
        return NextResponse.json(
          { error: 'Failed to fetch user or supply chain data.' },
          { status: 500 }
        );
    }


    const { simulationConfig} = await req.json();

    // Build a precise, instruction‐rich prompt
    const prompt = `
You are an expert supply chain simulation analyst.  
Using the inputs below, compute a full impact assessment:
- Disruption severity, duration, Monte Carlo runs, thresholds, buffers
- The complete company supply‐chain map with nodes, edges, inventories

▶️ Rules:
1. Apply disruption severity to the affected node’s daily output.
2. Deplete inventory buffer day‑by‑day; if input falls below failure threshold, mark node as failed.
3. Propagate failures downstream along edges; calculate output drops.
4. Recovery time = disruption duration + days until buffer / alternate routing restores flow.
5. Risk score = severity × node’s riskScore × (1 + #downstreamDependencies/10), clamped 0–100.
6. Generate daily productionData (actual vs projected) and inventoryData for the full horizon.
7. Assign (x,y) from the map for each node’s position.
8. Monte Carlo Runs: use as basis for a single “median” run—no need for multiple replicates in output.
9. Last updated: use current timestamp in “Today, HH:MM AM/PM” format.

▶️ Output:
Return a single JSON object matching this Zod schema exactly (no extra fields):

${SupplyChainImpactDataSchema.toString()}

Inputs:
SimulationConfig:
${JSON.stringify(simulationConfig, null, 2)}

CompanySitemap:
${JSON.stringify(supplyChains, null, 2)}
`.trim();

    // Invoke the LLM with structured output
    const { object: result } = await generateObject({
      model: google('gemini-1.5-flash', { useSearchGrounding: true }),
      schema: SupplyChainImpactDataSchema,
      prompt,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('❌ Scenario Impact Agent Error:', error);
    return NextResponse.json(
      { error: 'Failed to simulate supply chain impact.' },
      { status: 500 }
    );
  }
}
