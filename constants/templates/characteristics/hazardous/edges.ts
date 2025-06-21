import { Edge } from 'reactflow';

// Hazardous Materials Template Edges
export const HAZARDOUS_MATERIALS_TEMPLATE_EDGES: Edge[] = [
  {
    id: 'e-chemical-hazmat',
    source: 'chemical-supplier-1',
    target: 'hazmat-facility-1',
    data: {
      mode: 'road',
      cost: 800,
      transitTime: 1,
      riskMultiplier: 1.8
    }
  },
  {
    id: 'e-hazmat-storage',
    source: 'hazmat-facility-1',
    target: 'certified-warehouse-1',
    data: {
      mode: 'road',
      cost: 400,
      transitTime: 2,
      riskMultiplier: 1.6
    }
  },
  {
    id: 'e-storage-transport',
    source: 'certified-warehouse-1',
    target: 'specialized-transport-1',
    data: {
      mode: 'road',
      cost: 600,
      transitTime: 3,
      riskMultiplier: 1.7
    }
  }
]; 