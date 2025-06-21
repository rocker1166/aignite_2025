import { Node } from 'reactflow';

// Use when: supplierTiers = "tier3plus"
// Characteristics: Complex multi-tier network, Deep supply chain visibility needed
// Typical risks: Supplier concentration, Political/regulatory, Cybersecurity
export const TIER3_COMPLEX_TEMPLATE: Node[] = [
  {
    id: 'raw-material-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Raw Material Supplier',
      description: 'Tier 3 raw material extraction and processing',
      type: 'Supplier',
      capacity: 200000,
      leadTime: 45,
      riskScore: 0.6,
      location: { lat: -23.550, lng: -46.633 },
      address: 'São Paulo Raw Materials, Brazil'
    },
    position: { x: 100, y: 80 },
  },
  {
    id: 'intermediate-processor-1',
    type: 'supplierNode',
    data: {
      label: 'Intermediate Processor',
      description: 'Tier 2 component manufacturing and processing',
      type: 'Supplier',
      capacity: 80000,
      leadTime: 30,
      riskScore: 0.4,
      location: { lat: 28.613, lng: 77.209 },
      address: 'New Delhi Processing, India'
    },
    position: { x: 400, y: 120 },
  },
  {
    id: 'sub-assembly-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Sub-Assembly Supplier',
      description: 'Tier 1 sub-component assembly',
      type: 'Supplier',
      capacity: 40000,
      leadTime: 14,
      riskScore: 0.3,
      location: { lat: 22.543, lng: 114.057 },
      address: 'Shenzhen Sub-Assembly, China'
    },
    position: { x: 700, y: 160 },
  },
  {
    id: 'final-assembly-2',
    type: 'factoryNode',
    data: {
      label: 'Final Assembly',
      description: 'Complex final product assembly',
      type: 'Factory',
      capacity: 15000,
      leadTime: 7,
      riskScore: 0.2,
      location: { lat: 37.774, lng: -122.419 },
      address: 'San Francisco Assembly, CA'
    },
    position: { x: 1000, y: 200 },
  },
  {
    id: 'quality-control-hub',
    type: 'warehouseNode',
    data: {
      label: 'Quality Control Hub',
      description: 'Multi-tier quality assurance and testing',
      type: 'Warehouse',
      capacity: 10000,
      leadTime: 5,
      riskScore: 0.1,
      location: { lat: 33.748, lng: -84.387 },
      address: 'Atlanta QC Hub, GA'
    },
    position: { x: 1300, y: 150 },
  },
  {
    id: 'global-distribution-2',
    type: 'distributionNode',
    data: {
      label: 'Global Distribution',
      description: 'Worldwide distribution network coordination',
      type: 'Distribution',
      capacity: 25000,
      leadTime: 10,
      riskScore: 0.3,
      location: { lat: 25.761, lng: -80.191 },
      address: 'Miami Global Distribution, FL'
    },
    position: { x: 1600, y: 220 },
  }
]; 