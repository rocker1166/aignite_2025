import { Factory, Truck, Warehouse, Ship, Building2 } from 'lucide-react';
import { Node, Edge } from 'reactflow';

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
  }
] as const;

// ============================================================================
// TEMPLATE MAPPING FUNCTION
// ============================================================================

export interface SupplyChainFormData {
  industry: string;
  productCharacteristics: string[];
  supplierTiers: string;
  operationsLocation: string[];
  shippingMethods: string[];
  risks: string[];
}

export interface TemplateData {
  nodes: Node[];
  edges: Edge[];
}

export function getRecommendedTemplate(formData: SupplyChainFormData): TemplateData {
  const { industry, productCharacteristics, supplierTiers, operationsLocation, shippingMethods, risks } = formData;

  // Priority 1: Industry-specific templates with product characteristics
  if (industry === "Electronics & High Tech") {
    return { nodes: ELECTRONICS_TEMPLATE, edges: ELECTRONICS_TEMPLATE_EDGES };
  }
  
  if (industry === "Food & Beverage" && productCharacteristics.includes("perishable")) {
    return { nodes: FOOD_BEVERAGE_COLD_CHAIN_TEMPLATE, edges: FOOD_BEVERAGE_COLD_CHAIN_TEMPLATE_EDGES };
  }
  
  if (industry === "Automotive & Transportation") {
    return { nodes: AUTOMOTIVE_JIT_TEMPLATE, edges: AUTOMOTIVE_JIT_TEMPLATE_EDGES };
  }
  
  if (industry === "Pharma & Life Sciences" && productCharacteristics.includes("regulated")) {
    return { nodes: PHARMA_REGULATED_TEMPLATE, edges: PHARMA_REGULATED_TEMPLATE_EDGES };
  }
  
  if (industry === "Energy & Utilities" && productCharacteristics.includes("bulk")) {
    return { nodes: ENERGY_BULK_TEMPLATE, edges: ENERGY_BULK_TEMPLATE_EDGES };
  }
  
  if (industry === "Apparel, Textiles & Fashion" && productCharacteristics.includes("seasonal")) {
    return { nodes: FASHION_SEASONAL_TEMPLATE, edges: FASHION_SEASONAL_TEMPLATE_EDGES };
  }

  // Priority 2: Product characteristic-specific templates
  if (productCharacteristics.includes("high_value") && operationsLocation.length > 1) {
    return { nodes: HIGH_VALUE_GLOBAL_TEMPLATE, edges: HIGH_VALUE_GLOBAL_TEMPLATE_EDGES };
  }
  
  if (productCharacteristics.includes("hazardous")) {
    return { nodes: HAZARDOUS_MATERIALS_TEMPLATE, edges: HAZARDOUS_MATERIALS_TEMPLATE_EDGES };
  }

  // Priority 3: Geographic and operational complexity
  if (operationsLocation.includes("domestic") && operationsLocation.length === 1) {
    return { nodes: DOMESTIC_REGIONAL_TEMPLATE, edges: DOMESTIC_REGIONAL_TEMPLATE_EDGES };
  }
  
  if (operationsLocation.length > 2) {
    return { nodes: GLOBAL_NETWORK_TEMPLATE, edges: GLOBAL_NETWORK_TEMPLATE_EDGES };
  }

  // Priority 4: Supplier tier complexity
  if (supplierTiers === "tier1") {
    return { nodes: TIER1_SIMPLE_TEMPLATE, edges: TIER1_SIMPLE_TEMPLATE_EDGES };
  }
  
  if (supplierTiers === "tier3plus") {
    return { nodes: TIER3_COMPLEX_TEMPLATE, edges: TIER3_COMPLEX_TEMPLATE_EDGES };
  }

  // Default fallback
  return { nodes: INITIAL_NODES, edges: INITIAL_EDGES };
}

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