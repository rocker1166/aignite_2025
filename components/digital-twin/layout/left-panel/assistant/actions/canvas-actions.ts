import { useCopilotAction } from "@copilotkit/react-core";
import { toast } from "sonner";
import { ActionContext, LayoutConfiguration } from './types';
import { LayoutManager } from '@/lib/layout/layout-algorithms';
import { GraphAnalytics } from '@/lib/analysis/graph-analytics';

export const useCanvasActions = ({ nodes, panelId, props }: ActionContext) => {
  const { onApplyLayout, onHighlightNodes, onClearCanvas } = props;

  // Apply layout with enhanced algorithm support
  useCopilotAction({
    name: `applyLayout_${panelId}`,
    description: "Automatically arranges nodes and edges on the canvas using advanced layout algorithms.",
    parameters: [
      { name: "layoutType", type: "string", description: "The layout algorithm to use ('dagre-TB', 'dagre-LR', 'elk', 'hierarchical', 'auto').", required: false, default: 'auto' },
      { name: "spacing", type: "object", description: "Node spacing configuration", required: false },
      { name: "animation", type: "boolean", description: "Whether to animate the layout transition", required: false, default: true }
    ],
    handler: async ({ layoutType = 'auto', spacing, animation = true }) => {
      if (onApplyLayout) {
        try {
          let selectedLayout = layoutType;
          
          // Auto-select optimal layout if requested
          if (layoutType === 'auto') {
            selectedLayout = LayoutManager.selectOptimalLayout(nodes, props.edges || []);
          }

          // Apply the layout using the LayoutManager
          let layoutedData;
          const config: LayoutConfiguration = {
            algorithm: selectedLayout.includes('dagre') ? 'dagre' : 
                      selectedLayout === 'elk' ? 'elk' : 
                      selectedLayout === 'hierarchical' ? 'hierarchical' : 'dagre',
            direction: selectedLayout.includes('LR') ? 'LR' : 'TB',
            spacing: (spacing && typeof spacing === 'object' && 'node' in spacing && 'rank' in spacing) ? { node: (spacing as any).node, rank: (spacing as any).rank } : { node: 150, rank: 200 },
            animation
          };

          switch (config.algorithm) {
            case 'dagre':
              layoutedData = await LayoutManager.applyDagreLayout(nodes, props.edges || [], config.direction);
              break;
            case 'elk':
              layoutedData = await LayoutManager.applyELKLayout(nodes, props.edges || [], config);
              break;
            case 'hierarchical':
              layoutedData = await LayoutManager.applyHierarchicalLayout(nodes, props.edges || []);
              break;
            default:
              layoutedData = await LayoutManager.applyDagreLayout(nodes, props.edges || [], config.direction);
          }

          // Update nodes with new positions via the canvas
          if (props.onUpdateMultipleNodes) {
            const nodeIds = layoutedData.nodes.map(node => node.id);
            const nodeProperties = layoutedData.nodes.reduce((acc, node) => ({ ...acc, [node.id]: { position: node.position } }), {} as any);
            props.onUpdateMultipleNodes(nodeIds, nodeProperties);
          } else {
            onApplyLayout(selectedLayout);
          }

          toast.success(`Applied ${selectedLayout} layout with ${layoutedData.nodes.length} nodes arranged.`);
        } catch (error) {
          console.error('Layout error:', error);
          toast.error(`Failed to apply ${layoutType} layout. Using fallback.`);
          onApplyLayout(layoutType);
        }
      }
    },
  });

  // Highlight nodes by property
  useCopilotAction({
    name: `highlightNodesByProperty_${panelId}`,
    description: "Highlights all nodes that match certain criteria.",
    parameters: [
      { name: "filter", type: "object", description: "Filter to highlight nodes (e.g., { \"data.country\": \"USA\" } or { \"data.riskScore\": { \">\": 0.7 } }).", required: true },
    ],
    handler: ({ filter }) => {
      if (onHighlightNodes) {
        const getProperty = (obj: any, path: string) => path.split('.').reduce((o, i) => o?.[i], obj);

        const highlightedNodes = nodes.filter(node => {
          return Object.entries(filter).every(([path, condition]) => {
            const nodeValue = getProperty(node, path);
            if (typeof condition === 'object' && condition !== null) {
              return Object.entries(condition).every(([operator, value]) => {
                switch (operator) {
                  case '>': return nodeValue > (value as any);
                  case '<': return nodeValue < (value as any);
                  case '>=': return nodeValue >= (value as any);
                  case '<=': return nodeValue <= (value as any);
                  case '===': return nodeValue === value;
                  case '!==': return nodeValue !== value;
                  default: return false;
                }
              });
            }
            return nodeValue === condition;
          });
        });

        if (highlightedNodes.length > 0) {
          onHighlightNodes(highlightedNodes.map(n => n.id));
          toast.success(`Highlighted ${highlightedNodes.length} nodes.`);
        } else {
          toast.info("No nodes matched the highlighting criteria.");
        }
      }
    },
  });

  // Clear canvas
  useCopilotAction({
    name: `clearCanvas_${panelId}`,
    description: "Clear all nodes and edges from the canvas",
    parameters: [],
    handler: () => {
      if (onClearCanvas) {
        onClearCanvas();
        toast.success("🧹 Cleared the canvas. You can now start building a new supply chain.");
      }
    }
  });
}; 