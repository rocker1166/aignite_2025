import { Node } from 'reactflow';

// Use when: supplierTiers = "tier1"
// Characteristics: Simple linear supply chain, Direct relationships
// Typical risks: Supplier concentration, Quality/compliance
export const TIER1_SIMPLE_TEMPLATE: Node[] = [
  {
    id: 'tier1-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Tier 1 Supplier',
      description: 'Direct supplier with complete component assembly',
      type: 'Supplier',
      capacity: 25000,
      leadTime: 10,
      riskScore: 0.2,
      location: { lat: 42.331, lng: -83.045 },
      address: 'Detroit Tier 1 Supplier, MI'
    },
    position: { x: 200, y: 150 },
  },
  {
    id: 'assembly-facility-2',
    type: 'factoryNode',
    data: {
      label: 'Assembly Facility',
      description: 'Final product assembly and testing',
      type: 'Factory',
      capacity: 20000,
      leadTime: 3,
      riskScore: 0.1,
      location: { lat: 41.878, lng: -87.629 },
      address: 'Chicago Assembly Plant, IL'
    },
    position: { x: 600, y: 150 },
  },
  {
    id: 'distribution-center-2',
    type: 'warehouseNode',
    data: {
      label: 'Distribution Center',
      description: 'Finished goods distribution',
      type: 'Warehouse',
      capacity: 15000,
      leadTime: 2,
      riskScore: 0.1,
      location: { lat: 39.961, lng: -82.998 },
      address: 'Columbus Distribution, OH'
    },
    position: { x: 1000, y: 150 },
  }
]; 