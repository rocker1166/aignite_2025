import { Edge } from 'reactflow';

// Global Network Template Edges
export const GLOBAL_NETWORK_TEMPLATE_EDGES: Edge[] = [
  {
    id: 'e-asia-supplier-port',
    source: 'asia-supplier-1',
    target: 'asia-port-hub',
    data: {
      mode: 'road',
      cost: 300,
      transitTime: 1,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e-europe-supplier-port',
    source: 'europe-supplier-1',
    target: 'europe-port-hub',
    data: {
      mode: 'road',
      cost: 200,
      transitTime: 1,
      riskMultiplier: 1.0
    }
  },
  {
    id: 'e-na-supplier-port',
    source: 'na-supplier-1',
    target: 'na-port-hub',
    data: {
      mode: 'road',
      cost: 150,
      transitTime: 1,
      riskMultiplier: 1.1
    }
  },
  {
    id: 'e-asia-port-global',
    source: 'asia-port-hub',
    target: 'global-coordination-1',
    data: {
      mode: 'air',
      cost: 2000,
      transitTime: 12,
      riskMultiplier: 1.4
    }
  },
  {
    id: 'e-europe-port-global',
    source: 'europe-port-hub',
    target: 'global-coordination-1',
    data: {
      mode: 'air',
      cost: 1500,
      transitTime: 8,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e-na-port-global',
    source: 'na-port-hub',
    target: 'global-coordination-1',
    data: {
      mode: 'road',
      cost: 800,
      transitTime: 3,
      riskMultiplier: 1.1
    }
  },
  {
    id: 'e-global-apac-dc',
    source: 'global-coordination-1',
    target: 'regional-dc-apac',
    data: {
      mode: 'air',
      cost: 1800,
      transitTime: 14,
      riskMultiplier: 1.3
    }
  },
  {
    id: 'e-global-eu-dc',
    source: 'global-coordination-1',
    target: 'regional-dc-eu',
    data: {
      mode: 'air',
      cost: 1200,
      transitTime: 7,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e-global-na-dc',
    source: 'global-coordination-1',
    target: 'regional-dc-na',
    data: {
      mode: 'road',
      cost: 600,
      transitTime: 2,
      riskMultiplier: 1.1
    }
  }
]; 