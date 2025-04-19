// src/components/CustomEdges.tsx
import { useState } from 'react';
import { 
  EdgeProps, 
  BaseEdge, 
  EdgeLabelRenderer,
  getSmoothStepPath
} from 'reactflow';

export const TransportEdge = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {}
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // Generate style based on transport mode
  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: 2,
      stroke: '#64748b'
    };
    
    if (!data?.mode) return baseStyle;
    
    switch (data.mode) {
      case 'sea':
        return { ...baseStyle, stroke: '#3b82f6', strokeDasharray: '5,5' };
      case 'air':
        return { ...baseStyle, stroke: '#8b5cf6' };
      case 'rail':
        return { ...baseStyle, stroke: '#f59e0b', strokeDasharray: '10,2' };
      case 'road':
      default:
        return baseStyle;
    }
  };

  // Get icon for transport mode
  const getTransportIcon = () => {
    switch (data?.mode) {
      case 'sea': return '🚢';
      case 'air': return '✈️';
      case 'rail': return '🚂';
      case 'road': 
      default: return '🚚';
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        id={id}
        style={{
          ...getEdgeStyle(),
          ...style
        }}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            backgroundColor: selected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: 12,
            fontWeight: 500,
            border: selected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
          }}
          className="nodrag nopan"
        >
          <div>{getTransportIcon()} {data?.mode || 'road'}</div>
          {selected && (
            <>
              <div>Cost: ${data?.cost || 0}</div>
              <div>Time: {data?.transitTime || 0}d</div>
              <div>Risk: x{data?.riskMultiplier?.toFixed(1) || "1.0"}</div>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export const edgeTypes = {
  transportEdge: TransportEdge
};