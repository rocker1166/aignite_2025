import { Factory, Truck, Warehouse, Ship, Building2, Store } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { PropertySpec, NodeType } from '../lib/types/digital-twin';

// Import all templates from organized structure
import {
  // Industry-specific templates
  ELECTRONICS_TEMPLATE,
  ELECTRONICS_TEMPLATE_EDGES,
  FOOD_BEVERAGE_COLD_CHAIN_TEMPLATE,
  FOOD_BEVERAGE_COLD_CHAIN_TEMPLATE_EDGES,
  AUTOMOTIVE_JIT_TEMPLATE,
  AUTOMOTIVE_JIT_TEMPLATE_EDGES,
  PHARMA_REGULATED_TEMPLATE,
  PHARMA_REGULATED_TEMPLATE_EDGES,
  ENERGY_BULK_TEMPLATE,
  ENERGY_BULK_TEMPLATE_EDGES,
  FASHION_SEASONAL_TEMPLATE,
  FASHION_SEASONAL_TEMPLATE_EDGES,
  
  // Product characteristic-specific templates
  HIGH_VALUE_GLOBAL_TEMPLATE,
  HIGH_VALUE_GLOBAL_TEMPLATE_EDGES,
  HAZARDOUS_MATERIALS_TEMPLATE,
  HAZARDOUS_MATERIALS_TEMPLATE_EDGES,
  
  // Geographic & operational templates
  DOMESTIC_REGIONAL_TEMPLATE,
  DOMESTIC_REGIONAL_TEMPLATE_EDGES,
  GLOBAL_NETWORK_TEMPLATE,
  GLOBAL_NETWORK_TEMPLATE_EDGES,
  
  // Supplier tier-specific templates
  TIER1_SIMPLE_TEMPLATE,
  TIER1_SIMPLE_TEMPLATE_EDGES,
  TIER3_COMPLEX_TEMPLATE,
  TIER3_COMPLEX_TEMPLATE_EDGES,
  
  // Legacy templates
  INITIAL_NODES,
  INITIAL_EDGES
} from './templates';

export const NODE_TYPES = [
  { 
    id: 'Supplier', 
    icon: Factory, 
    description: 'Source of raw materials',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'Factory', 
    icon: Building2, 
    description: 'Manufacturing facility',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600'
  },
  { 
    id: 'Port', 
    icon: Ship, 
    description: 'Maritime shipping point',
    color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    iconColor: 'text-cyan-600'
  },
  { 
    id: 'Warehouse', 
    icon: Warehouse, 
    description: 'Storage facility',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    iconColor: 'text-orange-600'
  },
  { 
    id: 'Distribution', 
    icon: Truck, 
    description: 'Distribution center',
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600'
  },
  { 
    id: 'Retailer', 
    icon: Store, 
    description: 'Retail outlet',
    color: 'bg-red-50 border-red-200 hover:bg-red-100',
    iconColor: 'text-red-600'
  }
] as const;

// Master list of node-specific form fields, with UI hints (optional flags, info icons, conditional logic)
export const NODE_PROPERTY_SPECS: Record<NodeType, PropertySpec[]> = {
  supplierNode: [
    { key: 'supplierTier',       type: 'enum',   options: ['tier1', 'tier2', 'tier3+'], label: 'Supplier Tier' },
    { key: 'supplyCapacity',     type: 'number', label: 'Annual Supply Capacity' },
    { key: 'materialType',       type: 'string', label: 'Material / Component Type' },
    { key: 'minOrderQty',        type: 'number', label: 'Min. Order Qty' },
    {
      key: 'reliabilityPct',     type: 'number', label: 'On‑time Reliability (%)',
      optional: true,
      showInfoIcon: true,
      infoText: 'Optional: Percentage of orders delivered on time.'
    },
    // If this node is operated by an external partner, capture their details
    {
      key: 'belongsToExternal',  type: 'boolean', label: 'External Partner Node?',
      showInfoIcon: true,
      infoText: 'Toggle if this node belongs to another company or partner.'
    },
    {
      key: 'externalBusinessName', type: 'string', label: 'External Business Name',
      dependsOn: { key: 'belongsToExternal', value: true }
    },
    {
      key: 'externalBusinessWebsite', type: 'string', label: 'External Business Website',
      dependsOn: { key: 'belongsToExternal', value: true }
    }
  ],

  factoryNode: [
    { key: 'productionCapacity', type: 'number', label: 'Max Output / period' },
    {
      key: 'cycleTime',          type: 'number', label: 'Cycle Time (days/unit)',
      showInfoIcon: true,
      infoText: 'Time taken to produce one unit from raw materials. '
    },
    {
      key: 'shifts',             type: 'enum',   options: ['1', '2', '3'], label: 'Number of Shifts',
      showInfoIcon: true,
      infoText: 'Number of production shifts operating per day.'
    },
    {
      key: 'utilizationPct',     type: 'number', label: 'Avg. Utilization (%)',
      showInfoIcon: true,
      infoText: 'Average percentage of capacity actually used over a period.'
    },
    {
      key: 'yieldRate',          type: 'number', label: 'First‑pass Yield (%)',
      optional: true,
      showInfoIcon: true,
      infoText: 'Optional: Percentage of good units produced without rework.'
    }
  ],

  warehouseNode: [
    { key: 'storageCapacity',    type: 'number', label: 'Total Storage Capacity' },
    { key: 'storageCostPerUnit', type: 'number', label: 'Holding Cost (per unit/day)' },
    {
      key: 'temperatureControl', type: 'boolean', label: 'Temp‑Controlled?',
      showInfoIcon: true,
      infoText: 'Does this warehouse maintain temperature‑controlled storage?'
    },
    {
      key: 'handlingCostPerUnit',type: 'number', label: 'Handling Cost/unit',
      showInfoIcon: true,
      infoText: 'Cost charged per unit for handling and moves within the facility.'
    },
    {
      key: 'throughputCap',      type: 'number', label: 'Max Throughput (units/day)',
      optional: true,
      showInfoIcon: true,
      infoText: 'Optional: Maximum volume of goods that can be processed each day.'
    }
  ],

  distributionNode: [
    {
      key: 'fleetSize',          type: 'number', label: 'Fleet Size (# vehicles)',
      showInfoIcon: true,
      infoText: 'Approximate number of vehicles or transport units available. You can enter an approximate value.'
    },
    {
      key: 'deliveryRangeKm',    type: 'number', label: 'Max Delivery Range (km)',
      showInfoIcon: true,
      infoText: 'Typical maximum distance a single delivery vehicle covers in one trip.'
    },
    { key: 'serviceLevelPct',    type: 'number', label: 'Service Level (%)' },
    { key: 'lastMileCap',        type: 'number', label: 'Last‑mile Cap (units/day)' }
  ],

  portNode: [
    { key: 'annualThroughputTEU', type: 'number', label: 'Throughput (TEU/year)' },
    { key: 'customsTimeDays',     type: 'number', label: 'Customs Delay (days)' },
    { key: 'berthCount',          type: 'number', label: '# of Berths' },
    { key: 'congestionIndex',     type: 'number', label: 'Congestion Score (0–1)' }
  ],

  retailerNode: [
    { key: 'demandRate',         type: 'number', label: 'Avg. Demand (units/day)' },
    { key: 'shelfSpaceCap',      type: 'number', label: 'Shelf Space (units)' },
    { key: 'reorderPoint',       type: 'number', label: 'Reorder Point (units)' },
    { key: 'serviceLevelPct',    type: 'number', label: 'Service Level (%)' }
  ]
};

// Common risk assessment fields that apply to all node types
export const COMMON_RISK_FIELDS: PropertySpec[] = [
  {
    key: 'hasPreKnownRisks',
    type: 'boolean',
    label: 'Are there pre-known risks associated with this node?',
    showInfoIcon: true,
    infoText: 'Toggle if you are aware of specific risks that could affect this node\'s operations.',
    optional: true
  },
  {
    key: 'riskExplanation',
    type: 'textarea',
    label: 'Risk Explanation',
    showInfoIcon: true,
    infoText: 'Describe the specific risks, their potential impact, and any mitigation measures in place.',
    dependsOn: { key: 'hasPreKnownRisks', value: true }
  },
  {
    key: 'riskSeverity',
    type: 'slider',
    label: 'Risk Severity Level',
    min: 1,
    max: 5,
    step: 1,
    defaultValue: 1,
    showInfoIcon: true,
    infoText: 'Rate the severity of the risk from 1 (Low) to 5 (Critical). 1=Low, 2=Minor, 3=Moderate, 4=High, 5=Critical',
    dependsOn: { key: 'hasPreKnownRisks', value: true }
  }
];

// Map node type IDs to property spec keys
export const NODE_TYPE_MAP: Record<string, NodeType> = {
  'Supplier': 'supplierNode',
  'Factory': 'factoryNode',
  'Warehouse': 'warehouseNode',
  'Distribution': 'distributionNode',
  'Port': 'portNode',
  'Retailer': 'retailerNode'
};

// Template selection logic has been moved to lib/template-selector.ts for better separation of concerns

export const SUPPLY_CHAIN_TEMPLATES = [
  { id: 'simple-chain', name: 'Simple Chain', nodes: 3, description: 'Linear supply chain' },
  { id: 'hub-spoke', name: 'Hub and Spoke', nodes: 6, description: 'Centralized distribution' },
  { id: 'network', name: 'Network Mesh', nodes: 8, description: 'Complex interconnected' }
] as const;

// Re-export all templates for backward compatibility
export {
  // Industry-specific templates
  ELECTRONICS_TEMPLATE,
  ELECTRONICS_TEMPLATE_EDGES,
  FOOD_BEVERAGE_COLD_CHAIN_TEMPLATE,
  FOOD_BEVERAGE_COLD_CHAIN_TEMPLATE_EDGES,
  AUTOMOTIVE_JIT_TEMPLATE,
  AUTOMOTIVE_JIT_TEMPLATE_EDGES,
  PHARMA_REGULATED_TEMPLATE,
  PHARMA_REGULATED_TEMPLATE_EDGES,
  ENERGY_BULK_TEMPLATE,
  ENERGY_BULK_TEMPLATE_EDGES,
  FASHION_SEASONAL_TEMPLATE,
  FASHION_SEASONAL_TEMPLATE_EDGES,
  
  // Product characteristic-specific templates
  HIGH_VALUE_GLOBAL_TEMPLATE,
  HIGH_VALUE_GLOBAL_TEMPLATE_EDGES,
  HAZARDOUS_MATERIALS_TEMPLATE,
  HAZARDOUS_MATERIALS_TEMPLATE_EDGES,
  
  // Geographic & operational templates
  DOMESTIC_REGIONAL_TEMPLATE,
  DOMESTIC_REGIONAL_TEMPLATE_EDGES,
  GLOBAL_NETWORK_TEMPLATE,
  GLOBAL_NETWORK_TEMPLATE_EDGES,
  
  // Supplier tier-specific templates
  TIER1_SIMPLE_TEMPLATE,
  TIER1_SIMPLE_TEMPLATE_EDGES,
  TIER3_COMPLEX_TEMPLATE,
  TIER3_COMPLEX_TEMPLATE_EDGES,
  
  // Legacy templates
  INITIAL_NODES,
  INITIAL_EDGES
}; 

// Global choke points for maritime/land trade routes
export const GLOBAL_CHOKEPOINTS = [
  'Suez Canal',
  'Panama Canal',
  'Strait of Malacca',
  'Strait of Hormuz',
  'Strait of Gibraltar',
  'Bosphorus Strait',
  'Dover Strait',
  'Bab-el-Mandeb',
  'Cape of Good Hope',
  'Turkish Straits',
  'Khyber Pass',
  'Brenner Pass',
  'Gotthard Pass',
  'Mont Blanc Tunnel',
  'Channel Tunnel',
  'Singapore Strait'
];

// Dynamic edge property definitions focused on disruption, risk, and chokepoints
export const EDGE_PROPERTY_SPECS: {
  matcher: (src: any, tgt: any, mode: string, meta?: any) => boolean;
  fields: PropertySpec[];
}[] = [
  // Base user risk inputs for all edges
  {
    matcher: () => true,
    fields: [
      {
        key: 'avgDelayDays', 
        type: 'number',
        label: 'Avg. Historical Delay (days)', 
        optional: true,
        showInfoIcon: true,
        infoText: 'Typical delay experienced on this leg.',
        defaultValue: 0
      },
      {
        key: 'frequencyOfDisruptions',
        type: 'number',
        label: 'Disruptions per Year',
        optional: true,
        showInfoIcon: true,
        infoText: 'Approximate number of severe disruptions annually.',
        defaultValue: 0
      }
    ]
  },

  // Availability of rerouting options if disrupted
  {
    matcher: () => true,
    fields: [
      {
        key: 'hasAltRoute',
        type: 'boolean',
        label: 'Alternative Route Options',
        optional: true,
        showInfoIcon: true,
        infoText: 'Does this route have viable alternative paths?'
      },
      {
        key: 'altRouteDetails',
        type: 'textarea',
        label: 'Alternative Routes (comma separated)',
        optional: true,
        showInfoIcon: true,
        infoText: 'Describe the alternative routes available for this leg.',
        dependsOn: { key: 'hasAltRoute', value: true }
      }
    ]
  },

  // Key chokepoint or global trade corridor exposure 
  {
    matcher: () => true,
    fields: [
      {
        key: 'passesThroughChokepoint',
        type: 'boolean',
        label: 'Passes Through Global Chokepoint',
        optional: true,
        showInfoIcon: true,
        infoText: 'Does this route pass through any major global trade chokepoints?'
      },
      {
        key: 'chokepointNames',
        type: 'multiselect',
        label: 'Global Chokepoints',
        options: GLOBAL_CHOKEPOINTS,
        optional: true,
        showInfoIcon: true,
        infoText: 'Select all global chokepoints this route passes through.',
        placeholder: 'Select chokepoints...',
        dependsOn: { key: 'passesThroughChokepoint', value: true }
      }
    ]
  }
]; 