export const useNodeActions = ({ nodes, panelId, props }: ActionContext) => {
  const { onAddNode, onUpdateNode, onUpdateMultipleNodes, onFindAndSelectNode } = props;
  console.log("onUpdateNode",onUpdateNode , "onAddNode",onAddNode, "onUpdateMultipleNodes",onUpdateMultipleNodes, "onFindAndSelectNode",onFindAndSelectNode)

  // Add single node action with copilot-generated properties
  useCopilotAction({
// ... existing code ...
          }

          onUpdateNode(targetNodeId, processedProperties);
          toast.success(`Updated properties for node ${data.label}.`);
        } else {
          toast.error("Please provide a valid node ID or label.");
          console.error("--- Debug: updateNodeProperties ---");
          console.error("Could not find target node with:", { nodeId, nodeLabel });
// ... existing code ...

}; 