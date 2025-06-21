import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Base styles for all nodes
const baseNodeStyle = {
  padding: '10px',
  borderRadius: '8px',
  width: '150px',
  boxShadow: '0 4px 6px rgba(40, 0, 10, 0.1)',
  backgroundColor: 'white',
  border: '2px solid #e2e8f0'
};

// Node type specific colors with more distinct color schemes
const nodeTypeColors = {
  supplier: 'bg-blue-100 border-blue-500 text-blue-800',
  factory: 'bg-purple-100 border-purple-500 text-purple-800',
  port: 'bg-cyan-100 border-cyan-500 text-cyan-800',
  warehouse: 'bg-amber-100 border-amber-500 text-amber-800',
  distribution: 'bg-emerald-100 border-emerald-800 text-emerald-800'
};

// Helper to generate risk class
const getRiskClass = (riskScore: number) => {
  if (riskScore >= 0.7) return 'ring-2 ring-red-500 ring-opacity-70';
  if (riskScore >= 0.4) return 'ring-2 ring-yellow-500 ring-opacity-70';
  return '';
};

// Supplier Node
export const SupplierNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskClass(data.riskScore);
  const typeClass = nodeTypeColors.supplier;

  return (
    <div style={baseNodeStyle} className={`${typeClass} ${riskClass}`}>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      
      <div className="font-bold text-sm text-center">{data.label}</div>
    </div>
  );
});

// Factory Node
export const FactoryNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskClass(data.riskScore);
  const typeClass = nodeTypeColors.factory;

  return (
    <div style={baseNodeStyle} className={`${typeClass} ${riskClass}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />

      <div className="font-bold text-sm text-center">{data.label}</div>
    </div>
  );
});

// Port Node
export const PortNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskClass(data.riskScore);
  const typeClass = nodeTypeColors.port;
  
  return (
    <div style={baseNodeStyle} className={`${typeClass} ${riskClass}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      
      <div className="font-bold text-sm text-center">{data.label}</div>
    </div>
  );
});

// Warehouse Node
export const WarehouseNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskClass(data.riskScore);
  const typeClass = nodeTypeColors.warehouse;
  
  return (
    <div style={baseNodeStyle} className={`${typeClass} ${riskClass}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      
      <div className="font-bold text-sm text-center">{data.label}</div>
    </div>
  );
});

// Distribution Node
export const DistributionNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskClass(data.riskScore);
  const typeClass = nodeTypeColors.distribution;
  
  return (
    <div style={baseNodeStyle} className={`${typeClass} ${riskClass}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      
      <div className="font-bold text-sm text-center">{data.label}</div>
    </div>
  );
});

// Export a map of all node types to use in React Flow
export const nodeTypes = {
  supplierNode: SupplierNode,
  factoryNode: FactoryNode,
  portNode: PortNode,
  warehouseNode: WarehouseNode,
  distributionNode: DistributionNode
}; 