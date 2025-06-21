import { Factory, Truck, Warehouse, Ship, Building2 } from 'lucide-react';

export const NODE_TYPES = [
  { 
    id: 'Supplier', 
    icon: Factory, 
    description: 'Source of raw materials',
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'Factory', 
    icon: Building2, 
    description: 'Manufacturing facility',
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    iconColor: 'text-purple-600'
  },
  { 
    id: 'Port', 
    icon: Ship, 
    description: 'Maritime shipping point',
    color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100',
    iconColor: 'text-cyan-600'
  },
  { 
    id: 'Warehouse', 
    icon: Warehouse, 
    description: 'Storage facility',
    color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    iconColor: 'text-orange-600'
  },
  { 
    id: 'Distribution', 
    icon: Truck, 
    description: 'Distribution center',
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    iconColor: 'text-green-600'
  }
] as const;

export const SUPPLY_CHAIN_TEMPLATES = [
  { id: 'simple-chain', name: 'Simple Chain', nodes: 3, description: 'Linear supply chain' },
  { id: 'hub-spoke', name: 'Hub and Spoke', nodes: 6, description: 'Centralized distribution' },
  { id: 'network', name: 'Network Mesh', nodes: 8, description: 'Complex interconnected' }
] as const; 