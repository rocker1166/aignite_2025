import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// ✅ Supply chain declared ABOVE the handler
const supplyChainData =
{
    "organization": {
      "organizationName": "The Boeing Company",
      "description": "Boeing is a leading aerospace company that designs, manufactures, and sells airplanes, rotorcraft, rockets, satellites, and telecommunications equipment worldwide.",
      "employeesCount": 156000,
      "industry": "Aerospace and Defense",
      "industryDetail": "Design and manufacture of commercial airplanes, defense systems, and space exploration vehicles.",
      "moreInfo": {
        "headquarters": "100 N Riverside Plaza, Chicago, IL 60606, USA",
        "website": "https://www.boeing.com",
        "contactEmail": "contact@boeing.com",
        "contactPhone": "+1-312-544-2000"
      }
    },
    "supplyChain": {
      "id": "boeing-supply-chain",
      "nodes": [
        {
          "id": "supplier-1",
          "type": "supplierNode",
          "data": {
            "label": "Spirit AeroSystems",
            "description": "Manufactures fuselage sections and other aerostructures for Boeing's commercial aircraft.",
            "type": "Supplier",
            "capacity": 1500,
            "leadTime": 20,
            "riskScore": 0.7,
            "moreInfo": {
              "website": "https://www.spiritaero.com",
              "contactEmail": "info@spiritaero.com",
              "contactPhone": "+1-316-526-9000"
            },
            "location": {
              "lat": 37.688,
              "lng": -97.336
            },
            "address": "3801 S Oliver St, Wichita, KS 67210, USA"
          },
          "position": {
            "x": 250,
            "y": 100
          },
          "width": 150,
          "height": 43,
          "selected": false,
          "dragging": false
        },
        {
          "id": "supplier-2",
          "type": "supplierNode",
          "data": {
            "label": "Tata Boeing Aerospace Limited (TBAL)",
            "description": "Produces aero-structures for Boeing's AH-64 Apache helicopter and vertical fin structures for the 737 aircraft.",
            "type": "Supplier",
            "capacity": 1000,
            "leadTime": 25,
            "riskScore": 0.3,
            "moreInfo": {
              "website": "https://www.boeing.co.in",
              "contactEmail": "contact@tbal.co.in",
              "contactPhone": "+91-40-1234-5678"
            },
            "location": {
              "lat": 17.385,
              "lng": 78.486
            },
            "address": "Hyderabad, Telangana, India"
          },
          "position": {
            "x": 250,
            "y": 200
          },
          "width": 150,
          "height": 43,
          "selected": false,
          "dragging": false
        },
        {
          "id": "factory-1",
          "type": "factoryNode",
          "data": {
            "label": "Boeing Everett Factory",
            "description": "Assembles Boeing's wide-body aircraft, including the 747, 767, 777, and 787 models.",
            "type": "Factory",
            "capacity": 2000,
            "leadTime": 30,
            "riskScore": 0.5,
            "moreInfo": {
              "website": "https://www.boeing.com/company/about-bca/everett.page",
              "contactEmail": "everett@boeing.com",
              "contactPhone": "+1-425-266-1000"
            },
            "location": {
              "lat": 47.923,
              "lng": -122.271
            },
            "address": "3003 W Casino Rd, Everett, WA 98204, USA"
          },
          "position": {
            "x": 450,
            "y": 150
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
            "label": "Port of Seattle",
            "description": "Facilitates the export of Boeing aircraft and components to international markets.",
            "type": "Port",
            "capacity": 5000,
            "leadTime": 5,
            "riskScore": 0.2,
            "moreInfo": {
              "website": "https://www.portseattle.org",
              "contactEmail": "info@portseattle.org",
              "contactPhone": "+1-206-787-3000"
            },
            "location": {
              "lat": 47.606,
              "lng": -122.332
            },
            "address": "2711 Alaskan Way, Seattle, WA 98121, USA"
          },
          "position": {
            "x": 650,
            "y": 150
          },
          "width": 150,
          "height": 43,
          "selected": false,
          "dragging": false
        }
      ],
      "edges": [
        {
          "id": "e1-3",
          "source": "supplier-1",
          "target": "factory-1",
          "data": {
            "mode": "road",
            "cost": 300,
            "transitTime": 3,
            "riskMultiplier": 1.1
          }
        },
        {
          "id": "e2-3",
          "source": "supplier-2",
          "target": "factory-1",
          "data": {
            "mode": "air",
            "cost": 500,
            "transitTime": 2,
            "riskMultiplier": 1.2
          }
        },
        {
          "id": "e3-4",
          "source": "factory-1",
          "target": "port-1",
          "data": {
            "mode": "road",
            "cost": 100,
            "transitTime": 1,
            "riskMultiplier": 1.0
          }
        }
      ],
      "connections": [
        {
          "sourceId": "supplier-1",
          "targetId": "factory-1",
          "sourceLabel": "Spirit AeroSystems",
          "targetLabel": "Boeing Everett Factory",
          "mode": "road",
          "cost": 300,
          "transitTime": 3,
          "riskMultiplier": 1.1
        },
                {
                  "sourceId": "supplier-2",
                  "targetId": "factory-1",
                  "sourceLabel": "Tata Boeing Aerospace Limited (TBAL)",
                  "targetLabel": "Boeing Everett Factory",
                  "mode": "air",
                  "cost": 500,
                  "transitTime": 2,
                  "riskMultiplier": 1.2
                }
              ]
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
  Today’s date is ${new Date().toISOString()}. the news should be latest and contain only the most lastest  information. of today date only. 2025 news ans weathear only. include us tariff geo political event which deisrupted port nodes.
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
