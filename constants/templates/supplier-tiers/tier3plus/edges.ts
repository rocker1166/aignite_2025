import { Edge } from 'reactflow';

// Tier 3+ Complex Template Edges
export const TIER3_COMPLEX_TEMPLATE_EDGES: Edge[] = [
  {
    id: 'e-raw-intermediate',
    source: 'raw-material-supplier-1',
    target: 'intermediate-processor-1',
    data: {
      mode: 'sea',
      cost: 1500,
      transitTime: 21,
      riskMultiplier: 1.5
    }
  },
  {
    id: 'e-intermediate-subassembly',
    source: 'intermediate-processor-1',
    target: 'sub-assembly-supplier-1',
    data: {
      mode: 'air',
      cost: 1200,
      transitTime: 3,
      riskMultiplier: 1.3
    }
  },
  {
    id: 'e-subassembly-final',
    source: 'sub-assembly-supplier-1',
    target: 'final-assembly-2',
    data: {
      mode: 'sea',
      cost: 800,
      transitTime: 14,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e-final-qc',
    source: 'final-assembly-2',
    target: 'quality-control-hub',
    data: {
      mode: 'air',
      cost: 600,
      transitTime: 5,
      riskMultiplier: 1.1
    }
  },
  {
    id: 'e-qc-global',
    source: 'quality-control-hub',
    target: 'global-distribution-2',
    data: {
      mode: 'air',
      cost: 1000,
      transitTime: 3,
      riskMultiplier: 1.2
    }
  }
]; 