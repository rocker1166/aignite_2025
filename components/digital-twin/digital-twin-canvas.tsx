"use client";
// src/pages/DigitalTwinPage.tsx
import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  OnSelectionChangeParams 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "sonner";
import { useQueryState } from 'nuqs';

import debounce from 'lodash.debounce';

import SimulationToolbar from './SimulationToolbar';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import { nodeTypes } from "./CustomNodes";
import { edgeTypes } from "../CustomEdges";
import { useUser } from '@/lib/stores/user';
import insertSupplyChain from '@/utils/functions/insertSupplyChain';


interface DigitalTwinCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export default function DigitalTwinCanvas({ 
  initialNodes = [], 
  initialEdges = [] 
}: DigitalTwinCanvasProps) {
  // URL state management
  const [archParam, setArchParam] = useQueryState('arch', {
    defaultValue: '',
    shallow: false
  });
  
  // Initialize with empty state - will be populated by hydration effect
  const [hydratedNodes, setHydratedNodes] = useState<Node[]>([]);
  const [hydratedEdges, setHydratedEdges] = useState<Edge[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(hydratedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(hydratedEdges);
  
  // Track if we need to force URL update
  const forceURLUpdate = useRef(false);
  
  // Custom nodes change handler to force URL updates
  const handleNodesChange = useCallback((changes: any[]) => {
    console.log('Nodes changed:', changes);
    onNodesChange(changes);
    
    // Check if any change involves position updates
    const hasPositionChange = changes.some(change => 
      change.type === 'position' || change.type === 'dimensions'
    );
    
    if (hasPositionChange) {
      console.log('Position change detected, forcing URL update');
      forceURLUpdate.current = true;
    }
  }, [onNodesChange]);
  
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [selectedSupplyChain, setSelectedSupplyChain] = useState("default-chain");
  const [supplyChainName, setSupplyChainName] = useState("Default Supply Chain");
  const [description, setDescription] = useState(""); // Add description state
  const [simulationMode, setSimulationMode] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const { userData } = useUser();
  
  // Track if we're updating from URL to prevent infinite loops
  const isUpdatingFromURL = useRef(false);

    // Function to ensure edges have the correct type and data structure
  const migrateEdges = (edges: Edge[]) => {
    return edges.map(edge => ({
      ...edge,
      type: edge.type || 'transportEdge', // Ensure all edges use our custom type
      data: {
        mode: 'road',
        cost: 100,
        transitTime: 1,
        riskMultiplier: 1.0,
        avgDelayDays: 0,
        frequencyOfDisruptions: 0,
        hasAltRoute: false,
        passesThroughChokepoint: false,
        ...edge.data // Preserve existing data
      }
    }));
  };

  // Hydrate state from URL on component mount
  useEffect(() => {
    const hydrateFromURL = async () => {
      console.log('🔄 hydrateFromURL called - isHydrated:', isHydrated);
      console.log('📦 archParam exists:', !!archParam, 'length:', archParam?.length);
      console.log('📦 initialNodes length:', initialNodes.length);
      console.log('📦 initialEdges length:', initialEdges.length);
      
      if (!isHydrated) {
        if (archParam) {
          try {
            console.log('🎯 Starting URL hydration with archParam:', archParam.substring(0, 100) + '...');
            
            // Decode the base64 URL parameter directly to JSON
            console.log('🔍 Step 1: Decoding base64 to JSON string');
            
            // Add back padding if needed for base64
            const padding = '='.repeat((4 - (archParam.length % 4)) % 4);
            const paddedBase64 = archParam
              .replace(/-/g, '+')
              .replace(/_/g, '/') + padding;
            
            const jsonString = atob(paddedBase64);
            console.log('✅ Base64 decoded, JSON string length:', jsonString.length);
            console.log('🔍 First 200 chars of JSON:', jsonString.substring(0, 200));
            
            console.log('🔍 Step 2: Parsing JSON');
            const canvasData = JSON.parse(jsonString);
            console.log('✅ JSON parsed successfully');
            
            console.log('🔍 Canvas data structure:', {
              hasNodes: !!canvasData.nodes,
              hasEdges: !!canvasData.edges,
              nodesCount: canvasData.nodes?.length || 0,
              edgesCount: canvasData.edges?.length || 0,
              timestamp: canvasData.timestamp,
              keys: Object.keys(canvasData)
            });
            
            if (canvasData.nodes && canvasData.edges) {
              console.log('🎯 Setting nodes and edges from URL data');
              console.log('📊 Nodes to set:', canvasData.nodes.length);
              console.log('🔗 Edges to set:', canvasData.edges.length);
              
              const migratedEdges = migrateEdges(canvasData.edges);
              
              setHydratedNodes(canvasData.nodes);
              setHydratedEdges(migratedEdges);
              
              // Update React Flow state
              isUpdatingFromURL.current = true;
              setNodes(canvasData.nodes);
              setEdges(migratedEdges);
              
              console.log('✅ State updated from URL');
              
              // Reset flag after a short delay to ensure state updates are complete
              setTimeout(() => {
                isUpdatingFromURL.current = false;
                console.log('🏁 URL hydration complete');
              }, 100);
            } else {
              console.warn('⚠️ Canvas data missing nodes or edges:', {
                nodes: canvasData.nodes,
                edges: canvasData.edges
              });
            }
          } catch (error) {
            console.error('❌ Failed to hydrate canvas state from URL:', error);
            console.error('❌ Error details:', {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            });
            // Fall back to initial props only if URL parsing fails
            console.log('🔄 Falling back to initial props');
            const migratedInitialEdges = migrateEdges(initialEdges);
            setHydratedNodes(initialNodes);
            setHydratedEdges(migratedInitialEdges);
            setNodes(initialNodes);
            setEdges(migratedInitialEdges);
          }
        } else {
          // No URL param - use initial props
          console.log('📦 No URL parameter, using initial props - nodes:', initialNodes.length, 'edges:', initialEdges.length);
          const migratedInitialEdges = migrateEdges(initialEdges);
          setHydratedNodes(initialNodes);
          setHydratedEdges(migratedInitialEdges);
          setNodes(initialNodes);
          setEdges(migratedInitialEdges);
        }
        setIsHydrated(true);
        console.log('✅ Hydration complete, isHydrated set to true');
      } else {
        console.log('⚠️ Already hydrated, skipping');
      }
    };

    hydrateFromURL();
  }, [archParam, initialNodes, initialEdges, isHydrated, setNodes, setEdges]);

  // Debounced function to update URL with current state
  const debouncedUpdateURL = useCallback(
    debounce((currentNodes: Node[], currentEdges: Edge[]) => {
      console.log('debouncedUpdateURL called', {
        isUpdatingFromURL: isUpdatingFromURL.current,
        nodesLength: currentNodes.length,
        edgesLength: currentEdges.length
      });
      
      if (isUpdatingFromURL.current) return;
      
      try {
        const canvasData = {
          nodes: currentNodes,
          edges: currentEdges,
          timestamp: Date.now()
        };
        
        const jsonString = JSON.stringify(canvasData);
        console.log('JSON string length:', jsonString.length);
        
        // Check if the JSON string is too large (URLs have limitations)
        if (jsonString.length > 50000) {
          console.warn('Canvas data too large for URL, skipping URL update');
          return;
        }
        
        // Encode JSON directly to base64
        const base64String = btoa(jsonString)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        console.log('Base64 string length:', base64String.length);
        console.log('Setting archParam to:', base64String.substring(0, 50) + '...');
        
        // Use replace instead of push to avoid adding to browser history
        // This prevents unwanted page refreshes
        setArchParam(base64String, { 
          scroll: false,
          shallow: true
        });
      } catch (error) {
        console.error('Failed to update URL with canvas state:', error);
      }
    }, 1000), // 1000ms debounce to capture all position changes
    [setArchParam]
  );

  // Update URL when nodes or edges change
  useEffect(() => {
    console.log('URL update effect triggered:', {
      isHydrated,
      nodesLength: nodes.length,
      edgesLength: edges.length,
      isUpdatingFromURL: isUpdatingFromURL.current,
      forceUpdate: forceURLUpdate.current
    });
    
    // Always update URL when hydrated and not currently updating from URL
    if (isHydrated && !isUpdatingFromURL.current) {
      console.log('Calling debouncedUpdateURL with nodes/edges');
      debouncedUpdateURL(nodes, edges);
      
      // Reset force update flag
      if (forceURLUpdate.current) {
        forceURLUpdate.current = false;
      }
    }
  }, [nodes, edges, isHydrated, debouncedUpdateURL]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateURL.cancel();
    };
  }, [debouncedUpdateURL]);

  // Handle selection changes (both nodes and edges)
  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const { nodes: selectedNodes, edges: selectedEdges } = params;
    
    if (selectedNodes.length > 0) {
      setSelectedElement(selectedNodes[0]);
      setIsLeftPanelCollapsed(true);
    } else if (selectedEdges.length > 0) {
      setSelectedElement(selectedEdges[0]);
      setIsLeftPanelCollapsed(true);
    } else {
      // Nothing selected
      setSelectedElement(null);
    }
  }, []);

  // Handle new connections between nodes
  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      ...connection,
      id: `e${connection.source}-${connection.target}`,
      type: 'transportEdge', // Set the edge type to use our custom edge
      data: {
        mode: 'road',
        cost: 100,
        transitTime: 1,
        riskMultiplier: 1.0,
        // Initialize new dynamic fields
        avgDelayDays: 0,
        frequencyOfDisruptions: 0,
        hasAltRoute: false,
        passesThroughChokepoint: false
      }
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  // Handle adding a new node from the left panel
  const handleAddNode = useCallback((nodeType: string) => {
    const newNode = {
      id: `${nodeType.toLowerCase()}-${nodes.length + 1}`,
      type: `${nodeType.toLowerCase()}Node`,
      data: {
        label: `New ${nodeType}`,
        description: `Description for ${nodeType}`, // Adding default description
        type: nodeType,
        capacity: 500,
        leadTime: 7,
        riskScore: 0.3,
        location: { lat: 0, lng: 0 },
        address: `Default address for ${nodeType}` // Adding default address
      },
      position: {
        x: 300 + Math.random() * 100,
        y: 300 + Math.random() * 100
      },
    };
    setNodes(nodes => [...nodes, newNode]);
    setSelectedElement(newNode);
  }, [nodes, setNodes]);

  // Handle saving the current supply chain
  const handleSave = useCallback(() => {
    // Create connections data with detailed information
    const connections = edges.map(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      return {
        sourceId: edge.source,
        targetId: edge.target,
        sourceLabel: sourceNode?.data.label,
        targetLabel: targetNode?.data.label,
        mode: edge.data.mode,
        cost: edge.data.cost,
        transitTime: edge.data.transitTime,
        riskMultiplier: edge.data.riskMultiplier
      };
    });

    const supplyChainData = {
      id: selectedSupplyChain,
      name: supplyChainName, // Include the supply chain name
      description: description, // Include the description
      nodes,
      edges,
      connections,
      timestamp: new Date().toISOString(),
      // Include organization data at the top level
      organisation: {
        id: userData?.id,
        name: userData?.organisation_name,
        description: userData?.description,
        industry: userData?.industry,
        sub_industry: userData?.sub_industry,
        location: userData?.location
      }
    };

    console.log('Saving supply chain:', supplyChainData);
    insertSupplyChain(supplyChainData)
      .then(() => {
        toast.success('Supply chain saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving supply chain:', error);
        toast.error('Failed to save supply chain.');
      });
  }, [nodes, edges, selectedSupplyChain, supplyChainName, description, userData]);



  // Handle clearing all nodes and edges
  const handleClearAllNodes = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedElement(null);
  }, [setNodes, setEdges]);

  // Handle deleting a single node
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Remove the node
    setNodes(nodes => nodes.filter(node => node.id !== nodeId));
    // Remove all edges connected to this node
    setEdges(edges => edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    // Clear selection if the deleted node was selected
    setSelectedElement(null);
  }, [setNodes, setEdges]);

  // Don't render until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <SimulationToolbar
        selectedSupplyChain={selectedSupplyChain}
        setSelectedSupplyChain={setSelectedSupplyChain}
        onSave={handleSave}
        simulationMode={simulationMode}
        setSimulationMode={setSimulationMode}
        supplyChainName={supplyChainName}
        setSupplyChainName={setSupplyChainName}
        description={description}
        setDescription={setDescription}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          onAddNode={handleAddNode}
          onClearAllNodes={handleClearAllNodes}
          simulationMode={simulationMode}
          isCollapsed={isLeftPanelCollapsed}
          setIsCollapsed={setIsLeftPanelCollapsed}
        />

        <div className="flex-1 h-full border border-gray-200">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            preventScrolling={false}
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick={false}
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>

        <RightPanel
          selectedElement={selectedElement}
          nodes={nodes}
          onUpdate={(updatedElement) => {
            if ('source' in updatedElement) {
              // It's an edge
              setEdges(edges =>
                edges.map(edge =>
                  edge.id === updatedElement.id ? updatedElement : edge
                )
              );
            } else {
              // It's a node
              setNodes(nodes =>
                nodes.map(node =>
                  node.id === updatedElement.id ? updatedElement : node
                )
              );
            }
            setSelectedElement(updatedElement);
          }}
          onDelete={handleDeleteNode}
        />
      </div>
    </div>
  );
} 