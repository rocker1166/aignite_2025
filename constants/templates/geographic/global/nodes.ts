import { Node } from 'reactflow';

// Use when: operationsLocation includes multiple regions (na, eu, apac)
// Characteristics: Complex global network, Multiple shipping methods
// Typical risks: Political/regulatory, Currency/commodity, Carrier capacity
export const GLOBAL_NETWORK_TEMPLATE: Node[] = [
  {
    id: 'asia-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Asian Supplier',
      description: 'Primary APAC supplier hub',
      type: 'Supplier',
      capacity: 100000,
      leadTime: 21,
      riskScore: 0.4,
      location: { lat: 31.230, lng: 121.473 },
      address: 'Shanghai Manufacturing Hub, China'
    },
    position: { x: 100, y: 80 },
  },
  {
    id: 'europe-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'European Supplier',
      description: 'EU regional supplier',
      type: 'Supplier',
      capacity: 50000,
      leadTime: 14,
      riskScore: 0.2,
      location: { lat: 52.520, lng: 13.404 },
      address: 'Berlin Industrial Zone, Germany'
    },
    position: { x: 100, y: 200 },
  },
  {
    id: 'na-supplier-1',
    type: 'supplierNode',
    data: {
      label: 'North American Supplier',
      description: 'NAFTA region supplier',
      type: 'Supplier',
      capacity: 40000,
      leadTime: 10,
      riskScore: 0.1,
      location: { lat: 19.432, lng: -99.133 },
      address: 'Mexico City Manufacturing, Mexico'
    },
    position: { x: 100, y: 320 },
  },
  {
    id: 'asia-port-hub',
    type: 'portNode',
    data: {
      label: 'Singapore Hub',
      description: 'APAC shipping and logistics hub',
      type: 'Port',
      capacity: 200000,
      leadTime: 2,
      riskScore: 0.3,
      location: { lat: 1.290, lng: 103.851 },
      address: 'Singapore Port Authority, Singapore'
    },
    position: { x: 400, y: 100 },
  },
  {
    id: 'europe-port-hub',
    type: 'portNode',
    data: {
      label: 'Rotterdam Hub',
      description: 'European logistics gateway',
      type: 'Port',
      capacity: 150000,
      leadTime: 1,
      riskScore: 0.2,
      location: { lat: 51.924, lng: 4.477 },
      address: 'Port of Rotterdam, Netherlands'
    },
    position: { x: 400, y: 200 },
  },
  {
    id: 'na-port-hub',
    type: 'portNode',
    data: {
      label: 'Los Angeles Hub',
      description: 'North American Pacific gateway',
      type: 'Port',
      capacity: 180000,
      leadTime: 1,
      riskScore: 0.3,
      location: { lat: 33.739, lng: -118.262 },
      address: 'Port of Los Angeles, CA'
    },
    position: { x: 400, y: 320 },
  },
  {
    id: 'global-coordination-1',
    type: 'warehouseNode',
    data: {
      label: 'Global Coordination Center',
      description: 'Central planning and coordination hub',
      type: 'Warehouse',
      capacity: 75000,
      leadTime: 7,
      riskScore: 0.2,
      location: { lat: 40.748, lng: -73.985 },
      address: 'New York Global HQ, NY'
    },
    position: { x: 700, y: 200 },
  },
  {
    id: 'regional-dc-apac',
    type: 'distributionNode',
    data: {
      label: 'APAC Distribution',
      description: 'Asia-Pacific regional distribution',
      type: 'Distribution',
      capacity: 30000,
      leadTime: 5,
      riskScore: 0.4,
      location: { lat: 35.689, lng: 139.691 },
      address: 'Tokyo Distribution Center, Japan'
    },
    position: { x: 1000, y: 80 },
  },
  {
    id: 'regional-dc-eu',
    type: 'distributionNode',
    data: {
      label: 'EU Distribution',
      description: 'European Union distribution network',
      type: 'Distribution',
      capacity: 25000,
      leadTime: 4,
      riskScore: 0.2,
      location: { lat: 48.856, lng: 2.352 },
      address: 'Paris Distribution Hub, France'
    },
    position: { x: 1000, y: 200 },
  },
  {
    id: 'regional-dc-na',
    type: 'distributionNode',
    data: {
      label: 'NA Distribution',
      description: 'North American distribution network',
      type: 'Distribution',
      capacity: 35000,
      leadTime: 3,
      riskScore: 0.1,
      location: { lat: 41.878, lng: -87.629 },
      address: 'Chicago Distribution Center, IL'
    },
    position: { x: 1000, y: 320 },
  }
]; 