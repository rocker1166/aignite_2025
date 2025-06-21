import { Node } from 'reactflow';

// Use when: industry = "Energy & Utilities" AND productCharacteristics includes "bulk"
// Characteristics: Bulk commodities, Domestic/regional, Sea/Rail shipping
// Typical risks: Weather/disaster, Currency/commodity, Political/regulatory
export const ENERGY_BULK_TEMPLATE: Node[] = [
  {
    id: 'mining-operation-1',
    type: 'supplierNode',
    data: {
      label: 'Coal Mine',
      description: 'Large-scale coal extraction operation',
      type: 'Supplier',
      capacity: 500000,
      leadTime: 7,
      riskScore: 0.5,
      location: { lat: 39.249, lng: -81.633 },
      address: 'Appalachian Coal Mine, WV'
    },
    position: { x: 150, y: 120 },
  },
  {
    id: 'rail-terminal-1',
    type: 'warehouseNode',
    data: {
      label: 'Rail Loading Terminal',
      description: 'Bulk commodity rail loading facility',
      type: 'Warehouse',
      capacity: 200000,
      leadTime: 2,
      riskScore: 0.3,
      location: { lat: 40.440, lng: -79.995 },
      address: 'Pittsburgh Rail Terminal, PA'
    },
    position: { x: 400, y: 150 },
  },
  {
    id: 'power-plant-1',
    type: 'factoryNode',
    data: {
      label: 'Power Generation Plant',
      description: 'Coal-fired electricity generation facility',
      type: 'Factory',
      capacity: 50000,
      leadTime: 1,
      riskScore: 0.2,
      location: { lat: 41.881, lng: -87.623 },
      address: 'Chicago Power Plant, IL'
    },
    position: { x: 700, y: 180 },
  },
  {
    id: 'grid-distribution-1',
    type: 'distributionNode',
    data: {
      label: 'Electrical Grid',
      description: 'Regional electrical distribution network',
      type: 'Distribution',
      capacity: 100000,
      leadTime: 0,
      riskScore: 0.4,
      location: { lat: 41.878, lng: -87.629 },
      address: 'Midwest Grid Network, IL'
    },
    position: { x: 950, y: 150 },
  }
]; 