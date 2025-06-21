import React from 'react';
import { Factory, Building2, Truck, Package, Settings } from 'lucide-react';

/**
 * Maps node types to their default colors
 * @param nodeType - The type of the node
 * @returns The default color as a hex string
 */
export const getDefaultColorFromNodeType = (nodeType: string): string => {
  const nodeTypeMap: { [key: string]: string } = {
    'supplier': '#dbeafe', // bg-blue-100
    'factory': '#f3e8ff', // bg-purple-100
    'port': '#cffafe', // bg-cyan-100
    'warehouse': '#fef3c7', // bg-amber-100
    'distribution': '#d1fae5' // bg-emerald-100
  };
  return nodeTypeMap[nodeType?.toLowerCase()] || '#ffffff';
};

/**
 * Gets the appropriate icon for a node type
 * @param type - The node type
 * @returns React element for the icon
 */
export const getNodeTypeIcon = (type: string): React.ReactElement => {
  switch (type.toLowerCase()) {
    case 'factory':
    case 'manufacturer':
      return <Factory className="w-4 h-4" />;
    case 'warehouse':
    case 'distribution center':
      return <Building2 className="w-4 h-4" />;
    case 'supplier':
    case 'vendor':
      return <Package className="w-4 h-4" />;
    case 'logistics':
    case 'transport':
      return <Truck className="w-4 h-4" />;
    default:
      return <Settings className="w-4 h-4" />;
  }
};

/**
 * Initializes the color for a node based on formValues or node type
 * @param formValues - The form values object
 * @param selectedNode - The selected node
 * @returns The initialized color as a hex string
 */
export const initializeNodeColor = (formValues: any, selectedNode?: any): string => {
  if (formValues.nodeColor) {
    return formValues.nodeColor;
  }
  // For nodes without explicit nodeColor, use the default color based on type
  const nodeType = formValues.type || selectedNode?.data?.type || '';
  return getDefaultColorFromNodeType(nodeType);
};
