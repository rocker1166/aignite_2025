"use client";
import React from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background
} from 'reactflow';
import 'reactflow/dist/style.css';

import SimulationToolbar from '../layout/SimulationToolbar';
import { LeftPanel } from '../layout/left-panel';
import RightPanel from '../layout/RightPanel';
import ValidationDialog from '../forms/ValidationDialog';
import { nodeTypes } from "./CustomNodes";
import { edgeTypes } from "./CustomEdges";
import { useDigitalTwinManager, DigitalTwinManagerProps } from './hooks/useDigitalTwinManager';

export default function DigitalTwinCanvas({ initialNodes, initialEdges }: DigitalTwinManagerProps) {
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
    rightPanelProps
  } = useDigitalTwinManager({ initialNodes, initialEdges });

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

        <div className="flex-1 h-full border border-gray-200">
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
        isLoading={isSaving}
      />
    </div>
  );
}
