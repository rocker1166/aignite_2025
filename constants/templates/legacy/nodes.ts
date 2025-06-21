import { Node } from 'reactflow';

// Legacy templates for backward compatibility
export const INITIAL_NODES: Node[] = [
  {
    id: 'supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Tier 1 Electronics Supplier',
      type: 'Supplier',
      location: 'Taiwan',
      leadTime: 14,
      riskScore: 0.8,
      capacity: 10000,
      address: 'No. 1, Minzu Road, Hsinchu Science Park, Hsinchu, Taiwan'
    },
    position: { x: 50, y: 150 },
  },
  {
    id: 'factory-1',
    type: 'factoryNode',
    data: {
      label: 'Assembly Plant',
      type: 'Factory',
      location: 'Shenzhen, China',
      leadTime: 7,
      riskScore: 0.6,
      capacity: 5000,
      address: 'No. 101, Longhua District, Shenzhen, Guangdong, China'
    },
    position: { x: 300, y: 250 },
  },
  {
    id: 'port-1',
    type: 'portNode',
    data: {
      label: 'Port of Shenzhen',
      type: 'Port',
      location: 'Shenzhen, China',
      leadTime: 3,
      riskScore: 0.4,
      capacity: 100000,
      address: 'Yantian Port, Shenzhen, Guangdong, China'
    },
    position: { x: 550, y: 150 },
  },
  {
    id: 'warehouse-1',
    type: 'warehouseNode',
    data: {
      label: 'US West Coast Distribution',
      type: 'Warehouse',
      location: 'Los Angeles, USA',
      leadTime: 2,
      riskScore: 0.2,
      capacity: 20000,
      address: '1234 E. Warehouse St, Los Angeles, CA 90001'
    },
    position: { x: 800, y: 250 },
  },
  {
    id: 'distribution-1',
    type: 'distributionNode',
    data: {
      label: 'National Retail Distribution',
      type: 'Distribution',
      location: 'Chicago, USA',
      leadTime: 3,
      riskScore: 0.3,
      capacity: 15000,
      address: '5678 S. Distribution Ave, Chicago, IL 60601'
    },
    position: { x: 1050, y: 150 },
  }
]; 