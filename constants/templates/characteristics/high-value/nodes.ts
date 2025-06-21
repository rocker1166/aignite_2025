import { Node } from 'reactflow';

// Use when: productCharacteristics includes "high_value" AND operationsLocation includes multiple regions
// Characteristics: High-value/Low-volume, Air shipping, Security-focused
// Typical risks: Cybersecurity, Political/regulatory, Quality/compliance
export const HIGH_VALUE_GLOBAL_TEMPLATE: Node[] = [
  {
    id: 'luxury-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Luxury Component Supplier',
      description: 'High-end materials with premium quality',
      type: 'Supplier',
      capacity: 1000,
      leadTime: 14,
      riskScore: 0.3,
      location: { lat: 45.764, lng: 4.835 },
      address: 'Lyon Luxury District, France'
    },
    position: { x: 200, y: 100 },
  },
  {
    id: 'secure-facility-1',
    type: 'factoryNode',
    data: {
      label: 'Secure Assembly',
      description: 'High-security manufacturing with quality controls',
      type: 'Factory',
      capacity: 500,
      leadTime: 7,
      riskScore: 0.1,
      location: { lat: 47.608, lng: -122.335 },
      address: 'Seattle Secure Facility, WA'
    },
    position: { x: 500, y: 150 },
  },
  {
    id: 'air-freight-hub-1',
    type: 'portNode',
    data: {
      label: 'Air Freight Hub',
      description: 'Express air shipping for high-value goods',
      type: 'Port',
      capacity: 5000,
      leadTime: 1,
      riskScore: 0.2,
      location: { lat: 35.047, lng: -106.061 },
      address: 'Albuquerque Air Cargo, NM'
    },
    position: { x: 800, y: 120 },
  },
  {
    id: 'premium-distribution-1',
    type: 'distributionNode',
    data: {
      label: 'Premium Distribution',
      description: 'White-glove delivery service',
      type: 'Distribution',
      capacity: 200,
      leadTime: 2,
      riskScore: 0.4,
      location: { lat: 40.748, lng: -73.985 },
      address: 'Manhattan Premium Service, NY'
    },
    position: { x: 1100, y: 180 },
  }
]; 