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
  OnSelectionChangeParams,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "sonner";
import { useQueryState } from 'nuqs';

import debounce from 'lodash.debounce';

import SimulationToolbar from '../layout/SimulationToolbar';
import LeftPanel from '../layout/LeftPanel';
import RightPanel from '../layout/RightPanel';
import ValidationDialog from '../forms/ValidationDialog';
import { nodeTypes } from "./CustomNodes";
import { edgeTypes } from "./CustomEdges";
import { useUser } from '@/lib/stores/user';
import { saveSupplyChainToDatabase } from '@/lib/api/supply-chain';
import { validateSupplyChain, ValidationIssue } from '@/lib/validation/supply-chain-validator';
import { useRouter } from 'next/navigation';
import { SUPPLY_CHAIN_TEMPLATES } from '@/constants/digital-twin';


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
  const router = useRouter();
  // Validation state
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // React Flow instance ref for focusing elements
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

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

  // Handle ungrouping a template (removing the group wrapper)
  const handleUngroupTemplate = useCallback((groupId: string) => {
    setNodes(currentNodes => {
      const groupNode = currentNodes.find(node => node.id === groupId);
      if (!groupNode || groupNode.type !== 'group') return currentNodes;

      // Find all child nodes of this group
      const childNodes = currentNodes.filter(node => node.parentId === groupId);
      const otherNodes = currentNodes.filter(node => node.id !== groupId && node.parentId !== groupId);

      // Remove parentId and extent from child nodes and adjust their positions
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

  // Handle double click on nodes (for ungrouping templates)
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'group' && node.data.isTemplate) {
      handleUngroupTemplate(node.id);
    }
  }, [handleUngroupTemplate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ungroup selected template group with 'U' key
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

  // Handle loading a template from the left panel
  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = SUPPLY_CHAIN_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      toast.error('Template not found');
      return;
    }

    // Clone the template data to avoid mutation
    const templateNodes = JSON.parse(JSON.stringify(template.nodes_data));
    const templateEdges = JSON.parse(JSON.stringify(template.edges_data));

    // Generate unique IDs for template nodes to avoid conflicts
    const timestamp = Date.now();
    const nodeIdMap = new Map();

    // Calculate offset position to avoid overlapping with existing nodes
    const existingNodes = nodes;
    let maxX = 0;
    let maxY = 0;
    
    if (existingNodes.length > 0) {
      maxX = Math.max(...existingNodes.map(node => node.position.x + 200)); // Add some padding
      maxY = Math.max(...existingNodes.map(node => node.position.y));
    }

    // Calculate the bounds of the template nodes to create a proper group
    const templateBounds = templateNodes.reduce((bounds: any, node: Node) => {
      return {
        minX: Math.min(bounds.minX, node.position.x),
        minY: Math.min(bounds.minY, node.position.y),
        maxX: Math.max(bounds.maxX, node.position.x + 200), // Assuming average node width
        maxY: Math.max(bounds.maxY, node.position.y + 100)  // Assuming average node height
      };
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

    // Create a group node that will contain all template nodes
    const groupId = `template-group-${timestamp}`;
    const groupWidth = templateBounds.maxX - templateBounds.minX + 40; // Add padding
    const groupHeight = templateBounds.maxY - templateBounds.minY + 80; // Add padding for header
    
    const groupNode = {
      id: groupId,
      type: 'group',
      data: {
        label: template.name,
        description: template.description,
        templateId: template.id,
        isTemplate: true
      },
      position: {
        x: maxX + 100,
        y: maxY > 0 ? maxY + 50 : 50
      },
      style: {
        width: groupWidth,
        height: groupHeight,
        backgroundColor: 'rgba(59, 130, 246, 0.05)', // Light blue background
        border: '2px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        padding: '20px'
      },
      className: 'template-group'
    };

    // Update template nodes with unique IDs and set them as children of the group
    const updatedTemplateNodes = templateNodes.map((node: Node, index: number) => {
      const originalId = node.id;
      const newId = `${node.id}-${timestamp}-${index}`;
      nodeIdMap.set(originalId, newId);

      return {
        ...node,
        id: newId,
        parentId: groupId, // Set the group as parent
        position: {
          // Position relative to the group (offset from template bounds min)
          x: node.position.x - templateBounds.minX + 20, // 20px padding from group edge
          y: node.position.y - templateBounds.minY + 40  // 40px padding for group header
        },
        extent: 'parent' as const, // Constrain movement within parent group
        expandParent: true
      };
    });

    // Update template edges with new node IDs
    const updatedTemplateEdges = templateEdges.map((edge: Edge, index: number) => {
      const newSourceId = nodeIdMap.get(edge.source) || edge.source;
      const newTargetId = nodeIdMap.get(edge.target) || edge.target;
      
      return {
        ...edge,
        id: `${edge.id}-${timestamp}-${index}`,
        source: newSourceId,
        target: newTargetId
      };
    });

    // Migrate edges to ensure proper structure
    const migratedEdges = migrateEdges(updatedTemplateEdges);

    // Add the group node first, then template nodes and edges
    setNodes(currentNodes => [...currentNodes, groupNode, ...updatedTemplateNodes]);
    setEdges(currentEdges => [...currentEdges, ...migratedEdges]);

    // Auto-center the viewport on the newly added template
    setTimeout(() => {
      if (reactFlowInstance.current) {
        const centerX = groupNode.position.x + groupWidth / 2;
        const centerY = groupNode.position.y + groupHeight / 2;
        
        // Center the viewport on the new template with a nice zoom level
        reactFlowInstance.current.setCenter(centerX, centerY, { 
          zoom: 0.8,
          duration: 800  // Smooth animation duration
        });

        // Add a subtle highlight effect by briefly selecting the group
        setTimeout(() => {
          setSelectedElement(groupNode);
          
          // Remove selection after a moment to not interfere with user
          setTimeout(() => {
            setSelectedElement(null);
          }, 1500);
        }, 400);
      }
    }, 100); // Small delay to ensure nodes are rendered

    toast.success(`Added ${template.name} template as a group with ${template.nodes} nodes to canvas`);
  }, [nodes, setNodes, setEdges]);

  // Handle saving the current supply chain with validation
  const handleSave = useCallback(async () => {
    console.log('Starting save process with validation...');

    // Run validation
    const issues = validateSupplyChain(nodes, edges);
    setValidationIssues(issues);

    // If there are errors, show validation dialog and prevent save
    const errors = issues.filter(issue => issue.severity === 'error');
    if (errors.length > 0) {
      console.log(`Found ${errors.length} validation errors, showing dialog`);
      setShowValidationDialog(true);
      return;
    }

    // If there are only warnings, show dialog with option to save
    const warnings = issues.filter(issue => issue.severity === 'warning');
    if (warnings.length > 0) {
      console.log(`Found ${warnings.length} validation warnings, showing dialog`);
      setShowValidationDialog(true);
      return;
    }

    // No issues, proceed with save
    await performSave();
  }, [nodes, edges, selectedSupplyChain, supplyChainName, description, userData]);

  // Actual save function (separated for reuse)
  const performSave = useCallback(async () => {
    setIsSaving(true);
    try {
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

      // Check for form data from URL parameters
      const urlParams = new URLSearchParams(window.location.search);

      // Check for save dialog data from URL parameters (in case user came from validation dialog)
      const saveNameFromUrl = urlParams.get('saveName');
      const saveDescriptionFromUrl = urlParams.get('saveDescription');

      // Use URL save parameters if they exist, otherwise fall back to current state
      const finalSupplyChainName = saveNameFromUrl || supplyChainName;
      const finalDescription = saveDescriptionFromUrl || description;

      const formDataFromUrl = {
        industry: urlParams.get('industry'),
        customIndustry: urlParams.get('customIndustry'),
        productCharacteristics: urlParams.get('productCharacteristics')?.split(',') || [],
        supplierTiers: urlParams.get('supplierTiers'),
        operationsLocation: urlParams.get('operationsLocation')?.split(',') || [],
        country: urlParams.get('country'),
        currency: urlParams.get('currency'),
        shippingMethods: urlParams.get('shippingMethods')?.split(',') || [],
        annualVolumeType: urlParams.get('annualVolumeType'),
        annualVolumeValue: urlParams.get('annualVolumeValue') ? parseInt(urlParams.get('annualVolumeValue')!) : null,
        risks: urlParams.get('risks')?.split(',') || []
      };

      // Check for form data in localStorage
      let formDataFromLocalStorage = null;
      try {
        const storedData = localStorage.getItem(`supplyChain-${selectedSupplyChain}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          formDataFromLocalStorage = {
            industry: parsedData.industry,
            customIndustry: parsedData.customIndustry,
            productCharacteristics: parsedData.productCharacteristics,
            supplierTiers: parsedData.supplierTiers,
            operationsLocation: parsedData.operationsLocation,
            country: parsedData.country,
            currency: parsedData.currency,
            shippingMethods: parsedData.shippingMethods,
            annualVolumeType: parsedData.annualVolumeType,
            annualVolumeValue: parsedData.annualVolumeValue,
            risks: parsedData.risks
          };
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }

      const supplyChainData = {
        id: selectedSupplyChain,
        name: finalSupplyChainName, // Include the supply chain name (from URL params or current state)
        description: finalDescription, // Include the description (from URL params or current state)
        nodes,
        edges,
        connections,
        timestamp: new Date().toISOString(),
        // Include form data if available
        formData: formDataFromLocalStorage || formDataFromUrl,
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

      console.log('💾 Saving supply chain with complete data:', supplyChainData);

      // Log specific form data if available
      if (supplyChainData.formData && Object.values(supplyChainData.formData).some(value => value !== null && value !== undefined && value !== '')) {
        console.log('📋 Original form data being saved:', supplyChainData.formData);
      } else {
        console.log('⚠️ No form data found in URL parameters or localStorage');
      }

      await saveSupplyChainToDatabase(supplyChainData);
      toast.success('Supply chain saved successfully!');
      router.push('/digital-twin');
      setShowValidationDialog(false); // Close validation dialog on success

      // Clear save dialog URL parameters on successful save
      if (saveNameFromUrl || saveDescriptionFromUrl) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('saveName');
        newUrl.searchParams.delete('saveDescription');
        window.history.replaceState({}, '', newUrl.toString());
      }
    } catch (error) {
      console.error('Error saving supply chain:', error);
      toast.error('Failed to save supply chain.');
      throw error; // Re-throw to let the caller handle the error
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, selectedSupplyChain, supplyChainName, description, userData]);

  // Function to focus on a specific element when user clicks "Focus" in validation dialog
  const handleFocusElement = useCallback((elementId: string, elementType: 'node' | 'edge') => {
    if (elementType === 'node') {
      const node = nodes.find(n => n.id === elementId);
      if (node && reactFlowInstance) {
        // Clear current selection
        setSelectedElement(null);

        // Focus on the node
        reactFlowInstance.current?.setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.5 });

        // Select the node after a brief delay to ensure it's visible
        setTimeout(() => {
          setSelectedElement(node);
        }, 300);
      }
    } else if (elementType === 'edge') {
      const edge = edges.find(e => e.id === elementId);
      if (edge && reactFlowInstance) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          // Clear current selection
          setSelectedElement(null);

          // Calculate center point between source and target
          const centerX = (sourceNode.position.x + targetNode.position.x) / 2;
          const centerY = (sourceNode.position.y + targetNode.position.y) / 2;

          // Focus on the edge center
          reactFlowInstance.current?.setCenter(centerX, centerY, { zoom: 1.5 });

          // Select the edge after a brief delay
          setTimeout(() => {
            setSelectedElement(edge);
          }, 300);
        }
      }
    }

    // Close validation dialog when focusing on an element
    setShowValidationDialog(false);
  }, [nodes, edges, reactFlowInstance]);



  // Handle clearing all nodes and edges
  const handleClearAllNodes = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedElement(null);
  }, [setNodes, setEdges]);

  // Handle deleting a single node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(currentNodes => {
      const nodeToDelete = currentNodes.find(node => node.id === nodeId);
      
      // If deleting a template group, we need to handle child nodes
      if (nodeToDelete && nodeToDelete.type === 'group' && nodeToDelete.data?.isTemplate) {
        // Find all child nodes of this group
        const childNodes = currentNodes.filter(node => node.parentId === nodeId);
        
        // Remove the group node and all its child nodes
        const remainingNodes = currentNodes.filter(node => 
          node.id !== nodeId && node.parentId !== nodeId
        );
        
        // Also remove edges that connect to any of the child nodes
        setEdges(currentEdges => 
          currentEdges.filter(edge => {
            const isConnectedToGroup = edge.source === nodeId || edge.target === nodeId;
            const isConnectedToChild = childNodes.some(child => 
              edge.source === child.id || edge.target === child.id
            );
            return !isConnectedToGroup && !isConnectedToChild;
          })
        );
        
        toast.success(`Deleted ${nodeToDelete.data.label} template group and ${childNodes.length} child nodes`);
        return remainingNodes;
      } else {
        // Regular node deletion
        const filteredNodes = currentNodes.filter(node => node.id !== nodeId);
        
        // Remove all edges connected to this node
        setEdges(currentEdges => 
          currentEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
        );
        
        return filteredNodes;
      }
    });
    
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
          onLoadTemplate={handleLoadTemplate}
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
            onInit={(instance) => { reactFlowInstance.current = instance; }}
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
          onUngroup={handleUngroupTemplate}
          onSave={handleSave}
        />
      </div>

      {/* Validation Dialog */}
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