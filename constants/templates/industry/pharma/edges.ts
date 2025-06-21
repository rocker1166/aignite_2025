import { Edge } from 'reactflow';

// Pharma Regulated Template Edges
export const PHARMA_REGULATED_TEMPLATE_EDGES: Edge[] = [
  {
    id: 'e-api-manufacturing',
    source: 'api-supplier-1',
    target: 'manufacturing-1',
    data: {
      mode: 'air',
      cost: 2000,
      transitTime: 2,
      riskMultiplier: 1.6
    }
  },
  {
    id: 'e-manufacturing-qa',
    source: 'manufacturing-1',
    target: 'qa-facility-1',
    data: {
      mode: 'road',
      cost: 150,
      transitTime: 1,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e-qa-specialty',
    source: 'qa-facility-1',
    target: 'specialty-distribution-1',
    data: {
      mode: 'air',
      cost: 500,
      transitTime: 1,
      riskMultiplier: 1.3
    }
  }
]; 