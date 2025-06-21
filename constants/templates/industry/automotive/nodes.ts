import { Node } from 'reactflow';

// Use when: industry = "Automotive & Transportation"
// Characteristics: Tier 3+ suppliers, High volumes, Global operations, Just-in-time
// Typical risks: Supplier concentration, Labor strikes, Carrier capacity
export const AUTOMOTIVE_JIT_TEMPLATE: Node[] = [
  {
    id: 'steel-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Steel Supplier',
      description: 'Tier 3 raw steel supplier',
      type: 'Supplier',
      capacity: 100000,
      leadTime: 30,
      riskScore: 0.3,
      location: { lat: 41.878, lng: -87.629 },
      address: 'Chicago Steel Works, IL'
    },
    position: { x: 100, y: 80 },
  },
  {
    id: 'parts-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Parts Manufacturer',
      description: 'Tier 2 engine parts supplier',
      type: 'Supplier',
      capacity: 50000,
      leadTime: 14,
      riskScore: 0.2,
      location: { lat: 42.331, lng: -83.045 },
      address: 'Detroit Parts Manufacturing, MI'
    },
    position: { x: 100, y: 200 },
  },
  {
    id: 'component-supplier-2',
    type: 'supplierNode',
    data: {
      label: 'Electronics Supplier',
      description: 'Tier 1 automotive electronics',
      type: 'Supplier',
      capacity: 25000,
      leadTime: 7,
      riskScore: 0.4,
      location: { lat: 39.739, lng: -121.302 },
      address: 'Silicon Valley Auto Tech, CA'
    },
    position: { x: 100, y: 320 },
  },
  {
    id: 'assembly-plant-1',
    type: 'factoryNode',
    data: {
      label: 'Assembly Plant',
      description: 'Final vehicle assembly with JIT delivery',
      type: 'Factory',
      capacity: 1000,
      leadTime: 1,
      riskScore: 0.1,
      location: { lat: 36.084, lng: -86.660 },
      address: 'Nashville Assembly Plant, TN'
    },
    position: { x: 500, y: 200 },
  },
  {
    id: 'staging-warehouse-1',
    type: 'warehouseNode',
    data: {
      label: 'Parts Staging',
      description: 'JIT sequencing and staging facility',
      type: 'Warehouse',
      capacity: 5000,
      leadTime: 0.5,
      riskScore: 0.1,
      location: { lat: 36.100, lng: -86.700 },
      address: 'Assembly Staging, TN'
    },
    position: { x: 350, y: 150 },
  },
  {
    id: 'dealership-distribution-1',
    type: 'distributionNode',
    data: {
      label: 'Dealership Network',
      description: 'Regional dealership distribution',
      type: 'Distribution',
      capacity: 2000,
      leadTime: 7,
      riskScore: 0.2,
      location: { lat: 35.207, lng: -80.831 },
      address: 'Southeast Dealerships, NC'
    },
    position: { x: 750, y: 200 },
  }
]; 