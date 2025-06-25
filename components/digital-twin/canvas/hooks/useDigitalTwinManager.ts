"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  OnSelectionChangeParams,
  ReactFlowInstance
} from 'reactflow';
import { toast } from "sonner";
import { useQueryState } from 'nuqs';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/navigation';

import { useUser } from '@/lib/stores/user';
import { saveSupplyChainToDatabase } from '@/lib/api/supply-chain';
import { validateSupplyChain, ValidationIssue } from '@/lib/validation/supply-chain-validator';
import { SUPPLY_CHAIN_TEMPLATES } from '@/constants/digital-twin';
import { migrateEdges } from '../lib/utils';

export interface DigitalTwinManagerProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function useDigitalTwinManager({
  initialNodes = [],
  initialEdges = []
}: DigitalTwinManagerProps) {
  const [archParam, setArchParam] = useQueryState('arch', {
    defaultValue: '',
    shallow: false
  });

  const [hydratedNodes, setHydratedNodes] = useState<Node[]>([]);
  const [hydratedEdges, setHydratedEdges] = useState<Edge[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(hydratedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(hydratedEdges);

  const forceURLUpdate = useRef(false);

  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    const hasPositionChange = changes.some(change =>
      change.type === 'position' || change.type === 'dimensions'
    );
    if (hasPositionChange) {
      forceURLUpdate.current = true;
    }
  }, [onNodesChange]);

  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [selectedSupplyChain, setSelectedSupplyChain] = useState("default-chain");
  const [supplyChainName, setSupplyChainName] = useState("Default Supply Chain");
  const [description, setDescription] = useState("");
  const [simulationMode, setSimulationMode] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const { userData } = useUser();
  const router = useRouter();
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const isUpdatingFromURL = useRef(false);

  useEffect(() => {
    const hydrateFromURL = async () => {
      if (!isHydrated) {
        if (archParam) {
          try {
            const padding = '='.repeat((4 - (archParam.length % 4)) % 4);
            const paddedBase64 = archParam.replace(/-/g, '+').replace(/_/g, '/') + padding;
            const jsonString = atob(paddedBase64);
            const canvasData = JSON.parse(jsonString);

            if (canvasData.nodes && canvasData.edges) {
              const migrated = migrateEdges(canvasData.edges);
              setHydratedNodes(canvasData.nodes);
              setHydratedEdges(migrated);
              isUpdatingFromURL.current = true;
              setNodes(canvasData.nodes);
              setEdges(migrated);
              setTimeout(() => { isUpdatingFromURL.current = false; }, 100);
            }
          } catch (error) {
            console.error('Failed to hydrate canvas state from URL:', error);
            const migratedInitial = migrateEdges(initialEdges);
            setHydratedNodes(initialNodes);
            setHydratedEdges(migratedInitial);
            setNodes(initialNodes);
            setEdges(migratedInitial);
          }
        } else {
          const migratedInitial = migrateEdges(initialEdges);
          setHydratedNodes(initialNodes);
          setHydratedEdges(migratedInitial);
          setNodes(initialNodes);
          setEdges(migratedInitial);
        }
        setIsHydrated(true);
      }
    };
    hydrateFromURL();
  }, [archParam, initialNodes, initialEdges, isHydrated, setNodes, setEdges]);

  const debouncedUpdateURL = useCallback(
    debounce((currentNodes: Node[], currentEdges: Edge[]) => {
      if (isUpdatingFromURL.current) return;
      try {
        const canvasData = { nodes: currentNodes, edges: currentEdges, timestamp: Date.now() };
        const jsonString = JSON.stringify(canvasData);
        if (jsonString.length > 50000) {
          console.warn('Canvas data too large for URL, skipping URL update');
          return;
        }
        const base64String = btoa(jsonString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        setArchParam(base64String, { scroll: false, shallow: true });
      } catch (error) {
        console.error('Failed to update URL with canvas state:', error);
      }
    }, 1000),
    [setArchParam]
  );

  useEffect(() => {
    if (isHydrated && !isUpdatingFromURL.current) {
      debouncedUpdateURL(nodes, edges);
      if (forceURLUpdate.current) {
        forceURLUpdate.current = false;
      }
    }
  }, [nodes, edges, isHydrated, debouncedUpdateURL]);

  useEffect(() => {
    return () => {
      debouncedUpdateURL.cancel();
    };
  }, [debouncedUpdateURL]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const { nodes: selectedNodes, edges: selectedEdges } = params;
    if (selectedNodes.length > 0) {
      setSelectedElement(selectedNodes[0]);
    } else if (selectedEdges.length > 0) {
      setSelectedElement(selectedEdges[0]);
    } else {
      setSelectedElement(null);
    }
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `e${connection.source}-${connection.target}`,
      type: 'transportEdge',
      data: {
        mode: 'road', cost: 100, transitTime: 1, riskMultiplier: 1.0,
        avgDelayDays: 0, frequencyOfDisruptions: 0, hasAltRoute: false, passesThroughChokepoint: false
      }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const handleAddNode = useCallback((nodeType: string, label?: string, enhancedData?: any) => {
    const nodeData = enhancedData || {
      label: label || `New ${nodeType}`, description: `Description for ${nodeType}`, type: nodeType,
      capacity: 500, leadTime: 7, riskScore: 0.3, location: { lat: 0, lng: 0 },
      address: `Default address for ${nodeType}`
    };
    const newNode = {
      id: `${nodeType.toLowerCase()}-${nodes.length + 1}`,
      type: `${nodeType.toLowerCase()}Node`,
      data: { ...nodeData, type: nodeType },
      position: { x: 300 + Math.random() * 100, y: 300 + Math.random() * 100 },
    };
    setNodes(nodes => [...nodes, newNode]);
    setSelectedElement(newNode);
  }, [nodes, setNodes]);

  const handleUngroupTemplate = useCallback((groupId: string) => {
    setNodes(currentNodes => {
      const groupNode = currentNodes.find(node => node.id === groupId);
      if (!groupNode || groupNode.type !== 'group') return currentNodes;
      const childNodes = currentNodes.filter(node => node.parentId === groupId);
      const otherNodes = currentNodes.filter(node => node.id !== groupId && node.parentId !== groupId);
      const ungroupedChildNodes = childNodes.map(node => ({
        ...node,
        parentId: undefined,
        extent: undefined,
        position: {
          x: groupNode.position.x + node.position.x,
          y: groupNode.position.y + node.position.y
        }
      }));
      toast.success(`Ungrouped ${groupNode.data.label} template`);
      return [...otherNodes, ...ungroupedChildNodes];
    });
  }, [setNodes]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'group' && node.data.isTemplate) {
      handleUngroupTemplate(node.id);
    }
  }, [handleUngroupTemplate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'u' || event.key === 'U') {
        if (selectedElement && 'type' in selectedElement && selectedElement.type === 'group' && selectedElement.data.isTemplate) {
          event.preventDefault();
          handleUngroupTemplate(selectedElement.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, handleUngroupTemplate]);

  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = SUPPLY_CHAIN_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      toast.error('Template not found');
      return;
    }
    const templateNodes = JSON.parse(JSON.stringify(template.nodes_data));
    const templateEdges = JSON.parse(JSON.stringify(template.edges_data));
    const timestamp = Date.now();
    const nodeIdMap = new Map();
    let maxX = 0;
    let maxY = 0;
    if (nodes.length > 0) {
      maxX = Math.max(...nodes.map(node => node.position.x + 200));
      maxY = Math.max(...nodes.map(node => node.position.y));
    }
    const templateBounds = templateNodes.reduce((bounds: any, node: Node) => ({
      minX: Math.min(bounds.minX, node.position.x),
      minY: Math.min(bounds.minY, node.position.y),
      maxX: Math.max(bounds.maxX, node.position.x + 200),
      maxY: Math.max(bounds.maxY, node.position.y + 100)
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    const groupId = `template-group-${timestamp}`;
    const groupWidth = templateBounds.maxX - templateBounds.minX + 40;
    const groupHeight = templateBounds.maxY - templateBounds.minY + 80;
    const groupNode = {
      id: groupId, type: 'group',
      data: { label: template.name, description: template.description, templateId: template.id, isTemplate: true },
      position: { x: maxX + 100, y: maxY > 0 ? maxY + 50 : 50 },
      style: { width: groupWidth, height: groupHeight, backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '2px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '20px' },
      className: 'template-group'
    };
    const updatedTemplateNodes = templateNodes.map((node: Node, index: number) => {
      const originalId = node.id;
      const newId = `${node.id}-${timestamp}-${index}`;
      nodeIdMap.set(originalId, newId);
      return { ...node, id: newId, parentId: groupId, position: { x: node.position.x - templateBounds.minX + 20, y: node.position.y - templateBounds.minY + 40 }, extent: 'parent' as const, expandParent: true };
    });
    const updatedTemplateEdges = templateEdges.map((edge: Edge, index: number) => {
      const newSourceId = nodeIdMap.get(edge.source) || edge.source;
      const newTargetId = nodeIdMap.get(edge.target) || edge.target;
      return { ...edge, id: `${edge.id}-${timestamp}-${index}`, source: newSourceId, target: newTargetId };
    });
    const migrated = migrateEdges(updatedTemplateEdges);
    setNodes(currentNodes => [...currentNodes, groupNode, ...updatedTemplateNodes]);
    setEdges(currentEdges => [...currentEdges, ...migrated]);
    setTimeout(() => {
      if (reactFlowInstance.current) {
        const centerX = groupNode.position.x + groupWidth / 2;
        const centerY = groupNode.position.y + groupHeight / 2;
        reactFlowInstance.current.setCenter(centerX, centerY, { zoom: 0.8, duration: 800 });
        setTimeout(() => {
          setSelectedElement(groupNode);
          setTimeout(() => setSelectedElement(null), 1500);
        }, 400);
      }
    }, 100);
    toast.success(`Added ${template.name} template`);
  }, [nodes, setNodes, setEdges]);

  const performSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const connections = edges.map(edge => {
        const sourceNode = nodes.find(node => node.id === edge.source);
        const targetNode = nodes.find(node => node.id === edge.target);
        return {
          sourceId: edge.source, targetId: edge.target, sourceLabel: sourceNode?.data.label, targetLabel: targetNode?.data.label,
          mode: edge.data.mode, cost: edge.data.cost, transitTime: edge.data.transitTime, riskMultiplier: edge.data.riskMultiplier
        };
      });
      const urlParams = new URLSearchParams(window.location.search);
      const saveNameFromUrl = urlParams.get('saveName');
      const saveDescriptionFromUrl = urlParams.get('saveDescription');
      const finalSupplyChainName = saveNameFromUrl || supplyChainName;
      const finalDescription = saveDescriptionFromUrl || description;
      const formDataFromUrl = {
        industry: urlParams.get('industry'), customIndustry: urlParams.get('customIndustry'),
        productCharacteristics: urlParams.get('productCharacteristics')?.split(',') || [],
        supplierTiers: urlParams.get('supplierTiers'), operationsLocation: urlParams.get('operationsLocation')?.split(',') || [],
        country: urlParams.get('country'), currency: urlParams.get('currency'), shippingMethods: urlParams.get('shippingMethods')?.split(',') || [],
        annualVolumeType: urlParams.get('annualVolumeType'),
        annualVolumeValue: urlParams.get('annualVolumeValue') ? parseInt(urlParams.get('annualVolumeValue')!) : null,
        risks: urlParams.get('risks')?.split(',') || []
      };
      let formDataFromLocalStorage = null;
      try {
        const storedData = localStorage.getItem(`supplyChain-${selectedSupplyChain}`);
        if (storedData) formDataFromLocalStorage = JSON.parse(storedData);
      } catch (error) { console.error('Error parsing localStorage data:', error); }
      const supplyChainData = {
        id: selectedSupplyChain, name: finalSupplyChainName, description: finalDescription,
        nodes, edges, connections, timestamp: new Date().toISOString(),
        formData: formDataFromLocalStorage || formDataFromUrl,
        organisation: {
          id: userData?.id, name: userData?.organisation_name, description: userData?.description,
          industry: userData?.industry, sub_industry: userData?.sub_industry, location: userData?.location
        }
      };
      await saveSupplyChainToDatabase(supplyChainData);
      toast.success('Supply chain saved successfully!');
      router.push('/digital-twin');
      setShowValidationDialog(false);
      if (saveNameFromUrl || saveDescriptionFromUrl) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('saveName');
        newUrl.searchParams.delete('saveDescription');
        window.history.replaceState({}, '', newUrl.toString());
      }
    } catch (error) {
      console.error('Error saving supply chain:', error);
      toast.error('Failed to save supply chain.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, selectedSupplyChain, supplyChainName, description, userData, router]);

  const handleSave = useCallback(async () => {
    const issues = validateSupplyChain(nodes, edges);
    setValidationIssues(issues);
    const errors = issues.filter(issue => issue.severity === 'error');
    if (errors.length > 0) {
      setShowValidationDialog(true);
      return;
    }
    const warnings = issues.filter(issue => issue.severity === 'warning');
    if (warnings.length > 0) {
      setShowValidationDialog(true);
      return;
    }
    await performSave();
  }, [nodes, edges, performSave]);

  const handleFocusElement = useCallback((elementId: string, elementType: 'node' | 'edge') => {
    if (elementType === 'node') {
      const node = nodes.find(n => n.id === elementId);
      if (node && reactFlowInstance.current) {
        setSelectedElement(null);
        reactFlowInstance.current.setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.5 });
        setTimeout(() => setSelectedElement(node), 300);
      }
    } else if (elementType === 'edge') {
      const edge = edges.find(e => e.id === elementId);
      if (edge && reactFlowInstance.current) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
          setSelectedElement(null);
          const centerX = (sourceNode.position.x + targetNode.position.x) / 2;
          const centerY = (sourceNode.position.y + targetNode.position.y) / 2;
          reactFlowInstance.current.setCenter(centerX, centerY, { zoom: 1.5 });
          setTimeout(() => setSelectedElement(edge), 300);
        }
      }
    }
    setShowValidationDialog(false);
  }, [nodes, edges]);

  const handleClearAllNodes = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedElement(null);
  }, [setNodes, setEdges]);

  const handleUpdateNode = useCallback((nodeId: string, properties: object) => {
    let updatedNode: Node | null = null;
    setNodes(currentNodes =>
      currentNodes.map(node => {
        if (node.id === nodeId) {
          updatedNode = { ...node, data: { ...node.data, ...properties } };
          return updatedNode;
        }
        return node;
      }),
    );
    if (updatedNode) {
      setSelectedElement(null);
      setTimeout(() => setSelectedElement(updatedNode), 50);
    }
    // @ts-ignore
    toast.success(`Node ${updatedNode?.data?.label || nodeId} updated.`);
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(currentNodes => {
      const nodeToDelete = currentNodes.find(node => node.id === nodeId);
      if (nodeToDelete && nodeToDelete.type === 'group' && nodeToDelete.data?.isTemplate) {
        const childNodes = currentNodes.filter(node => node.parentId === nodeId);
        const remainingNodes = currentNodes.filter(node => node.id !== nodeId && node.parentId !== nodeId);
        setEdges(currentEdges => currentEdges.filter(edge => !childNodes.some(child => edge.source === child.id || edge.target === child.id)));
        toast.success(`Deleted template group`);
        return remainingNodes;
      } else {
        setEdges(currentEdges => currentEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
        return currentNodes.filter(node => node.id !== nodeId);
      }
    });
    setSelectedElement(null);
  }, [setNodes, setEdges]);
  
  const handleAddMultipleNodes = useCallback((newNodes: Partial<Node>[]) => {
    const fullyFormedNodes = newNodes.map((n, i) => ({
      id: `${Date.now()}-${i}`,
      data: { label: `New Node ${i + 1}`, ...n.data },
      position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
      type: n.type || 'supplierNode',
      ...n
    }));
    setNodes(nds => nds.concat(fullyFormedNodes));
    toast.success(`${newNodes.length} nodes added.`);
  }, [setNodes]);

  const handleUpdateEdge = useCallback((edgeId: string, properties: object) => {
    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, data: { ...edge.data, ...properties } };
        }
        return edge;
      })
    );
    toast.success(`Edge ${edgeId} updated.`);
  }, [setEdges]);

  const handleAddEdges = useCallback((newEdges: Edge[]) => {
    setEdges((eds) => eds.concat(newEdges));
    toast.success(`${newEdges.length} edges added.`);
  }, [setEdges]);

  const handleValidateSupplyChain = useCallback(() => {
    const issues = validateSupplyChain(nodes, edges);
    setValidationIssues(issues);
    setShowValidationDialog(true);
  }, [nodes, edges]);
  
  const handleUpdateMultipleNodes = useCallback((nodeIds: string[], properties: object) => {
    setNodes(nds =>
      nds.map(n =>
        nodeIds.includes(n.id) ? { ...n, data: { ...n.data, ...properties } } : n
      )
    );
    toast.success(`Updated ${nodeIds.length} nodes.`);
  }, [setNodes]);
  
  const handleFindAndSelectNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      reactFlowInstance.current?.fitView({ nodes: [{ id: nodeId }], duration: 200 });
      setSelectedElement(node);
      toast.success(`Found and selected node ${node.data.label || nodeId}`);
    } else {
      toast.error(`Node with ID ${nodeId} not found.`);
    }
  }, [nodes]);
  
  const handleFindAndSelectEdges = useCallback((edgeIds: string[]) => {
      toast.info(`Attempting to select ${edgeIds.length} edges.`);
  }, []);
  
  const handleApplyLayout = useCallback((layoutType: string) => {
      toast.info(`Layout functionality for '${layoutType}' is not yet implemented.`);
  }, []);
  
  const handleHighlightNodes = useCallback((nodeIds: string[]) => {
      setNodes(nds =>
        nds.map(n => ({
          ...n,
          style: nodeIds.includes(n.id) ? { ...n.style, boxShadow: '0 0 15px #ff0072' } : n.style,
        }))
      );
      toast.success(`Highlighted ${nodeIds.length} nodes.`);
  }, [setNodes]);
  
  const handleFocusNode = useCallback((nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId);
      if (node && reactFlowInstance.current) {
          reactFlowInstance.current.setCenter(node.position.x, node.position.y, { zoom: 1.5, duration: 500 });
          toast.success(`Focused on node ${node.data.label || nodeId}`);
      } else {
          toast.error(`Node with ID ${nodeId} not found.`);
      }
  }, [nodes]);
  
  const handleZoomToNodes = useCallback((nodeIds: string[]) => {
      const nodesToFit = nodes.filter(n => nodeIds.includes(n.id));
      if (nodesToFit.length > 0 && reactFlowInstance.current) {
          reactFlowInstance.current.fitView({ nodes: nodesToFit, padding: 0.2, duration: 500 });
          toast.success(`Zoomed to ${nodesToFit.length} nodes.`);
      } else {
          toast.info(`No nodes found for IDs: ${nodeIds.join(', ')}`);
      }
  }, [nodes]);
  
  const handleGetNodeConnections = useCallback((nodeId: string) => {
      return edges.filter(e => e.source === nodeId || e.target === nodeId);
  }, [edges]);
  
  const handleAnalyzeNetworkPaths = useCallback((sourceId: string, targetId: string) => {
      toast.info(`Path analysis from ${sourceId} to ${targetId} is not yet implemented.`);
  }, []);
  
  const handleBulkUpdateEdges = useCallback((edgeIds: string[], properties: object) => {
      setEdges(eds =>
        eds.map(e =>
          edgeIds.includes(e.id) ? { ...e, data: { ...e.data, ...properties } } : e
        )
      );
      toast.success(`Bulk updated ${edgeIds.length} edges.`);
  }, [setEdges]);
  
  const handleCreateNodeGroup = useCallback((nodeIds: string[], groupName: string) => {
      toast.info(`Node grouping is not yet implemented.`);
  }, []);
  
  const handleExportSubgraph = useCallback((nodeIds: string[]) => {
      const subgraphNodes = nodes.filter(n => nodeIds.includes(n.id));
      const subgraphEdges = edges.filter(e => nodeIds.includes(e.source) && nodeIds.includes(e.target));
      const subgraph = { nodes: subgraphNodes, edges: subgraphEdges };
      navigator.clipboard.writeText(JSON.stringify(subgraph, null, 2));
      toast.success("Subgraph copied to clipboard.");
  }, [nodes, edges]);


  return {
    nodes,
    edges,
    handleNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    reactFlowInstance,
    onNodeDoubleClick,
    selectedElement,
    setSelectedElement,
    handleDeleteNode,
    handleUngroupTemplate,
    handleSave,
    performSave,
    isSaving,
    validationIssues,
    showValidationDialog,
    setShowValidationDialog,
    handleFocusElement,
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
    },
    leftPanelProps: {
      onAddNode: handleAddNode,
      onClearAllNodes: handleClearAllNodes,
      onLoadTemplate: handleLoadTemplate,
      simulationMode,
      isCollapsed: isLeftPanelCollapsed,
      setIsCollapsed: setIsLeftPanelCollapsed,
      nodes,
      edges,
      onAddMultipleNodes: handleAddMultipleNodes,
      onAddEdges: handleAddEdges,
      onUpdateNode: handleUpdateNode,
      onUpdateEdge: handleUpdateEdge,
      onValidateSupplyChain: handleValidateSupplyChain,
      onUpdateMultipleNodes: handleUpdateMultipleNodes,
      onFindAndSelectNode: handleFindAndSelectNode,
      onFindAndSelectEdges: handleFindAndSelectEdges,
      onApplyLayout: handleApplyLayout,
      onHighlightNodes: handleHighlightNodes,
      onFocusNode: handleFocusNode,
      onZoomToNodes: handleZoomToNodes,
      onGetNodeConnections: handleGetNodeConnections,
      onAnalyzeNetworkPaths: handleAnalyzeNetworkPaths,
      onBulkUpdateEdges: handleBulkUpdateEdges,
      onCreateNodeGroup: handleCreateNodeGroup,
      onExportSubgraph: handleExportSubgraph,
    },
    rightPanelProps: {
        selectedElement,
        nodes,
        onUpdate: (updatedElement: any) => {
            if ('source' in updatedElement) {
                setEdges(edges => edges.map(edge => edge.id === updatedElement.id ? updatedElement : edge));
            } else {
                setNodes(nodes => nodes.map(node => node.id === updatedElement.id ? updatedElement : node));
            }
            setSelectedElement(updatedElement);
        },
        onDelete: handleDeleteNode,
        onUngroup: handleUngroupTemplate,
        onSave: handleSave,
    }
  };
} 