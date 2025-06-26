"use client";
import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

import SimulationToolbar from '../layout/SimulationToolbar';
import { LeftPanel } from '../layout/left-panel';
import RightPanel from '../layout/RightPanel';
import ValidationDialog from '../forms/ValidationDialog';
import { nodeTypes } from "./CustomNodes";
import { edgeTypes } from "./CustomEdges";
import { useDigitalTwinManager, DigitalTwinManagerProps } from './hooks/useDigitalTwinManager';

// Add nodes and edges to the props for SimulationToolbar
interface CustomSimulationToolbarProps extends Omit<React.ComponentProps<typeof SimulationToolbar>, 'nodes' | 'edges'> {
  nodes: Node[];
  edges: Edge[];
}

export default function DigitalTwinCanvas({ initialNodes, initialEdges }: DigitalTwinManagerProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  
  const {
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    reactFlowInstance,
    onNodeDoubleClick,
    isHydrated,
    validationIssues,
    showValidationDialog,
    setShowValidationDialog,
    handleFocusElement,
    performSave,
    isSaving,
    simulationToolbarProps,
    leftPanelProps,
    rightPanelProps,
    handleAIFixRequest
  } = useDigitalTwinManager({ initialNodes, initialEdges });

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    // Only set to false if we're actually leaving the drop zone
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const nodeType = event.dataTransfer.getData('application/reactflow');
    
    // Check if node type is valid
    if (typeof nodeType === 'undefined' || !nodeType) {
      return;
    }

    // Get the position where the node was dropped
    const reactFlowBounds = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    // Convert screen position to flow position
    if (reactFlowInstance.current) {
      const flowPosition = reactFlowInstance.current.project(position);
      leftPanelProps.onAddNodeAtPosition?.(nodeType, flowPosition, `New ${nodeType}`);
    } else {
      // Fallback if reactFlowInstance is not available
      leftPanelProps.onAddNodeAtPosition?.(nodeType, position, `New ${nodeType}`);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <SimulationToolbar {...simulationToolbarProps} />

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel {...leftPanelProps} />

        <div 
          className={`flex-1 h-full border-2 transition-all duration-200 relative ${
            isDragOver 
              ? 'border-blue-400 border-dashed bg-blue-50/30 dark:bg-blue-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {/* Drop zone indicator */}
          {isDragOver && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="absolute inset-4 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/50 dark:bg-blue-900/30 flex items-center justify-center">
                <div className="text-blue-600 dark:text-blue-400 text-lg font-medium bg-white/90 dark:bg-gray-900/90 px-4 py-2 rounded-lg shadow-lg border border-blue-300 dark:border-blue-600">
                  Drop here to add node
                </div>
              </div>
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onInit={(instance) => {
              if(reactFlowInstance) {
                reactFlowInstance.current = instance;
              }
            }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            preventScrolling={false}
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick={false}
            onNodeDoubleClick={onNodeDoubleClick}
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>

        <RightPanel {...rightPanelProps} />
      </div>

      <ValidationDialog
        isOpen={showValidationDialog}
        onClose={() => setShowValidationDialog(false)}
        issues={validationIssues}
        onFocusElement={handleFocusElement}
        onSaveWithWarnings={performSave}
        onFixWithAI={handleAIFixRequest}
        isLoading={isSaving}
      />
    </div>
  );
}
