"use client";

import { useState, useRef, useCallback } from 'react';
import { Node, Edge, ReactFlowInstance } from 'reactflow';
import { useQueryState } from 'nuqs';

import { useDigitalTwinState } from './useDigitalTwinState';
import { useInteraction } from './useInteraction';
import { useNodeEdgeActions } from './useNodeEdgeActions';
import { useTemplateManager } from './useTemplateManager';
import { useSaveAndValidate } from './useSaveAndValidate';
import { useCanvasView } from './useCanvasView';
import { ValidationIssue } from '@/lib/validation/supply-chain-validator';
import { generateAIFixPrompt } from '../../forms/ValidationDialog';

export interface DigitalTwinManagerProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function useDigitalTwinManager({
  initialNodes = [],
  initialEdges = []
}: DigitalTwinManagerProps) {
  
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    isHydrated,
  } = useDigitalTwinState(initialNodes, initialEdges);

  const [selectedSupplyChain, setSelectedSupplyChain] = useState("default-chain");
  const [supplyChainName, setSupplyChainName] = useState("Default Supply Chain");
  const [description, setDescription] = useState("");
  const [simulationMode, setSimulationMode] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Chat mode state for AI integration
  const [chatMode, setChatMode] = useQueryState('chat');
  const [pendingAIMessage, setPendingAIMessage] = useState<string | null>(null);

  const {
    handleSave,
    performSave,
    isSaving,
    validationIssues,
    showValidationDialog,
    setShowValidationDialog,
    handleValidateSupplyChain,
  } = useSaveAndValidate({
    nodes,
    edges,
    supplyChainName,
    description,
    selectedSupplyChain,
  });

  const { handleUngroupTemplate, handleLoadTemplate } = useTemplateManager({
      nodes,
      setNodes,
      setEdges,
      setSelectedElement: () => {}, // temp
      reactFlowInstance,
  });

  const {
    selectedElement,
    setSelectedElement,
    onSelectionChange,
    onNodeDoubleClick,
  } = useInteraction(handleUngroupTemplate);

  const nodeEdgeActions = useNodeEdgeActions({
    nodes,
    setNodes,
    setEdges,
    setSelectedElement,
  });

  const canvasViewActions = useCanvasView({
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedElement,
    setShowValidationDialog,
    reactFlowInstance,
  });

  const onUpdate = useCallback((updatedElement: any) => {
    if ('source' in updatedElement) {
      setEdges(eds => eds.map(edge => edge.id === updatedElement.id ? updatedElement : edge));
    } else {
      setNodes(nds => nds.map(node => node.id === updatedElement.id ? updatedElement : node));
    }
    setSelectedElement(updatedElement);
  }, [setEdges, setNodes, setSelectedElement]);

  const finalTemplateManager = useTemplateManager({
      nodes,
      setNodes,
      setEdges,
      setSelectedElement,
      reactFlowInstance,
  });

  // Handle AI fix requests from ValidationDialog
  const handleAIFixRequest = useCallback((issue: ValidationIssue) => {
    const aiPrompt = generateAIFixPrompt(issue);
    
    // Switch to immersive chat mode
    setChatMode('immersive');
    setIsLeftPanelCollapsed(false);
    
    // Store the message to be sent to AI
    setPendingAIMessage(aiPrompt);
    
    // Close validation dialog
    setShowValidationDialog(false);
  }, [setChatMode, setShowValidationDialog]);

  return {
    nodes,
    edges,
    handleNodesChange: onNodesChange,
    onEdgesChange,
    onConnect: nodeEdgeActions.onConnect,
    onSelectionChange,
    reactFlowInstance,
    onNodeDoubleClick,
    selectedElement,
    setSelectedElement,
    handleDeleteNode: nodeEdgeActions.handleDeleteNode,
    handleUngroupTemplate: finalTemplateManager.handleUngroupTemplate,
    handleSave,
    performSave,
    isSaving,
    validationIssues,
    showValidationDialog,
    setShowValidationDialog,
    handleFocusElement: canvasViewActions.handleFocusElement,
    isHydrated,
    simulationToolbarProps: {
      selectedSupplyChain,
      setSelectedSupplyChain,
      onSave: handleSave,
      simulationMode,
      setSimulationMode,
      supplyChainName,
      setSupplyChainName,
      description,
      setDescription,
      nodes,
      edges,
    },
    leftPanelProps: {
      onAddNode: nodeEdgeActions.handleAddNode,
      onAddNodeAtPosition: nodeEdgeActions.handleAddNodeAtPosition,
      onClearAllNodes: nodeEdgeActions.handleClearAllNodes,
      onLoadTemplate: finalTemplateManager.handleLoadTemplate,
      simulationMode,
      isCollapsed: isLeftPanelCollapsed,
      setIsCollapsed: setIsLeftPanelCollapsed,
      nodes,
      edges,
      onAddMultipleNodes: nodeEdgeActions.handleAddMultipleNodes,
      onAddMultipleEdges: nodeEdgeActions.handleAddMultipleEdges,
      onAddEdges: nodeEdgeActions.handleAddEdges,
      onUpdateNode: nodeEdgeActions.handleUpdateNode,
      onDeleteNode: nodeEdgeActions.handleDeleteNode,
      onUpdateMultipleNodes: nodeEdgeActions.handleUpdateMultipleNodes,
      onUpdateNodePositions: canvasViewActions.handleUpdateNodePositions,
      onUpdateEdge: nodeEdgeActions.handleUpdateEdge,
      onValidateSupplyChain: handleValidateSupplyChain,
      onFindAndSelectNode: canvasViewActions.handleFindAndSelectNode,
      onFindAndSelectEdges: canvasViewActions.handleFindAndSelectEdges,
      onHighlightNodes: canvasViewActions.handleHighlightNodes,
      onFocusNode: canvasViewActions.handleFocusNode,
      onZoomToNodes: canvasViewActions.handleZoomToNodes,
      onGetNodeConnections: canvasViewActions.handleGetNodeConnections,
      onAnalyzeNetworkPaths: canvasViewActions.handleAnalyzeNetworkPaths,
      onBulkUpdateEdges: canvasViewActions.handleBulkUpdateEdges,
      onCreateNodeGroup: canvasViewActions.handleCreateNodeGroup,
      onExportSubgraph: canvasViewActions.handleExportSubgraph,
      pendingAIMessage,
      setPendingAIMessage,
    },
    rightPanelProps: {
      selectedElement,
      nodes,
      onUpdate,
      onDelete: nodeEdgeActions.handleDeleteNode,
      onUngroup: finalTemplateManager.handleUngroupTemplate,
      onSave: handleSave,
    },
    // Add AI fix handler for ValidationDialog
    handleAIFixRequest,
  };
} 