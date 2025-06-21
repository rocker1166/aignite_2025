import { Node } from 'reactflow';

// Use when: operationsLocation includes "domestic" only
// Characteristics: Simplified regional supply chain, Road/Rail shipping
// Typical risks: Weather/disaster, Labor strikes, Carrier capacity
export const DOMESTIC_REGIONAL_TEMPLATE: Node[] = [
  {
    id: 'regional-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Regional Supplier',
      description: 'Local supplier within 500 miles',
      type: 'Supplier',
      capacity: 15000,
      leadTime: 7,
      riskScore: 0.2,
      location: { lat: 41.878, lng: -87.629 },
      address: 'Chicago Regional Supplier, IL'
    },
    position: { x: 200, y: 120 },
  },
  {
    id: 'central-manufacturing-1',
    type: 'factoryNode',
    data: {
      label: 'Central Manufacturing',
      description: 'Main production facility',
      type: 'Factory',
      capacity: 20000,
      leadTime: 5,
      riskScore: 0.1,
      location: { lat: 39.961, lng: -82.998 },
      address: 'Columbus Manufacturing, OH'
    },
    position: { x: 500, y: 150 },
  },
  {
    id: 'regional-dc-1',
    type: 'warehouseNode',
    data: {
      label: 'Regional DC',
      description: 'Central distribution hub',
      type: 'Warehouse',
      capacity: 30000,
      leadTime: 3,
      riskScore: 0.1,
      location: { lat: 39.103, lng: -84.512 },
      address: 'Cincinnati Distribution, OH'
    },
    position: { x: 800, y: 120 },
  },
  {
    id: 'local-distribution-1',
    type: 'distributionNode',
    data: {
      label: 'Local Distribution',
      description: 'Last-mile delivery network',
      type: 'Distribution',
      capacity: 10000,
      leadTime: 2,
      riskScore: 0.2,
      location: { lat: 36.165, lng: -86.784 },
      address: 'Nashville Local Delivery, TN'
    },
    position: { x: 1100, y: 180 },
  }
]; 