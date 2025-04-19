// src/components/CustomNodes.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// Base styles for all nodes
const baseNodeStyle = {
  padding: '10px',
  borderRadius: '8px',
  width: '150px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  backgroundColor: 'white',
  border: '2px solid #e2e8f0'
};

// Helper to generate risk color
const getRiskColor = (riskScore: number) => {
  if (riskScore >= 0.7) return 'bg-red-100 border-red-400';
  if (riskScore >= 0.4) return 'bg-yellow-100 border-yellow-400';
  return 'bg-green-100 border-green-400';
};

// Supplier Node
export const SupplierNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskColor(data.riskScore);
  
  return (
    <div style={baseNodeStyle} className={`${riskClass}`}>
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs">Type: Supplier</div>
      <div className="text-xs">Capacity: {data.capacity}</div>
      <div className="text-xs">Lead Time: {data.leadTime}d</div>
      
      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div 
          className="h-1 bg-blue-500 rounded" 
          style={{ width: `${Math.min(100, data.capacity / 10)}%` }} 
        />
      </div>
    </div>
  );
});

// Factory Node
export const FactoryNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskColor(data.riskScore);

  return (
    <div style={baseNodeStyle} className={`${riskClass}`}>
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

      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs">Type: Factory</div>
      <div className="text-xs">Capacity: {data.capacity}</div>
      <div className="text-xs">Lead Time: {data.leadTime}d</div>

      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div
          className="h-1 bg-blue-500 rounded"
          style={{ width: `${Math.min(100, data.capacity / 10)}%` }}
        />
      </div>
    </div>
  );
});

// Port Node
export const PortNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskColor(data.riskScore);
  
  return (
    <div style={baseNodeStyle} className={`${riskClass}`}>
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
      
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs">Type: Port</div>
      <div className="text-xs">Capacity: {data.capacity}</div>
      <div className="text-xs">Lead Time: {data.leadTime}d</div>
      
      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div 
          className="h-1 bg-blue-500 rounded" 
          style={{ width: `${Math.min(100, data.capacity / 10)}%` }} 
        />
      </div>
    </div>
  );
});

// Warehouse Node
export const WarehouseNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskColor(data.riskScore);
  
  return (
    <div style={baseNodeStyle} className={`${riskClass}`}>
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
      
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs">Type: Warehouse</div>
      <div className="text-xs">Capacity: {data.capacity}</div>
      <div className="text-xs">Lead Time: {data.leadTime}d</div>
      
      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div 
          className="h-1 bg-blue-500 rounded" 
          style={{ width: `${Math.min(100, data.capacity / 10)}%` }} 
        />
      </div>
    </div>
  );
});

// Distribution Node
export const DistributionNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskColor(data.riskScore);
  
  return (
    <div style={baseNodeStyle} className={`${riskClass}`}>
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
      
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs">Type: Distribution</div>
      <div className="text-xs">Capacity: {data.capacity}</div>
      <div className="text-xs">Lead Time: {data.leadTime}d</div>
      
      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div 
          className="h-1 bg-blue-500 rounded" 
          style={{ width: `${Math.min(100, data.capacity / 10)}%` }} 
        />
      </div>
    </div>
  );
});

// Customer Node
export const CustomerNode = memo(({ data, isConnectable }: NodeProps) => {
  const riskClass = getRiskColor(data.riskScore);
  
  return (
    <div style={baseNodeStyle} className={`${riskClass}`}>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      
      <div className="font-bold text-sm">{data.label}</div>
      <div className="text-xs">Type: Customer</div>
      <div className="text-xs">Demand: {data.capacity}</div>
      
      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div 
          className="h-1 bg-blue-500 rounded" 
          style={{ width: `${Math.min(100, data.capacity / 10)}%` }} 
        />
      </div>
    </div>
  );
});

// Export a map of all node types to use in React Flow
export const nodeTypes = {
  supplierNode: SupplierNode,
  factoryNode: FactoryNode,
  portNode: PortNode,
  warehouseNode: WarehouseNode,
  distributionNode: DistributionNode,
  customerNode: CustomerNode
};