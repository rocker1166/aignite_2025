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
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "sonner";

import SimulationToolbar from '../../../components/SimulationToolbar';
import LeftPanel from '../../../components/LeftPanel';
import RightPanel from '../../../components/RightPanel';
import { nodeTypes } from "@/components/CustomNodes";
import { useUser } from '@/lib/stores/user';
import insertSupplyChain from '@/utils/functions/insertSupplyChain';

const initialNodes: Node[] = [
  {
    id: 'supplier-1',
    type: 'supplierNode',
    data: {
      label: 'Supplier A',
      description: 'Primary supplier for raw materials based in Los Angeles.',
      type: 'Supplier',
      capacity: 1000,
      leadTime: 14,
      riskScore: 0.2,
      location: { lat: 34.052, lng: -118.243 },
      address: '123 Supplier St, Los Angeles, CA 90001'
    },
    position: { x: 250, y: 100 },
  },
  {
    id: 'factory-1',
    type: 'factoryNode',
    data: {
      label: 'Factory B',
      description: 'Main assembly facility located in New York.',
      type: 'Factory',
      capacity: 800,
      leadTime: 5,
      riskScore: 0.1,
      location: { lat: 40.712, lng: -74.006 },
      address: '456 Factory Ave, New York, NY 10001'
    },
    position: { x: 450, y: 200 },
  },
  {
    id: 'port-1',
    type: 'portNode',
    data: {
      label: 'Port C',
      description: 'Major shipping port in San Francisco.',
      type: 'Port',
      capacity: 5000,
      leadTime: 3,
      riskScore: 0.4,
      location: { lat: 37.774, lng: -122.419 },
      address: '789 Port Blvd, San Francisco, CA 94111'
    },
    position: { x: 650, y: 100 },
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'supplier-1',
    target: 'factory-1',
    data: {
      mode: 'rail',
      cost: 200,
      transitTime: 5,
      riskMultiplier: 1.2
    }
  },
  {
    id: 'e2-3',
    source: 'factory-1',
    target: 'port-1',
    data: {
      mode: 'road',
      cost: 150,
      transitTime: 2,
      riskMultiplier: 1.0
    }
  }
];

export default function DigitalTwinPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [selectedSupplyChain, setSelectedSupplyChain] = useState("default-chain");
  const [supplyChainName, setSupplyChainName] = useState("Default Supply Chain");
  const [description, setDescription] = useState(""); // Add description state
  const [simulationMode, setSimulationMode] = useState(false);
  const { userData } = useUser();
  console.log("userdata", userData)
  console.log("company description", userData?.description)
  console.log("company name", userData?.organisation_name)
  console.log("company id", userData?.id)
  console.log("industry", userData?.industry)
  console.log("sub_industry", userData?.sub_industry)
  console.log("location", userData?.location)


  // When a node is clicked, set it as the selected element for the right panel
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedElement(node);
  }, []);

  // When an edge is clicked, set it as the selected element for the right panel
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setSelectedElement(edge);
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
        riskMultiplier: 1.0
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

  // Handle running a simulation
  const handleRunSimulation = useCallback(() => {
    setSimulationMode(true);
    console.log('Running simulation with current graph');
    // Here you would call your simulation backend and update nodes/edges
    // with risk scores and visualization highlights

    // Simulate updating risk scores (in a real app, this would come from backend)
    setTimeout(() => {
      setNodes(nodes => nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          riskScore: Math.random()
        },
        style: {
          ...node.style,
          background: Math.random() > 0.7 ? '#ff4d4f' : Math.random() > 0.4 ? '#faad14' : '#52c41a'
        }
      })));

      setEdges(edges => edges.map(edge => ({
        ...edge,
        data: {
          ...edge.data,
          riskMultiplier: 1 + Math.random(),
        },
        animated: Math.random() > 0.5
      })));
    }, 1000);
  }, [setNodes, setEdges]);

  // Handle exporting the digital twin
  const handleExport = useCallback(() => {
    const exportData = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply-chain-${selectedSupplyChain}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [nodes, edges, selectedSupplyChain]);

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
        onRun={handleRunSimulation}
        onExport={handleExport}
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
        />

        <div className="flex-1 h-full border border-gray-200">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
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