import { Edge } from 'reactflow';

// Tier 1 Simple Template Edges
export const TIER1_SIMPLE_TEMPLATE_EDGES: Edge[] = [
  {
    id: 'e-tier1-assembly',
    source: 'tier1-supplier-1',
    target: 'assembly-facility-2',
    data: {
      mode: 'road',
      cost: 300,
      transitTime: 1,
      riskMultiplier: 1.0
    }
  },
  {
    id: 'e-assembly-distribution',
    source: 'assembly-facility-2',
    target: 'distribution-center-2',
    data: {
      mode: 'road',
      cost: 200,
      transitTime: 1,
      riskMultiplier: 1.1
    }
  }
]; 