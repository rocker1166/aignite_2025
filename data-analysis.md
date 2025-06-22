# Supply Chain Data Analysis Documentation

## Overview

This document provides a comprehensive analysis of the supply chain data structure used in the AI-driven supply chain risk analysis system. The data structure captures complex supply chain networks, including nodes (facilities/entities), edges (connections/transportation routes), and their associated risk factors for analyzing supply chain vulnerabilities and disruptions.

## Top-Level Structure

```json
{
  "id": "string",                    // Unique identifier for the supply chain
  "name": "string",                  // Human-readable name
  "description": "string",           // Description of the supply chain
  "nodes": [Node[]],                 // Array of supply chain entities
  "edges": [Edge[]],                 // Array of connections between nodes
  "connections": [Connection[]],     // Flattened view of edges for analysis
  "timestamp": "ISO 8601 string",    // Creation/modification timestamp
  "organisation": {}                 // Organization metadata
}
```

## Node Structure & Types

Nodes represent physical or logical entities in the supply chain. Each node has both common properties and type-specific properties based on its role.

### Common Node Properties

Every node contains these base properties:

```json
{
  "id": "string",                    // Unique identifier
  "type": "NodeType",                // Maps to internal node type which is  supplier , port , retailer  , distribution , warehouse , factory
  "data": {
    "label": "string",               // Display name
    "description": "string",         // Node description
    "type": "DisplayType",           // User-facing type (Supplier, Factory, Port, Retailer, Distribution, Warehouse)
    "capacity": "number",            // General capacity measure
    "riskScore": "number",           // Base risk score (1-5) this risk score is given by the user based on the risk of the node 
    "location": {                    // Geographic coordinates
      "lat": "number",
      "lng": "number",
      "country": "string",           // ISO country code (optional)
      "countryName": "string"        // Full country name (optional)
    },
    "address": "string",             // Physical address
    // Type-specific properties follow...
  },
  "position": {                      // Canvas positioning
    "x": "number",
    "y": "number"
  },
  "width": "number",                 // Visual width
  "height": "number",                // Visual height
  "selected": "boolean",             // UI selection state
  "positionAbsolute": {},            // Absolute positioning
  "dragging": "boolean"              // UI dragging state
}
```

### Node Types & Type-Specific Properties

#### 1. Supplier Node (`supplierNode`)
**Purpose**: Source of raw materials or components
**Key Validation**: Must have supplier tier, supply capacity, and material type

```json
{
  "data": {
    "type": "Supplier",
    "supplierTier": "tier1|tier2|tier3+",     // Supplier classification
    "supplyCapacity": "number",               // Annual supply capacity (required, > 0)
    "materialType": "string",                 // Type of material/component (required)
    "minOrderQty": "number",                  // Minimum order quantity
    "reliabilityPct": "number"                // On-time reliability % (0-100, optional)
  }
}
```

**Risk Analysis Context**: 
- Higher tier suppliers (tier1) typically have lower risk but higher dependency
- Supply capacity vs demand matching affects shortage risk
- Reliability percentage directly impacts delivery risk

#### 2. Factory Node (`factoryNode`)  
**Purpose**: Manufacturing and production facilities
**Key Validation**: Must have cycle time and utilization percentage

```json
{
  "data": {
    "type": "Factory", 
    "cycleTime": "number",                    // Production time per unit in days (required, > 0)
    "utilizationPct": "number",               // Average utilization % (required, > 0)
    "productionCapacity": "number",           // Production capacity (optional)
    "dependsOnExternalCompany": "boolean",    // External dependency flag
    "externalCompanyName": "string",          // External company name (if dependent)
    "externalCompanyCountry": "string",       // External company country (if dependent)
    "externalCompanyDescription": "string"    // External company description (if dependent)
  }
}
```

**Risk Analysis Context**:
- High utilization (>90%) indicates potential bottleneck risk
- External company dependencies introduce additional risk layers
- Cycle time affects responsiveness to demand changes

#### 3. Warehouse Node (`warehouseNode`)
**Purpose**: Storage and inventory management facilities  
**Key Validation**: Must have storage capacity and temperature control setting

```json
{
  "data": {
    "type": "Warehouse",
    "storageCapacity": "number",              // Total storage capacity (required, >= 0)
    "storageCostPerUnit": "number",           // Storage cost per unit per day (optional, > 0)
    "temperatureControl": "boolean",          // Temperature-controlled storage (required)
    "handlingCostPerUnit": "number"           // Handling cost per unit (optional, > -1)
  }
}
```

**Risk Analysis Context**:
- Storage capacity limits affect inventory buffer capability
- Temperature control affects product quality risk for sensitive goods
- Storage costs impact overall supply chain economics

#### 4. Distribution Node (`distributionNode`)
**Purpose**: Distribution and logistics centers
**Key Validation**: Fleet size and delivery range validation

```json
{
  "data": {
    "type": "Distribution",
    "fleetSize": "number",                    // Number of vehicles (optional, >= 0)
    "deliveryRangeKm": "number"               // Maximum delivery range in km (optional, > 0)
  }
}
```

**Risk Analysis Context**:
- Fleet size affects delivery capacity and redundancy
- Delivery range determines geographic coverage and risk exposure

#### 5. Port Node (`portNode`)
**Purpose**: Maritime shipping and customs facilities
**Key Validation**: Throughput and customs time validation

```json
{
  "data": {
    "type": "Port", 
    "annualThroughputTEU": "number",          // Annual throughput in TEUs (optional, >= 0)
    "customsTimeDays": "number"               // Customs clearance time in days (optional, >= 0)
  }
}
```

**Risk Analysis Context**:
- High throughput ports may have congestion risks but better connectivity
- Customs time affects overall supply chain speed and predictability

#### 6. Retailer Node (`retailerNode`)
**Purpose**: Final customer-facing outlets
**Key Validation**: Must have demand rate specified

```json
{
  "data": {
    "type": "Retailer",
    "demandRate": "number",                   // Average demand in units/day (required, >= 0)
    "shelfSpaceCap": "number",                // Shelf space capacity (optional)
    "reorderPoint": "number"                  // Inventory reorder point (optional)
  }
}
```

**Risk Analysis Context**:
- Demand rate drives the entire supply chain pull
- Multiple retailers create demand diversification vs concentration trade-offs

### Common Risk Assessment Properties

All node types can include these risk-specific properties:

```json
{
  "hasPreKnownRisks": "boolean",             // Flag for known risks
  "riskExplanation": "string",               // Detailed risk description
  "riskSeverity": "number",                  // Risk severity (1-5 scale)
  "nodeColor": "string"                      // Visual risk indicator
}
```

## Edge Structure & Transportation

Edges represent connections and material/information flow between nodes. They capture transportation details and risk factors.

### Core Edge Properties

```json
{
  "id": "string",                            // Unique edge identifier
  "source": "string",                        // Source node ID
  "target": "string",                        // Target node ID
  "type": "transportEdge",                   // Edge type road , rail , sea , air
  "data": {
    "mode": "TransportMode",                 // Transportation method road , rail , sea , air
    "cost": "number",                        // Transportation cost (required, > 0)
    "transitTime": "number",                 // Transit time in days (required, > 0)
  },
  "selected": "boolean"                      // UI selection state
}
```

### Transportation Modes

- **road**: Road transportation (trucks, vehicles)
- **rail**: Railway transportation  
- **sea**: Maritime shipping
- **air**: Air cargo transportation

**Risk Analysis Context**: Different modes have varying risk profiles:
- Road: Weather, traffic, driver availability
- Rail: Infrastructure dependencies, scheduling
- Sea: Weather, piracy, port congestion
- Air: Weather, capacity constraints, high costs

### Risk and Disruption Properties

Edges include comprehensive risk assessment fields:

```json
{
  "data": {
    // Historical risk data
    "avgDelayDays": "number",                // Average historical delays (>= 0)
    "frequencyOfDisruptions": "number",      // Disruptions per year (>= 0)
    
    // Alternative routing
    "hasAltRoute": "boolean",                // Alternative routes available
    "altRouteDetails": "string",             // Description of alternative routes
    
    // Chokepoint exposure
    "passesThroughChokepoint": "boolean",    // Passes through global chokepoints
    "chokepointNames": ["string"]            // List of chokepoint names
  }
}
```

### Global Chokepoints

The system recognizes these major global trade chokepoints:

**Maritime Chokepoints**:
- Suez Canal, Panama Canal, Strait of Malacca, Strait of Hormuz
- Strait of Gibraltar, Bosphorus Strait, Dover Strait, Bab-el-Mandeb
- Cape of Good Hope, Turkish Straits, Singapore Strait

**Land Chokepoints**:
- Khyber Pass, Brenner Pass, Gotthard Pass
- Mont Blanc Tunnel, Channel Tunnel

**Risk Analysis Context**: Routes through chokepoints have:
- Higher disruption probability
- Potential for cascading failures
- Need for alternative route planning
- Political and economic vulnerability

## Validation Rules & Data Quality

The system enforces comprehensive validation rules for data integrity:

### Node Validation
- **Essential Data**: Label, type, country/address required
- **Numeric Bounds**: Risk scores (0-1), positive capacities
- **Type-Specific**: Each node type has mandatory fields
- **External Dependencies**: If external company flag is true, name and country required

### Edge Validation  
- **Essential Data**: Cost and transit time must be positive
- **Transport Logic**: Mode should match geographic constraints
- **Risk Fields**: Delays and disruption frequency must be non-negative
- **Chokepoint Logic**: International routes for chokepoint selection

### Graph-Level Validation
- **Connectivity**: No orphaned nodes, single connected component
- **Flow Logic**: Reasonable supply chain flow direction
- **Circular Dependencies**: Detection and prevention of cycles
- **Duplicates**: Unique IDs and meaningful labels

## Risk Analysis Applications

### Node-Level Risk Factors
1. **Capacity Utilization**: High utilization indicates bottleneck risk
2. **External Dependencies**: Dependencies on external companies
3. **Geographic Risk**: Location-based risks (country, region)
4. **Type-Specific Risks**: Supplier reliability, factory cycle times, etc.

### Edge-Level Risk Factors  
1. **Historical Performance**: Average delays and disruption frequency
2. **Chokepoint Exposure**: Routes through critical global passages
3. **Alternative Route Availability**: Redundancy and rerouting options
4. **Transport Mode Risks**: Mode-specific vulnerability profiles

### Network-Level Risk Factors
1. **Single Points of Failure**: Nodes/edges with no alternatives
2. **Cascade Potential**: How disruptions propagate through network
3. **Geographic Clustering**: Concentration of facilities in risk-prone areas
4. **Supply-Demand Matching**: Capacity vs demand imbalances

## Data Processing Recommendations

### For Risk Analysis Engines
1. **Weighted Risk Scoring**: Combine node and edge risks with network topology
2. **Scenario Simulation**: Use chokepoint and disruption data for what-if analysis
3. **Alternative Path Analysis**: Leverage hasAltRoute and network structure
4. **Temporal Analysis**: Use lead times and cycle times for timeline modeling

### For Optimization Systems
1. **Capacity Planning**: Use utilization and capacity fields for optimization
2. **Cost Optimization**: Incorporate storage, handling, and transport costs
3. **Geographic Optimization**: Use location data for distance-based decisions
4. **Inventory Optimization**: Use demand rates and reorder points

### Data Quality Monitoring
1. **Completeness Checks**: Ensure all required fields are populated
2. **Consistency Validation**: Cross-validate related fields
3. **Range Validation**: Check numeric bounds and business logic
4. **Relationship Validation**: Verify edge connections and flow logic

## Example Risk Analysis Queries

### High-Risk Path Identification
```
Find paths with:
- frequencyOfDisruptions > 3 AND hasAltRoute = false
- passesThroughChokepoint = true AND avgDelayDays > 5
- utilizationPct > 90 in factory nodes
```

### Chokepoint Vulnerability Assessment
```
Analyze routes through:
- Suez Canal + high disruption frequency
- Multiple chokepoints in single route
- No alternative route options
```

### Capacity Constraint Analysis
```
Identify nodes with:
- demandRate > supplyCapacity mismatches
- storageCapacity < expected inventory levels
- fleetSize insufficient for deliveryRangeKm coverage
```

This documentation provides the foundation for building robust risk analysis and optimization systems on top of the supply chain data structure.

## Real-World Example Data

Below is an actual supply chain configuration showing the complete data structure with all field types and variations:

### Complete Supply Chain Example

```json
{
  "id": "default-chain",                     // REQUIRED - Unique identifier
  "name": "Default Supply Chain",            // REQUIRED - Human-readable name
  "description": "damn",                     // REQUIRED - Description
  "nodes": [
    // SUPPLIER NODE EXAMPLE
    {
      "id": "tier1-supplier-1",              // REQUIRED - Unique node ID
      "type": "supplierNode",                // REQUIRED - Internal node type
      "data": {
        "label": "Tier 1 Supplier",         // REQUIRED - Display name
        "description": "Direct supplier with complete component assembly", // REQUIRED
        "type": "Supplier",                 // REQUIRED - Display type
        "capacity": 25000,                  // OPTIONAL - Legacy field
        "leadTime": 10,                     // OPTIONAL - General lead time
        "riskScore": 0.2,                   // OPTIONAL - Base risk score (0-1)
        "location": {                       // REQUIRED - At least lat/lng
          "lat": 42.331,                    // REQUIRED - Latitude
          "lng": -83.045                    // REQUIRED - Longitude
        },
        "address": "Detroit Tier 1 Supplier, MI", // REQUIRED - Physical address
        
        // SUPPLIER-SPECIFIC REQUIRED FIELDS
        "supplierTier": "tier1",            // REQUIRED - Must be tier1/tier2/tier3+
        "supplyCapacity": 1000,             // REQUIRED - Must be > 0
        "materialType": "metal",            // REQUIRED - String description
        "minOrderQty": 10,                  // REQUIRED - Minimum order quantity
        
        // SUPPLIER-SPECIFIC OPTIONAL FIELDS
        "reliabilityPct": 1000              // OPTIONAL - On-time reliability % (Note: 1000% is invalid - should be 0-100)
      },
      "position": {                         // REQUIRED - Canvas positioning
        "x": -38.66965444401487,
        "y": -239.80505523459365
      },
      "width": 150,                         // REQUIRED - Visual width
      "height": 43,                         // REQUIRED - Visual height
      "selected": false,                    // OPTIONAL - UI state
      "positionAbsolute": {                 // OPTIONAL - Absolute positioning
        "x": -38.66965444401487,
        "y": -239.80505523459365
      },
      "dragging": false                     // OPTIONAL - UI state
    },
    
    // FACTORY NODE EXAMPLE  
    {
      "id": "assembly-facility-2",          // REQUIRED - Unique node ID
      "type": "factoryNode",               // REQUIRED - Internal node type
      "data": {
        "label": "Assembly Facility",       // REQUIRED - Display name
        "description": "Final product assembly and testing", // REQUIRED
        "type": "Factory",                 // REQUIRED - Display type
        "capacity": 20000,                 // OPTIONAL - Legacy field
        "leadTime": 3,                     // OPTIONAL - General lead time
        "riskScore": 0.1,                  // OPTIONAL - Base risk score (0-1)
        "location": {                      // REQUIRED - At least lat/lng
          "lat": 41.878,
          "lng": -87.629,
          "country": "IND",                // OPTIONAL - ISO country code
          "countryName": "India"           // OPTIONAL - Full country name
        },
        "address": "Chicago Assembly Plant, IL", // REQUIRED - Physical address
        
        // FACTORY-SPECIFIC REQUIRED FIELDS
        "cycleTime": 10,                   // REQUIRED - Must be > 0 (days/unit)
        "utilizationPct": 80,              // REQUIRED - Must be > 0 (average %)
        
        // FACTORY-SPECIFIC OPTIONAL FIELDS
        "productionCapacity": 10,          // OPTIONAL - Production capacity
        
        // EXTERNAL DEPENDENCY FIELDS (ALL REQUIRED IF dependsOnExternalCompany = true)
        "dependsOnExternalCompany": true,  // OPTIONAL - External dependency flag
        "externalCompanyName": "tsmc",     // REQUIRED if dependsOnExternalCompany = true
        "externalCompanyCountry": "TWN",   // REQUIRED if dependsOnExternalCompany = true
        "externalCompanyDescription": "taiwnan" // OPTIONAL but recommended if dependent
      },
      "position": { "x": 600, "y": 150 },  // REQUIRED - Canvas positioning
      "width": 150, "height": 43,          // REQUIRED - Visual dimensions
      "selected": false, "dragging": false // OPTIONAL - UI states
    },
    
    // WAREHOUSE NODE EXAMPLE
    {
      "id": "distribution-center-2",       // REQUIRED - Unique node ID
      "type": "warehouseNode",             // REQUIRED - Internal node type
      "data": {
        "label": "Distribution Center",     // REQUIRED - Display name
        "description": "Finished goods distribution", // REQUIRED
        "type": "Warehouse",               // REQUIRED - Display type
        "capacity": 15000,                 // OPTIONAL - Legacy field
        "leadTime": 2,                     // OPTIONAL - General lead time
        "riskScore": 0.1,                  // OPTIONAL - Base risk score (0-1)
        "location": {                      // REQUIRED - At least lat/lng
          "lat": 39.961,
          "lng": -82.998
        },
        "address": "Columbus Distribution, OH", // REQUIRED - Physical address
        
        // WAREHOUSE-SPECIFIC REQUIRED FIELDS
        "storageCapacity": 100,            // REQUIRED - Must be >= 0
        "temperatureControl": false,       // REQUIRED - Boolean flag
        
        // WAREHOUSE-SPECIFIC OPTIONAL FIELDS
        "storageCostPerUnit": 10,          // OPTIONAL - Must be > 0 if present
        "handlingCostPerUnit": null        // OPTIONAL - Must be > -1 if present
      },
      "position": { "x": 1000, "y": 150 }, // REQUIRED - Canvas positioning
      "width": 150, "height": 43,          // REQUIRED - Visual dimensions
      "selected": false, "dragging": false // OPTIONAL - UI states
    },
    
    // PORT NODE EXAMPLE
    {
      "id": "port-4",                      // REQUIRED - Unique node ID
      "type": "portNode",                  // REQUIRED - Internal node type
      "data": {
        "label": "New Port",               // REQUIRED - Display name
        "description": "Description for Port", // REQUIRED
        "type": "Port",                    // REQUIRED - Display type
        "capacity": 500,                   // OPTIONAL - Legacy field
        "leadTime": 7,                     // OPTIONAL - General lead time
        "riskScore": 0.3,                  // OPTIONAL - Base risk score (0-1)
        "location": {                      // REQUIRED - At least lat/lng
          "lat": 0,                        // Note: 0,0 coordinates indicate placeholder
          "lng": 0
        },
        "address": "Default address for Port", // REQUIRED - Physical address
        
        // PORT-SPECIFIC OPTIONAL FIELDS
        "annualThroughputTEU": 1,          // OPTIONAL - Must be >= 0 if present
        "customsTimeDays": null,           // OPTIONAL - Must be >= 0 if present
        
        // EXTERNAL DEPENDENCY FIELDS
        "dependsOnExternalCompany": false  // OPTIONAL - External dependency flag
      },
      "position": { "x": 356.6257236740206, "y": 313.0119016231839 },
      "width": 150, "height": 43,
      "selected": false, "dragging": false
    },
    
    // DISTRIBUTION NODE EXAMPLE
    {
      "id": "distribution-5",              // REQUIRED - Unique node ID
      "type": "distributionNode",          // REQUIRED - Internal node type
      "data": {
        "label": "New Distribution",       // REQUIRED - Display name
        "description": "Description for Distribution", // REQUIRED
        "type": "Distribution",            // REQUIRED - Display type
        "capacity": 500,                   // OPTIONAL - Legacy field
        "leadTime": 7,                     // OPTIONAL - General lead time
        "riskScore": 0.3,                  // OPTIONAL - Base risk score (0-1)
        "location": {                      // REQUIRED - At least lat/lng
          "lat": 0,
          "lng": 0
        },
        "address": "Default address for Distribution", // REQUIRED - Physical address
        
        // DISTRIBUTION-SPECIFIC OPTIONAL FIELDS
        "fleetSize": null,                 // OPTIONAL - Must be >= 0 if present
        "deliveryRangeKm": null            // OPTIONAL - Must be > 0 if present
      },
      "position": { "x": 723.1538304235867, "y": 267.51841530050507 },
      "width": 150, "height": 43,
      "selected": false, "dragging": false
    },
    
    // RETAILER NODE EXAMPLE
    {
      "id": "retailer-6",                  // REQUIRED - Unique node ID
      "type": "retailerNode",              // REQUIRED - Internal node type
      "data": {
        "label": "New Retailer",           // REQUIRED - Display name
        "description": "Description for Retailer", // REQUIRED
        "type": "Retailer",                // REQUIRED - Display type
        "capacity": 500,                   // OPTIONAL - Legacy field
        "leadTime": 7,                     // OPTIONAL - General lead time
        "riskScore": 0.3,                  // OPTIONAL - Base risk score (0-1)
        "location": {                      // REQUIRED - At least lat/lng
          "lat": 0,
          "lng": 0
        },
        "address": "Default address for Retailer", // REQUIRED - Physical address
        
        // RETAILER-SPECIFIC REQUIRED FIELDS
        "demandRate": 99,                  // REQUIRED - Must be >= 0
        
        // RETAILER-SPECIFIC OPTIONAL FIELDS
        "shelfSpaceCap": null,             // OPTIONAL - Shelf space capacity
        "reorderPoint": null,              // OPTIONAL - Inventory reorder point
        
        // RISK ASSESSMENT FIELDS (ALL OPTIONAL)
        "hasPreKnownRisks": false,         // OPTIONAL - Known risks flag
        "riskExplanation": null,           // OPTIONAL - Required if hasPreKnownRisks = true
        "riskSeverity": null,              // OPTIONAL - 1-5 scale, required if hasPreKnownRisks = true
        "nodeColor": "#b16868"             // OPTIONAL - Visual risk indicator
      },
      "position": { "x": 578.4524282970924, "y": -57.10099161407138 },
      "width": 150, "height": 43,
      "selected": false, "dragging": false
    },
    
    // ADDITIONAL FACTORY NODE EXAMPLE
    {
      "id": "factory-7",                   // REQUIRED - Unique node ID
      "type": "factoryNode",               // REQUIRED - Internal node type
      "data": {
        "label": "New Factory",            // REQUIRED - Display name
        "description": "Description for Factory", // REQUIRED
        "type": "Factory",                 // REQUIRED - Display type
        "capacity": 500,                   // OPTIONAL - Legacy field
        "leadTime": 7,                     // OPTIONAL - General lead time
        "riskScore": 0.3,                  // OPTIONAL - Base risk score (0-1)
        "location": {                      // REQUIRED - At least lat/lng
          "lat": 0,
          "lng": 0
        },
        "address": "Default address for Factory", // REQUIRED - Physical address
        
        // FACTORY-SPECIFIC REQUIRED FIELDS
        "cycleTime": 10,                   // REQUIRED - Must be > 0 (days/unit)
        "utilizationPct": 10               // REQUIRED - Must be > 0 (average %)
      },
      "position": { "x": 225.05103754259926, "y": 147.06284498191263 },
      "width": 150, "height": 43,
      "selected": false, "dragging": false
    }
  ],
  
  "edges": [
    // EDGE WITH COMPREHENSIVE RISK DATA
    {
      "id": "e-tier1-assembly",            // REQUIRED - Unique edge ID
      "source": "tier1-supplier-1",       // REQUIRED - Source node ID
      "target": "assembly-facility-2",    // REQUIRED - Target node ID
      "type": "transportEdge",             // REQUIRED - Edge type
      "data": {
        // CORE TRANSPORTATION FIELDS (REQUIRED)
        "mode": "road",                    // REQUIRED - road/rail/sea/air
        "cost": 300,                       // REQUIRED - Must be > 0
        "transitTime": 1,                  // REQUIRED - Must be > 0 (days)
        "riskMultiplier": 1,               // OPTIONAL - Risk adjustment factor
        
        // HISTORICAL RISK DATA (OPTIONAL)
        "avgDelayDays": 10,                // OPTIONAL - Must be >= 0 if present
        "frequencyOfDisruptions": 2,       // OPTIONAL - Must be >= 0 if present
        
        // ALTERNATIVE ROUTING (OPTIONAL)
        "hasAltRoute": false,              // OPTIONAL - Alternative routes flag
        "altRouteDetails": null,           // OPTIONAL - Required if hasAltRoute = true
        
        // CHOKEPOINT EXPOSURE (OPTIONAL)
        "passesThroughChokepoint": true,   // OPTIONAL - Global chokepoint flag
        "chokepointNames": [               // OPTIONAL - Required if passesThroughChokepoint = true
          "Bosphorus Strait",              // Note: These chokepoints are unusual for a road route
          "Panama Canal",                  // This suggests potential data quality issues
          "Suez Canal"
        ]
      },
      "selected": true                     // OPTIONAL - UI selection state
    },
    
    // SIMPLE EDGE EXAMPLE
    {
      "id": "e-assembly-distribution",     // REQUIRED - Unique edge ID
      "source": "assembly-facility-2",    // REQUIRED - Source node ID
      "target": "distribution-center-2",  // REQUIRED - Target node ID
      "type": "transportEdge",             // REQUIRED - Edge type
      "data": {
        // MINIMAL REQUIRED FIELDS
        "mode": "road",                    // REQUIRED - Transportation mode
        "cost": 200,                       // REQUIRED - Must be > 0
        "transitTime": 1,                  // REQUIRED - Must be > 0 (days)
        "riskMultiplier": 1.1,             // OPTIONAL - Risk adjustment factor
        
        // OPTIONAL FIELDS WITH DEFAULT VALUES
        "avgDelayDays": 0,                 // OPTIONAL - Default to 0
        "frequencyOfDisruptions": 0,       // OPTIONAL - Default to 0
        "hasAltRoute": false,              // OPTIONAL - Default to false
        "passesThroughChokepoint": false   // OPTIONAL - Default to false
      }
    },
    
    // ADDITIONAL EDGES WITH VARIOUS TRANSPORT MODES
    {
      "source": "port-4", "target": "assembly-facility-2",
      "id": "eport-4-assembly-facility-2", "type": "transportEdge",
      "data": {
        "mode": "road", "cost": 100, "transitTime": 1, "riskMultiplier": 1,
        "avgDelayDays": 0, "frequencyOfDisruptions": 0,
        "hasAltRoute": false, "passesThroughChokepoint": false
      }
    },
    {
      "source": "port-4", "target": "distribution-5",
      "id": "eport-4-distribution-5", "type": "transportEdge",
      "data": {
        "mode": "rail",                    // RAIL transportation mode
        "cost": 100, "transitTime": 1, "riskMultiplier": 1,
        "avgDelayDays": 0, "frequencyOfDisruptions": 0,
        "hasAltRoute": false, "passesThroughChokepoint": false
      },
      "selected": false
    },
    {
      "source": "factory-7", "target": "retailer-6",
      "id": "efactory-7-retailer-6", "type": "transportEdge",
      "data": {
        "mode": "road", "cost": 100, "transitTime": 1, "riskMultiplier": 1,
        "avgDelayDays": 0, "frequencyOfDisruptions": 0,
        "hasAltRoute": false, "passesThroughChokepoint": false
      }
    },
    {
      "source": "port-4", "target": "factory-7",
      "id": "eport-4-factory-7", "type": "transportEdge",
      "data": {
        "mode": "road", "cost": 100,
        "transitTime": 20,                 // LONGER transit time example
        "riskMultiplier": 1,
        "avgDelayDays": 0, "frequencyOfDisruptions": 0,
        "hasAltRoute": false, "passesThroughChokepoint": false
      },
      "selected": false
    }
  ],
  
  "connections": [                         // OPTIONAL - Flattened view for analysis
    {
      "sourceId": "tier1-supplier-1", "targetId": "assembly-facility-2",
      "sourceLabel": "Tier 1 Supplier", "targetLabel": "Assembly Facility",
      "mode": "road", "cost": 300, "transitTime": 1, "riskMultiplier": 1
    },
    {
      "sourceId": "assembly-facility-2", "targetId": "distribution-center-2",
      "sourceLabel": "Assembly Facility", "targetLabel": "Distribution Center",
      "mode": "road", "cost": 200, "transitTime": 1, "riskMultiplier": 1.1
    },
    {
      "sourceId": "port-4", "targetId": "assembly-facility-2",
      "sourceLabel": "New Port", "targetLabel": "Assembly Facility",
      "mode": "road", "cost": 100, "transitTime": 1, "riskMultiplier": 1
    },
    {
      "sourceId": "port-4", "targetId": "distribution-5",
      "sourceLabel": "New Port", "targetLabel": "New Distribution",
      "mode": "rail", "cost": 100, "transitTime": 1, "riskMultiplier": 1
    },
    {
      "sourceId": "factory-7", "targetId": "retailer-6",
      "sourceLabel": "New Factory", "targetLabel": "New Retailer",
      "mode": "road", "cost": 100, "transitTime": 1, "riskMultiplier": 1
    },
    {
      "sourceId": "port-4", "targetId": "factory-7",
      "sourceLabel": "New Port", "targetLabel": "New Factory",
      "mode": "road", "cost": 100, "transitTime": 20, "riskMultiplier": 1
    }
  ],
  
  "timestamp": "2025-06-22T06:05:11.471Z", // REQUIRED - ISO 8601 timestamp
  "organisation": {}                       // OPTIONAL - Organization metadata
}
```

### Data Quality Notes from Example

**Validation Issues Identified:**
1. **Supplier Node**: `reliabilityPct: 1000` is invalid (should be 0-100%)
2. **Chokepoint Logic**: Road route with maritime chokepoints (Suez Canal, Panama Canal)
3. **Location Data**: Several nodes have placeholder coordinates (0,0)
4. **Missing Fields**: Some nodes lack required type-specific fields

**Best Practices Demonstrated:**
1. **Consistent ID Patterns**: Clear, descriptive node and edge IDs
2. **Transport Mode Variety**: Examples of road, rail transportation
3. **Risk Data Gradation**: Mix of low-risk and higher-risk connections
4. **Geographic Distribution**: Nodes spanning different locations
5. **Capacity Scaling**: Realistic capacity values across different node types

This example shows a real-world supply chain configuration with typical data quality challenges and the full range of supported field types.

### Coal Supply Chain Example (Energy Sector)

Here's another real-world example from the energy sector, demonstrating industry-specific characteristics:

```json
{
  "id": "default-chain",                     // REQUIRED - Unique identifier
  "name": "Coal Supply Chain",               // REQUIRED - Human-readable name
  "description": "Here it goes description", // REQUIRED - Description
  "nodes": [
    // MINING SUPPLIER NODE WITH RISK ASSESSMENT
    {
      "id": "mining-operation-1",             // REQUIRED - Unique node ID
      "type": "supplierNode",                 // REQUIRED - Internal node type
      "data": {
        "label": "Coal Mine",                // REQUIRED - Display name
        "description": "Large-scale coal extraction operation", // REQUIRED
        "type": "Supplier",                  // REQUIRED - Display type
        "capacity": 500000,                  // OPTIONAL - Legacy field (large capacity for bulk commodity)
        "leadTime": 7,                       // OPTIONAL - General lead time
        "riskScore": 0.5,                    // OPTIONAL - Base risk score (1-5 scale, user-provided)
        "location": {                        // REQUIRED - At least lat/lng
          "lat": 39.249,
          "lng": -81.633,
          "country": "ASC",                  // OPTIONAL - ISO country code
          "countryName": "Ascension Island"  // OPTIONAL - Full country name
        },
        "address": "Appalachian Coal Mine, WV", // REQUIRED - Physical address
        
        // EXTERNAL DEPENDENCY FIELDS
        "dependsOnExternalCompany": false,   // OPTIONAL - External dependency flag
        
        // RISK ASSESSMENT FIELDS (COMPREHENSIVE EXAMPLE)
        "hasPreKnownRisks": true,            // OPTIONAL - Known risks flag
        "riskExplanation": "i am not sure about the risk", // OPTIONAL - Required if hasPreKnownRisks = true
        "riskSeverity": 3,                   // OPTIONAL - 1-5 scale, required if hasPreKnownRisks = true
        
        // SUPPLIER-SPECIFIC REQUIRED FIELDS
        "supplierTier": "tier2",             // REQUIRED - Must be tier1/tier2/tier3+
        "supplyCapacity": 98,                // REQUIRED - Must be > 0
        "materialType": "coal",              // REQUIRED - String description
        "minOrderQty": 8,                    // REQUIRED - Minimum order quantity
        
        // SUPPLIER-SPECIFIC OPTIONAL FIELDS
        "reliabilityPct": 80                 // OPTIONAL - On-time reliability % (valid 0-100%)
      },
      "position": { "x": 150, "y": 120 },   // REQUIRED - Canvas positioning
      "width": 150, "height": 43,           // REQUIRED - Visual dimensions
      "selected": false, "dragging": false, // OPTIONAL - UI states
      "positionAbsolute": { "x": 150, "y": 120 } // OPTIONAL - Absolute positioning
    },
    
    // RAIL TERMINAL WAREHOUSE NODE
    {
      "id": "rail-terminal-1",              // REQUIRED - Unique node ID
      "type": "warehouseNode",              // REQUIRED - Internal node type
      "data": {
        "label": "Rail Loading Terminal",    // REQUIRED - Display name
        "description": "Bulk commodity rail loading facility", // REQUIRED
        "type": "Warehouse",                 // REQUIRED - Display type
        "capacity": 200000,                  // OPTIONAL - Legacy field
        "leadTime": 2,                       // OPTIONAL - General lead time
        "riskScore": 0.3,                    // OPTIONAL - Base risk score (1-5 scale)
        "location": {                        // REQUIRED - At least lat/lng
          "lat": 40.44,
          "lng": -79.995,
          "country": "ASC",                  // OPTIONAL - ISO country code
          "countryName": "Ascension Island"  // OPTIONAL - Full country name
        },
        "address": "Pittsburgh Rail Terminal, PA", // REQUIRED - Physical address
        
        // WAREHOUSE-SPECIFIC REQUIRED FIELDS
        "storageCapacity": 98,               // REQUIRED - Must be >= 0
        "temperatureControl": false,         // REQUIRED - Boolean flag
        
        // WAREHOUSE-SPECIFIC OPTIONAL FIELDS
        "storageCostPerUnit": 1000,          // OPTIONAL - Must be > 0 if present
        "handlingCostPerUnit": 1000          // OPTIONAL - Must be > -1 if present
      },
      "position": { "x": 450, "y": 150 },   // REQUIRED - Canvas positioning
      "width": 150, "height": 63,           // REQUIRED - Visual dimensions
      "selected": false,                     // OPTIONAL - UI state
      "positionAbsolute": { "x": 450, "y": 150 } // OPTIONAL - Absolute positioning
    },
    
    // POWER PLANT FACTORY NODE
    {
      "id": "power-plant-1",                // REQUIRED - Unique node ID
      "type": "factoryNode",                // REQUIRED - Internal node type
      "data": {
        "label": "Power Generation Plant",   // REQUIRED - Display name
        "description": "Coal-fired electricity generation facility", // REQUIRED
        "type": "Factory",                   // REQUIRED - Display type
        "capacity": 50000,                   // OPTIONAL - Legacy field
        "leadTime": 1,                       // OPTIONAL - General lead time
        "riskScore": 0.2,                    // OPTIONAL - Base risk score (1-5 scale)
        "location": {                        // REQUIRED - At least lat/lng
          "lat": 41.881,
          "lng": -87.623,
          "country": "AND",                  // OPTIONAL - ISO country code
          "countryName": "Andorra"           // OPTIONAL - Full country name
        },
        "address": "Chicago Power Plant, IL", // REQUIRED - Physical address
        
        // RISK ASSESSMENT FIELDS
        "hasPreKnownRisks": false,           // OPTIONAL - Known risks flag
        
        // FACTORY-SPECIFIC REQUIRED FIELDS
        "cycleTime": 10,                     // REQUIRED - Must be > 0 (days/unit)
        "utilizationPct": 90                 // REQUIRED - Must be > 0 (average %) - HIGH UTILIZATION
      },
      "position": { "x": 750, "y": 180 },   // REQUIRED - Canvas positioning
      "width": 150, "height": 63,           // REQUIRED - Visual dimensions
      "selected": false, "dragging": false, // OPTIONAL - UI states
      "positionAbsolute": { "x": 750, "y": 180 } // OPTIONAL - Absolute positioning
    },
    
    // ELECTRICAL GRID DISTRIBUTION NODE
    {
      "id": "grid-distribution-1",          // REQUIRED - Unique node ID
      "type": "distributionNode",           // REQUIRED - Internal node type
      "data": {
        "label": "Electrical Grid",         // REQUIRED - Display name
        "description": "Regional electrical distribution network", // REQUIRED
        "type": "Distribution",              // REQUIRED - Display type
        "capacity": 100000,                  // OPTIONAL - Legacy field
        "leadTime": 0,                       // OPTIONAL - General lead time (immediate for electricity)
        "riskScore": 0.4,                    // OPTIONAL - Base risk score (1-5 scale)
        "location": {                        // REQUIRED - At least lat/lng
          "lat": 41.878,
          "lng": -87.629
        },
        "address": "Midwest Grid Network, IL", // REQUIRED - Physical address
        
        // DISTRIBUTION-SPECIFIC OPTIONAL FIELDS
        "fleetSize": 10,                     // OPTIONAL - Must be >= 0 if present (grid infrastructure units)
        "deliveryRangeKm": 100               // OPTIONAL - Must be > 0 if present (grid coverage range)
      },
      "position": { "x": 1050, "y": 150 },  // REQUIRED - Canvas positioning
      "width": 150, "height": 43,           // REQUIRED - Visual dimensions
      "selected": false,                     // OPTIONAL - UI state
      "positionAbsolute": { "x": 1050, "y": 150 } // OPTIONAL - Absolute positioning
    }
  ],
  
  "edges": [
    // ROAD TRANSPORT FROM MINE TO RAIL TERMINAL
    {
      "id": "e-mining-rail",                // REQUIRED - Unique edge ID
      "source": "mining-operation-1",       // REQUIRED - Source node ID
      "target": "rail-terminal-1",          // REQUIRED - Target node ID
      "type": "transportEdge",              // REQUIRED - Edge type (road, rail, sea, air)
      "data": {
        // CORE TRANSPORTATION FIELDS (REQUIRED)
        "mode": "road",                      // REQUIRED - road/rail/sea/air
        "cost": 300,                         // REQUIRED - Must be > 0
        "transitTime": 1,                    // REQUIRED - Must be > 0 (days)
        "riskMultiplier": 1.2,               // OPTIONAL - Risk adjustment factor
        
        // HISTORICAL RISK DATA (OPTIONAL)
        "avgDelayDays": 0,                   // OPTIONAL - Must be >= 0 if present
        "frequencyOfDisruptions": 0,         // OPTIONAL - Must be >= 0 if present
        
        // ALTERNATIVE ROUTING (OPTIONAL)
        "hasAltRoute": false,                // OPTIONAL - Alternative routes flag
        
        // CHOKEPOINT EXPOSURE (OPTIONAL)
        "passesThroughChokepoint": false     // OPTIONAL - Global chokepoint flag
      },
      "selected": true                       // OPTIONAL - UI selection state
    },
    
    // RAIL TRANSPORT FROM TERMINAL TO POWER PLANT
    {
      "id": "e-rail-power",                 // REQUIRED - Unique edge ID
      "source": "rail-terminal-1",          // REQUIRED - Source node ID
      "target": "power-plant-1",            // REQUIRED - Target node ID
      "type": "transportEdge",              // REQUIRED - Edge type
      "data": {
        // CORE TRANSPORTATION FIELDS
        "mode": "rail",                      // REQUIRED - RAIL transportation mode
        "cost": 800,                         // REQUIRED - Must be > 0 (higher cost for bulk rail)
        "transitTime": 2,                    // REQUIRED - Must be > 0 (days)
        "riskMultiplier": 1.3,               // OPTIONAL - Risk adjustment factor
        
        // OPTIONAL RISK FIELDS
        "avgDelayDays": 0,                   // OPTIONAL - Default values
        "frequencyOfDisruptions": 0,         // OPTIONAL - Default values
        "hasAltRoute": false,                // OPTIONAL - Default to false
        "passesThroughChokepoint": false     // OPTIONAL - Default to false
      },
      "selected": false                      // OPTIONAL - UI selection state
    },
    
    // ELECTRICAL TRANSMISSION (NON-STANDARD TRANSPORT MODE)
    {
      "id": "e-power-grid",                 // REQUIRED - Unique edge ID
      "source": "power-plant-1",            // REQUIRED - Source node ID
      "target": "grid-distribution-1",      // REQUIRED - Target node ID
      "type": "transportEdge",              // REQUIRED - Edge type
      "data": {
        // CORE TRANSPORTATION FIELDS
        "mode": "electrical",                // NON-STANDARD - Not in typical road/rail/sea/air list
        "cost": 1000,                        // REQUIRED - Must be > 0 (transmission costs)
        "transitTime": 2,                    // REQUIRED - Must be > 0 (grid balancing time)
        "riskMultiplier": 1.4,               // OPTIONAL - Risk adjustment factor
        
        // HISTORICAL RISK DATA (HIGHER RISK EXAMPLE)
        "avgDelayDays": 2,                   // OPTIONAL - Grid outage delays
        "frequencyOfDisruptions": 5,         // OPTIONAL - Multiple disruptions per year
        
        // ALTERNATIVE ROUTING
        "hasAltRoute": false,                // OPTIONAL - Limited grid alternatives
        "passesThroughChokepoint": false     // OPTIONAL - Not applicable for electrical
      },
      "selected": false                      // OPTIONAL - UI selection state
    }
  ],
  
  "connections": [                           // OPTIONAL - Flattened view for analysis
    {
      "sourceId": "mining-operation-1", "targetId": "rail-terminal-1",
      "sourceLabel": "Coal Mine", "targetLabel": "Rail Loading Terminal",
      "mode": "road", "cost": 300, "transitTime": 1, "riskMultiplier": 1.2
    },
    {
      "sourceId": "rail-terminal-1", "targetId": "power-plant-1",
      "sourceLabel": "Rail Loading Terminal", "targetLabel": "Power Generation Plant",
      "mode": "rail", "cost": 800, "transitTime": 2, "riskMultiplier": 1.3
    },
    {
      "sourceId": "power-plant-1", "targetId": "grid-distribution-1",
      "sourceLabel": "Power Generation Plant", "targetLabel": "Electrical Grid",
      "mode": "electrical", "cost": 1000, "transitTime": 2, "riskMultiplier": 1.4
    }
  ],
  
  "timestamp": "2025-06-22T11:44:04.781Z",  // REQUIRED - ISO 8601 timestamp
  
  // NEW FIELD: FORM DATA (Supply Chain Configuration Metadata)
  "formData": {                              // OPTIONAL - Configuration context
    "industry": "Energy & Utilities",        // OPTIONAL - Industry classification
    "customIndustry": null,                  // OPTIONAL - Custom industry if not in predefined list
    "productCharacteristics": [              // OPTIONAL - Product characteristic tags
      "high_value",                          // High-value products
      "bulk"                                 // Bulk commodities
    ],
    "supplierTiers": "tier1",                // OPTIONAL - Primary supplier tier focus
    "operationsLocation": [                  // OPTIONAL - Geographic operation regions
      "apac",                                // Asia-Pacific
      "eu"                                   // Europe
    ],
    "country": null,                         // OPTIONAL - Specific country focus
    "currency": "DZD",                       // OPTIONAL - Algerian Dinar (unusual choice)
    "shippingMethods": [                     // OPTIONAL - Preferred shipping methods
      "sea",
      "air"
    ],
    "annualVolumeType": "units",             // OPTIONAL - Volume measurement type
    "annualVolumeValue": 10000,              // OPTIONAL - Annual volume quantity
    "risks": [                               // OPTIONAL - Primary risk concerns
      "quality",                             // Quality risks
      "financial",                           // Financial risks
      "supplier_concentration"               // Supplier concentration risks
    ]
  },
  
  "organisation": {}                         // OPTIONAL - Organization metadata
}
```

### Energy Sector Analysis Notes

**Industry-Specific Characteristics:**
1. **Bulk Commodities**: Large capacity values (500,000 for mining)
2. **High Utilization**: Power plant at 90% utilization (bottleneck risk)
3. **Non-Standard Transport**: "electrical" mode for power transmission
4. **Infrastructure Assets**: Grid as distribution network rather than vehicles

**Risk Profile Observations:**
1. **Mining Operation**: Tier2 supplier with moderate risk assessment
2. **Power Plant**: High utilization creates capacity constraint risk
3. **Electrical Grid**: Higher disruption frequency (5/year) and delays
4. **Supply Chain Length**: Short, efficient chain (4 nodes, 3 connections)

**Data Quality Issues:**
1. **Country Codes**: Ascension Island (ASC) unusual for US mining operations
2. **Transport Mode**: "electrical" not in standard mode list
3. **Currency**: DZD (Algerian Dinar) unusual for US energy operations
4. **Risk Score Scale**: Some nodes use 0-1 scale vs documented 1-5 scale

**FormData Structure:**
The `formData` field provides valuable context for risk analysis:
- **Industry Classification**: Enables industry-specific risk models
- **Product Characteristics**: High-value + bulk indicates special handling needs
- **Geographic Operations**: Multi-region operations increase complexity
- **Risk Focus Areas**: Quality, financial, and concentration risks identified

This example demonstrates how different industries require specialized modeling approaches and highlights the importance of data validation in complex supply chain systems. 