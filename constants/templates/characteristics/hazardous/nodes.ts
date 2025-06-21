import { Node } from 'reactflow';

// Use when: productCharacteristics includes "hazardous"
// Characteristics: Hazardous/DG, Specialized handling, Compliance-focused
// Typical risks: Quality/compliance, Political/regulatory, Weather/disaster
export const HAZARDOUS_MATERIALS_TEMPLATE: Node[] = [
  {
    id: 'chemical-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Chemical Supplier',
      description: 'Licensed hazardous materials supplier',
      type: 'Supplier',
      capacity: 5000,
      leadTime: 21,
      riskScore: 0.7,
      location: { lat: 29.749, lng: -95.358 },
      address: 'Houston Chemical Complex, TX'
    },
    position: { x: 150, y: 120 },
  },
  {
    id: 'hazmat-facility-1',
    type: 'factoryNode',
    data: {
      label: 'HAZMAT Processing',
      description: 'Specialized hazardous materials processing',
      type: 'Factory',
      capacity: 2000,
      leadTime: 14,
      riskScore: 0.5,
      location: { lat: 30.266, lng: -97.743 },
      address: 'Austin HAZMAT Facility, TX'
    },
    position: { x: 450, y: 150 },
  },
  {
    id: 'certified-warehouse-1',
    type: 'warehouseNode',
    data: {
      label: 'Certified Storage',
      description: 'DOT-certified hazardous materials storage',
      type: 'Warehouse',
      capacity: 8000,
      leadTime: 7,
      riskScore: 0.4,
      location: { lat: 32.776, lng: -96.796 },
      address: 'Dallas Certified Storage, TX'
    },
    position: { x: 750, y: 120 },
  },
  {
    id: 'specialized-transport-1',
    type: 'distributionNode',
    data: {
      label: 'HAZMAT Transport',
      description: 'Specialized hazardous materials transport',
      type: 'Distribution',
      capacity: 1000,
      leadTime: 3,
      riskScore: 0.6,
      location: { lat: 39.739, lng: -104.990 },
      address: 'Denver HAZMAT Transport, CO'
    },
    position: { x: 1050, y: 180 },
  }
]; 