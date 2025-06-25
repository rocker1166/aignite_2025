import { useCopilotAction } from "@copilotkit/react-core";
import { toast } from "sonner";
import { ActionContext } from './types';

type NodeDataWithLocation = {
  label: string;
  location?: Record<string, any>;
  [key: string]: any;
};

export const useNodeActions = ({ nodes, panelId, props }: ActionContext) => {
  const { onAddNode, onUpdateNode, onUpdateMultipleNodes, onFindAndSelectNode } = props;
  // console.log("onUpdateNode",onUpdateNode , "onAddNode",onAddNode, "onUpdateMultipleNodes",onUpdateMultipleNodes, "onFindAndSelectNode",onFindAndSelectNode)

  // Add single node action with copilot-generated properties
  useCopilotAction({
    name: `addSupplyChainNode_${panelId}`,
    description: "Add a single node to the supply chain canvas. Generate appropriate values for all properties based on the node type and label.",
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
      },
      {
        name: "description",
        type: "string",
        description: "Detailed description of what this node does in the supply chain. Should be specific to the node type and label provided.",
        required: true
      },
      {
        name: "address",
        type: "string",
        description: "Physical location/address (e.g., 'California, USA', 'Shanghai, China', 'Texas, USA'). Choose realistic locations based on the node type and label.",
        required: true
      },
      {
        name: "country",
        type: "string",
        description: "The 3-letter ISO 3166-1 alpha-3 code for the country of the address (e.g., USA, CHN). This should match the address.",
        required: true
      },
      {
        name: "capacity",
        type: "number",
        description: "Production or storage capacity. Typical ranges: Suppliers (1000-2000), Factories (500-1000), Warehouses (1500-3000), Distributors (800-1500), Retailers (200-500), Ports (3000-5000)",
        required: true
      },
      {
        name: "leadTime",
        type: "number",
        description: "Lead time in days. Typical ranges: Suppliers (10-21), Factories (7-14), Warehouses (2-5), Distributors (3-7), Retailers (1-3), Ports (5-10)",
        required: true
      },
      {
        name: "riskScore",
        type: "number",
        description: "Risk assessment score between 0.1 and 0.9. Lower is better. Consider factors like location, node type, and geopolitical stability.",
        required: true
      },
      {
        name: "nodeColor",
        type: "string",
        description: "Hex color code for the node. Use distinct colors: Suppliers (#3B82F6 blue), Factories (#EF4444 red), Warehouses (#F59E0B orange), Distributors (#10B981 green), Retailers (#8B5CF6 purple), Ports (#06B6D4 cyan)",
        required: true
      },
      {
        name: "latitude",
        type: "number",
        description: "Latitude coordinate for the location. Should match the provided address.",
        required: true
      },
      {
        name: "longitude",
        type: "number",
        description: "Longitude coordinate for the location. Should match the provided address.",
        required: true
      }
    ],
    handler: ({ nodeType, label, description, address, capacity, leadTime, riskScore, nodeColor, latitude, longitude, country }) => {
      if (onAddNode) {
        // Create node data object
        const nodeData = {
          label,
          description,
          type: nodeType,
          capacity,
          leadTime,
          riskScore,
          location: { lat: latitude, lng: longitude, country },
          address,
          nodeColor
        };

        console.log("🔍 Node Data:", nodeData); 
        
        // Create the node with the generated data - use nodeType directly
        onAddNode(nodeType, label, nodeData);
        
        toast.success(`Added ${label} (${nodeType}) to your supply chain canvas.`);
      }
    }
  });

  // Update single node properties
  useCopilotAction({
    name: `updateNodeProperties_${panelId}`,
    description: "Update properties of a specific node on the canvas.",
    parameters: [
      { name: "nodeId", type: "string", description: "The ID of the node to update.", required: true },
      { name: "nodeLabel", type: "string", description: "The label of the node to update.", required: true },
      { name: "properties", type: "object", description: "An object with properties to update.", required: true },
    ],
    handler: ({ nodeId, nodeLabel, properties }) => {
      console.log("🔍 Starting node update handler with:", { nodeId, nodeLabel, properties });
      console.log(onUpdateNode)
      if (onUpdateNode) {

        console.log("on update node properties")
        let targetNodeId = nodeId;
        let targetNode = null;

        if (nodeId) {
          console.log("🔍 Looking for node with ID:", nodeId);
          targetNode = nodes.find(n => n.id === nodeId);
          if (targetNode) {
            targetNodeId = targetNode.id;
            console.log("✅ Found node by ID:", targetNode);
          } else {
            console.log("❌ No node found with ID:", nodeId);
          }
        }
        
        if (!targetNode && nodeLabel) {
          targetNode = nodes.find(n => n.data?.label === nodeLabel);
          if (targetNode) {
            targetNodeId = targetNode.id;
          }
        }

        if (targetNode && targetNodeId) {
          console.log("--- Debug: updateNodeProperties ---");
          console.log("Received arguments:", { nodeId, nodeLabel, properties });
          console.log("Found target node:", targetNode);
          
          const processedProperties: Record<string, any> = { ...properties };
          const data = targetNode.data as NodeDataWithLocation;
          const newLocation = { ...(data.location || {}) };
          let locationUpdated = false;

          console.log("Initial data for processing:", { processedProperties, newLocation });

          if ('country' in processedProperties) {
            newLocation.country = processedProperties.country;
            delete processedProperties.country;
            locationUpdated = true;
            console.log("`country` property found. newLocation is now:", newLocation);
          }

          if ('countryName' in processedProperties) {
            newLocation.countryName = processedProperties.countryName;
            delete processedProperties.countryName;
            locationUpdated = true;
            console.log("`countryName` property found. newLocation is now:", newLocation);
          }

          if ('latitude' in processedProperties) {
            newLocation.lat = processedProperties.latitude;
            delete processedProperties.latitude;
            locationUpdated = true;
            console.log("`latitude` property found. newLocation is now:", newLocation);
          }

          if ('longitude' in processedProperties) {
            newLocation.lng = processedProperties.longitude;
            delete processedProperties.longitude;
            locationUpdated = true;
            console.log("`longitude` property found. newLocation is now:", newLocation);
          }
          
          if (locationUpdated) {
            processedProperties.location = newLocation;
            console.log("Location was updated. Final `processedProperties` to be sent:", processedProperties);
          } else {
            console.log("No location properties were updated. Final `processedProperties`:", processedProperties);
          }

          onUpdateNode(targetNodeId, processedProperties);
          toast.success(`Updated properties for node ${data.label}.`);
        } else {
          toast.error("Please provide a valid node ID or label.");
          console.error("--- Debug: updateNodeProperties ---");
          console.error("Could not find target node with:", { nodeId, nodeLabel });
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