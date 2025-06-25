import { useCopilotAction } from "@copilotkit/react-core";
import { toast } from "sonner";
import { ActionContext } from './types';

export const useNodeActions = ({ nodes, panelId, props }: ActionContext) => {
  const { onAddNode, onUpdateNode, onUpdateMultipleNodes, onFindAndSelectNode } = props;

  // Add single node action
  useCopilotAction({
    name: `addSupplyChainNode_${panelId}`,
    description: "Add a single node to the supply chain canvas with proper type mapping",
    parameters: [
      {
        name: "nodeType",
        type: "string",
        description: "Type of node to add (supplier, manufacturer, factory, warehouse, distributor, distribution, retailer, customer, 3pl, port)",
        required: true
      },
      {
        name: "label",
        type: "string", 
        description: "Display name/label for the node",
        required: true
      }
    ],
    handler: ({ nodeType, label }) => {
      if (onAddNode) {
        // Map user-friendly names to internal node types
        const nodeTypeMap: Record<string, string> = {
          'supplier': 'supplierNode',
          'manufacturer': 'factoryNode',
          'factory': 'factoryNode',
          'warehouse': 'warehouseNode',
          'distributor': 'distributionNode',
          'distribution': 'distributionNode',
          'retailer': 'retailerNode',
          'customer': 'retailerNode',
          '3pl': 'distributionNode',
          'port': 'portNode'
        };
        
        const mappedType = nodeTypeMap[nodeType.toLowerCase()] || nodeType;
        onAddNode(mappedType, label);
        toast.success(`✅ Added ${label} (${nodeType}) to your supply chain canvas.`);
      }
    }
  });

  // Update single node properties
  useCopilotAction({
    name: `updateNodeProperties_${panelId}`,
    description: "Update properties of a specific node on the canvas.",
    parameters: [
      { name: "nodeId", type: "string", description: "The ID of the node to update.", required: false },
      { name: "nodeLabel", type: "string", description: "The label of the node to update.", required: false },
      { name: "properties", type: "object", description: "An object with properties to update.", required: true },
    ],
    handler: ({ nodeId, nodeLabel, properties }) => {
      if (onUpdateNode) {
        let targetNodeId = nodeId;
        if (!targetNodeId && nodeLabel) {
          const foundNode = nodes.find(n => n.data?.label === nodeLabel);
          if (foundNode) {
            targetNodeId = foundNode.id;
          } else {
            toast.error(`Node with label "${nodeLabel}" not found.`);
            return;
          }
        }

        if (targetNodeId) {
          onUpdateNode(targetNodeId, properties);
          toast.success(`Updated properties for node ${nodeLabel || targetNodeId}.`);
        } else {
          toast.error("Please provide either a node ID or a node label.");
        }
      }
    },
  });

  // Update multiple nodes
  useCopilotAction({
    name: `updateMultipleNodeProperties_${panelId}`,
    description: "Update properties for multiple nodes at once based on a filter.",
    parameters: [
      { name: "filter", type: "object", description: "Filter to select nodes (e.g., { \"type\": \"supplierNode\", \"data.country\": \"CN\" }).", required: true },
      { name: "properties", type: "object", description: "Properties to update.", required: true },
    ],
    handler: ({ filter, properties }) => {
      if (onUpdateMultipleNodes) {
        const getProperty = (obj: any, path: string) => path.split('.').reduce((o, i) => o?.[i], obj);
        
        const filteredNodes = nodes.filter(node => {
          return Object.entries(filter).every(([path, value]) => {
            const nodeValue = getProperty(node, path);
            return nodeValue === value;
          });
        });

        if (filteredNodes.length > 0) {
          const nodeIds = filteredNodes.map(n => n.id);
          onUpdateMultipleNodes(nodeIds, properties);
          toast.success(`Updated ${nodeIds.length} nodes.`);
        } else {
          toast.info("No nodes matched the filter criteria.");
        }
      }
    },
  });

  // Find and select node
  useCopilotAction({
    name: `findAndSelectNode_${panelId}`,
    description: "Finds and selects a node on the canvas by its label or type.",
    parameters: [
      { name: "query", type: "string", description: "The label, type, or other property to search for.", required: true },
    ],
    handler: ({ query }) => {
      if (onFindAndSelectNode) {
        const lowerCaseQuery = query.toLowerCase();
        const foundNode = nodes.find(n => 
          n.data?.label.toLowerCase().includes(lowerCaseQuery) ||
          n.type?.toLowerCase().includes(lowerCaseQuery)
        );

        if (foundNode) {
          onFindAndSelectNode(foundNode.id);
          toast.success(`Found and selected node: ${foundNode.data.label}`);
        } else {
          toast.error(`Could not find a node matching "${query}".`);
        }
      }
    },
  });
}; 