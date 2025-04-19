import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// ✅ Supply chain declared ABOVE the handler
const supplyChainData ={
    "organization": {
      "organizationName": "Global Manufacturing Corp.",
      "description": "Global Manufacturing Corp. is a vertically integrated consumer electronics company specializing in design, assembly, and global distribution of smartphones, laptops, and wearable devices.",
      "employeesCount": 4500,
      "industry": "Consumer Electronics",
      "industryDetail": "Design, manufacturing, assembly, and distribution of consumer electronic devices.",
      "moreInfo": {
        "headquarters": "500 Innovation Drive, Silicon Valley, CA 94043",
        "website": "https://www.globalmanufacturing.com",
        "contactEmail": "corporate@globalmanufacturing.com",
        "contactPhone": "+1-650-555-0100"
      }
    },
    "supplyChain": {
      "id": "default-chain",
      "nodes": [
        {
          "id": "supplier-1",
          "type": "supplierNode",
          "data": {
            "label": "Supplier A",
            "description": "Supplies high-grade industrial raw materials including steel and plastic components to manufacturers across North America.",
            "type": "Supplier",
            "capacity": 1000,
            "leadTime": 14,
            "riskScore": 0.2,
            "moreInfo": {
              "website": "https://www.apexrawmaterials.com",
              "contactEmail": "info@apexrawmaterials.com",
              "contactPhone": "+1-310-555-1234"
            },
            "location": {
              "lat": 34.052,
              "lng": -118.243
            },
            "address": "123 Supplier St, Los Angeles, CA 90001"
          },
          "position": {
            "x": 250,
            "y": 100
          },
          "width": 150,
          "height": 43,
          "selected": true,
          "dragging": false
        },
        {
          "id": "factory-1",
          "type": "factoryNode",
          "data": {
            "label": "Factory B",
            "description": "Operates a state-of-the-art manufacturing plant specializing in the assembly of automotive and aerospace components using advanced robotics and lean production methodologies.",
            "type": "Factory",
            "capacity": 800,
            "leadTime": 5,
            "riskScore": 0.1,
            "moreInfo": {
              "website": "https://www.metropolisassembly.com",
              "contactEmail": "contact@metropolisassembly.com",
              "contactPhone": "+1-212-555-5678"
            },
            "location": {
              "lat": 40.712,
              "lng": -74.006
            },
            "address": "456 Factory Ave, New York, NY 10001"
          },
          "position": {
            "x": 450,
            "y": 200
          },
          "width": 150,
          "height": 43,
          "selected": false,
          "dragging": false
        },
        {
          "id": "port-1",
          "type": "portNode",
          "data": {
            "label": "Port C",
            "description": "Operates a major maritime logistics hub handling container and bulk cargo with extensive intermodal transfer capabilities.",
            "type": "Port",
            "capacity": 5000,
            "leadTime": 3,
            "riskScore": 0.4,
            "moreInfo": {
              "website": "https://www.goldengateshipping.com",
              "contactEmail": "service@goldengateshipping.com",
              "contactPhone": "+1-415-555-7890"
            },
            "location": {
              "lat": 37.774,
              "lng": -122.419
            },
            "address": "789 Port Blvd, San Francisco, CA 94111"
          },
          "position": {
            "x": 650,
            "y": 100
          },
          "width": 150,
          "height": 43,
          "selected": false,
          "dragging": false
        }
      ],
      "edges": [
        {
          "id": "e1-2",
          "source": "supplier-1",
          "target": "factory-1",
          "data": {
            "mode": "rail",
            "cost": 200,
            "transitTime": 5,
            "riskMultiplier": 1.2
          }
        },
        {
          "id": "e2-3",
          "source": "factory-1",
          "target": "port-1",
          "data": {
            "mode": "road",
            "cost": 150,
            "transitTime": 2,
            "riskMultiplier": 1
          }
        }
      ],
      "connections": [
        {
          "sourceId": "supplier-1",
          "targetId": "factory-1",
          "sourceLabel": "Supplier A",
          "targetLabel": "Factory B",
          "mode": "rail",
          "cost": 200,
          "transitTime": 5,
          "riskMultiplier": 1.2
        },
        {
          "sourceId": "factory-1",
          "targetId": "port-1",
          "sourceLabel": "Factory B",
          "targetLabel": "Port C",
          "mode": "road",
          "cost": 150,
          "transitTime": 2,
          "riskMultiplier": 1
        }
      ],
      "timestamp": "2025-04-19T16:09:13.653Z"
    }
  }

// Enhanced schema: array of node intel objects
const NodeIntelSchema = z.object({
  nodeId: z.string(),
  news: z.array(z.object({
    summary: z.string().describe("Concise news summary, include key metrics"),
    time: z.string().describe("ISO timestamp of the news"),
    originCountry: z.string(),
    numericalData: z.array(z.string()).optional().describe("Important numbers/statistics, if any")
  })).describe("Top 3 most important news items"),
  weather: z.object({
    summary: z.string().describe("Concise weather summary"),
    time: z.string().describe("ISO timestamp of the weather report"),
    originCountry: z.string(),
    details: z.array(z.string()).optional().describe("Additional weather details")
  }).describe("Latest weather report")
});

const intelSchema = z.array(NodeIntelSchema);

// Single call to collect all node intel in bulk
async function getAllNodeIntel() {
  const prompt = `
  Today’s date is ${new Date().toISOString()}. the news should be latest and contain only the most lastest  information. of today date only. 2025 news ans weathear only.
You are a Supply Chain Disruption Intelligence Agent. You will be given a list of nodes (suppliers, factories, ports, warehouses, etc.) with their IDs, types, locations, and attributes. For each node, you must:

1. Retrieve the three most critical news items from the past 24 hours that could disrupt or materially impact that node’s operations. Focus on:
   • Natural disaster alerts (storms, floods, earthquakes)  
   • Extreme weather forecasts (heatwaves, heavy precipitation, high winds)  
   • Geopolitical developments (trade embargoes, sanctions, labor strikes, civil unrest)  
   • Regulatory or policy changes affecting logistics or imports/exports  
   • Major operational disruptions (port congestions, carrier delays, factory shutdowns)  
   For each news item, return:
     – summary: a 1–2 sentence concise description  
     – time: ISO 8601 timestamp of publication or event  
     –originCountry: country of the event  
     –numericalData (optional): any key metrics (e.g. “–20% output,” “500 containers delayed”)  

2. Fetch the very latest weather forecast or advisory for the node’s exact location. Emphasize conditions that may affect supply chain resilience (e.g., severe storms, temperature extremes, precipitation, wind). Return:
     – summary: brief overview of current or imminent conditions  
     – time: ISO 8601 timestamp of the forecast/report  
     – originCountry: country or region  
     – details (optional): additional observations (e.g. “heavy rainfall 50 mm in 24 h,” “gusts up to 80 km/h”)  

 Only output a JSON array of objects matching the schema exactly—no extra commentary, no markdown—so it can be ingested directly by downstream systems.  


Supply chain context:
${JSON.stringify(supplyChainData, )}

Return a JSON array matching this schema exactly without extra commentary.
`;

  const { object } = await generateObject({
    model: google('gemini-1.5-flash', { useSearchGrounding: true }),
    schema: intelSchema,
    prompt
  });

  return object;
}

// ✅ API Handler
export async function GET() {
  try {
    const results = await getAllNodeIntel();
    return NextResponse.json({ results });
  } catch (error) {
    console.error("AI agent error:", error);
    return NextResponse.json({ error: "Failed to gather supply chain intel" }, { status: 500 });
  }
}
