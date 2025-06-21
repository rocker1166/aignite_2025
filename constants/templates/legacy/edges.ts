import { Edge } from 'reactflow';

// Legacy template edges for backward compatibility
export const INITIAL_EDGES: Edge[] = [
  {
    id: 'e1-2',
    source: 'supplier-1',
    target: 'factory-1',
    data: {
      mode: 'rail',
      cost: 200,
      transitTime: 5,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e2-3',
    source: 'factory-1',
    target: 'port-1',
    data: {
      mode: 'road',
      cost: 150,
      transitTime: 2,
      riskMultiplier: 1.0
    }
  }
]; 