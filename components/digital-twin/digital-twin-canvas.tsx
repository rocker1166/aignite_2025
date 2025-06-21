"use client";
// src/pages/DigitalTwinPage.tsx
import { useState, useCallback } from 'react';
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

import SimulationToolbar from './SimulationToolbar';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import { nodeTypes } from "./CustomNodes";
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [selectedSupplyChain, setSelectedSupplyChain] = useState("default-chain");
  const [supplyChainName, setSupplyChainName] = useState("Default Supply Chain");
  const [description, setDescription] = useState(""); // Add description state
  const [simulationMode, setSimulationMode] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const { userData } = useUser();
  


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
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
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
        />
      </div>
    </div>
  );
} 