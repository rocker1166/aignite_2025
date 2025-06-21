import { Node } from 'reactflow';

// Use when: industry = "Food & Beverage" AND productCharacteristics includes "perishable"
// Characteristics: Cold-chain, Regional operations, Tier 1-2 suppliers, Road/Rail shipping
// Typical risks: Weather/disaster, Quality/compliance, Carrier capacity
export const FOOD_BEVERAGE_COLD_CHAIN_TEMPLATE: Node[] = [
  {
    id: 'farm-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Organic Farm',
      description: 'Fresh produce supplier with cold storage',
      type: 'Supplier',
      capacity: 5000,
      leadTime: 1,
      riskScore: 0.5,
      location: { lat: 36.778, lng: -119.417 },
      address: 'Central Valley Farms, CA'
    },
    position: { x: 150, y: 100 },
  },
  {
    id: 'processing-facility-1',
    type: 'factoryNode',
    data: {
      label: 'Processing Plant',
      description: 'Food processing with HACCP compliance',
      type: 'Factory',
      capacity: 8000,
      leadTime: 2,
      riskScore: 0.3,
      location: { lat: 37.421, lng: -122.084 },
      address: 'Mountain View Processing, CA'
    },
    position: { x: 500, y: 150 },
  },
  {
    id: 'cold-warehouse-1',
    type: 'warehouseNode',
    data: {
      label: 'Cold Storage DC',
      description: 'Temperature-controlled distribution center',
      type: 'Warehouse',
      capacity: 12000,
      leadTime: 1,
      riskScore: 0.2,
      location: { lat: 37.774, lng: -122.419 },
      address: 'San Francisco Cold Storage, CA'
    },
    position: { x: 850, y: 120 },
  },
  {
    id: 'regional-distribution-1',
    type: 'distributionNode',
    data: {
      label: 'Regional Distribution',
      description: 'Last-mile cold chain delivery',
      type: 'Distribution',
      capacity: 3000,
      leadTime: 1,
      riskScore: 0.4,
      location: { lat: 37.687, lng: -122.470 },
      address: 'Bay Area Distribution, CA'
    },
    position: { x: 1200, y: 180 },
  }
]; 