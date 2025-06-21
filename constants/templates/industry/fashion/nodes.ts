import { Node } from 'reactflow';

// Use when: industry = "Apparel, Textiles & Fashion" AND productCharacteristics includes "seasonal"
// Characteristics: Seasonal, Global operations, Tier 2-3 suppliers, Sea shipping
// Typical risks: Weather/disaster, Carrier capacity, Currency/commodity
export const FASHION_SEASONAL_TEMPLATE: Node[] = [
  {
    id: 'cotton-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Cotton Farm',
      description: 'Tier 3 organic cotton supplier',
      type: 'Supplier',
      capacity: 10000,
      leadTime: 90,
      riskScore: 0.6,
      location: { lat: 24.774, lng: 67.030 },
      address: 'Karachi Cotton Farms, Pakistan'
    },
    position: { x: 100, y: 80 },
  },
  {
    id: 'textile-mill-1',
    type: 'factoryNode',
    data: {
      label: 'Textile Mill',
      description: 'Tier 2 fabric production facility',
      type: 'Factory',
      capacity: 50000,
      leadTime: 30,
      riskScore: 0.4,
      location: { lat: 23.810, lng: 90.412 },
      address: 'Dhaka Textile Mills, Bangladesh'
    },
    position: { x: 400, y: 120 },
  },
  {
    id: 'garment-factory-1',
    type: 'factoryNode',
    data: {
      label: 'Garment Factory',
      description: 'Tier 1 final garment assembly',
      type: 'Factory',
      capacity: 25000,
      leadTime: 21,
      riskScore: 0.3,
      location: { lat: 10.823, lng: 106.629 },
      address: 'Ho Chi Minh Garment Factory, Vietnam'
    },
    position: { x: 700, y: 160 },
  },
  {
    id: 'shipping-port-1',
    type: 'portNode',
    data: {
      label: 'Ho Chi Minh Port',
      description: 'Container shipping to global markets',
      type: 'Port',
      capacity: 80000,
      leadTime: 3,
      riskScore: 0.3,
      location: { lat: 10.762, lng: 106.682 },
      address: 'Saigon Port, Vietnam'
    },
    position: { x: 1000, y: 140 },
  },
  {
    id: 'seasonal-warehouse-1',
    type: 'warehouseNode',
    data: {
      label: 'Seasonal DC',
      description: 'Pre-season inventory buildup facility',
      type: 'Warehouse',
      capacity: 100000,
      leadTime: 14,
      riskScore: 0.2,
      location: { lat: 33.942, lng: -118.408 },
      address: 'Los Angeles Fashion District, CA'
    },
    position: { x: 1300, y: 100 },
  },
  {
    id: 'retail-distribution-2',
    type: 'distributionNode',
    data: {
      label: 'Fast Fashion Retail',
      description: 'Rapid distribution to retail chains',
      type: 'Distribution',
      capacity: 30000,
      leadTime: 7,
      riskScore: 0.5,
      location: { lat: 40.748, lng: -73.985 },
      address: 'New York Fashion Week, NY'
    },
    position: { x: 1600, y: 180 },
  }
]; 