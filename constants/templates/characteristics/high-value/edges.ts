import { Edge } from 'reactflow';

// High Value Global Template Edges
export const HIGH_VALUE_GLOBAL_TEMPLATE_EDGES: Edge[] = [
  {
    id: 'e-luxury-secure',
    source: 'luxury-supplier-1',
    target: 'secure-facility-1',
    data: {
      mode: 'air',
      cost: 1500,
      transitTime: 1,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e-secure-air',
    source: 'secure-facility-1',
    target: 'air-freight-hub-1',
    data: {
      mode: 'road',
      cost: 300,
      transitTime: 0.5,
      riskMultiplier: 1.1
    }
  },
  {
    id: 'e-air-premium',
    source: 'air-freight-hub-1',
    target: 'premium-distribution-1',
    data: {
      mode: 'air',
      cost: 1200,
      transitTime: 4,
      riskMultiplier: 1.3
    }
  }
]; 