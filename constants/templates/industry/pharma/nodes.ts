import { Node } from 'reactflow';

// Use when: industry = "Pharma & Life Sciences" AND productCharacteristics includes "regulated"
// Characteristics: Regulated, High-value, Global operations, Air shipping for urgency
// Typical risks: Political/regulatory, Quality/compliance, Cybersecurity
export const PHARMA_REGULATED_TEMPLATE: Node[] = [
  {
    id: 'api-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'API Manufacturer',
      description: 'FDA-approved Active Pharmaceutical Ingredients',
      type: 'Supplier',
      capacity: 1000,
      leadTime: 45,
      riskScore: 0.6,
      location: { lat: 19.076, lng: 72.877 },
      address: 'Mumbai Pharma Complex, India'
    },
    position: { x: 150, y: 100 },
  },
  {
    id: 'manufacturing-1',
    type: 'factoryNode',
    data: {
      label: 'GMP Manufacturing',
      description: 'Good Manufacturing Practice certified facility',
      type: 'Factory',
      capacity: 5000,
      leadTime: 21,
      riskScore: 0.2,
      location: { lat: 40.014, lng: -74.723 },
      address: 'New Jersey Pharma Plant, NJ'
    },
    position: { x: 500, y: 150 },
  },
  {
    id: 'qa-facility-1',
    type: 'warehouseNode',
    data: {
      label: 'QA/QC Warehouse',
      description: 'Quality assurance and regulatory compliance hub',
      type: 'Warehouse',
      capacity: 2000,
      leadTime: 14,
      riskScore: 0.3,
      location: { lat: 39.952, lng: -75.165 },
      address: 'Philadelphia QA Center, PA'
    },
    position: { x: 750, y: 120 },
  },
  {
    id: 'specialty-distribution-1',
    type: 'distributionNode',
    data: {
      label: 'Specialty Pharmacy',
      description: 'Temperature-controlled specialty distribution',
      type: 'Distribution',
      capacity: 500,
      leadTime: 2,
      riskScore: 0.4,
      location: { lat: 41.878, lng: -87.629 },
      address: 'Chicago Specialty Pharma, IL'
    },
    position: { x: 1000, y: 180 },
  }
]; 