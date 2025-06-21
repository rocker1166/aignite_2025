import { FC, useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import NodeConfiguration from './NodeConfiguration';
import EdgeConfiguration from './EdgeConfiguration';

interface RightPanelProps {
  selectedElement: Node | Edge | null;
  onUpdate: (updatedElement: Node | Edge) => void;
  nodes?: Node[]; // Add nodes prop to find source and target nodes
}

const RightPanel: FC<RightPanelProps> = ({ selectedElement, onUpdate, nodes = [] }) => {
  const [formValues, setFormValues] = useState<any>({});
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Update form values when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setFormValues(selectedElement.data || {});
    } else {
      setFormValues({});
    }
  }, [selectedElement]);

  // Collapsed state - just show the toggle button
  if (isCollapsed) {
    return (
      <div className="w-14 h-full border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shadow-sm">
        {/* Spacer to push content to center and button to bottom */}
        <div className="flex-1">
          {/* Vertical text when collapsed */}
          {selectedElement && (
            <div className="h-full flex items-center justify-center">
              <div className="transform -rotate-90 whitespace-nowrap text-xs text-muted-foreground font-medium">
                Properties
              </div>
            </div>
          )}
        </div>
        
        {/* Expand button fixed at bottom */}
        <div className="mt-auto border-t border-border">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-4 hover:bg-accent transition-colors group"
            title="Expand Properties Panel"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <div className="w-80 border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shadow-sm">
        <div className="flex-1 p-8">
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">
                Properties Panel
              </h3>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Icon and animation */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                {/* Outer ring with subtle animation */}
                <div className="absolute inset-0 w-24 h-24 border-2 border-muted-foreground/20 rounded-full animate-pulse"></div>
                
                {/* Inner content */}
                <div className="absolute inset-3 w-18 h-18 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full flex items-center justify-center shadow-inner">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-9 w-9 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Main message */}
            <div className="space-y-4 max-w-sm">
              <p className="text-base font-medium text-foreground">
                Select an element to get started
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click on any node or edge in the canvas to view and edit its properties, configuration, and details.
              </p>
            </div>

            {/* Helpful tips */}
            <div className="w-full max-w-sm">
              <div className="bg-muted/50 rounded-xl p-5 border border-border/50 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Tip:</span> You can modify properties like capacity, costs, and upload product sheets for each node.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collapse button at bottom */}
        <div className="flex justify-center p-4 border-t border-border">
          <button
            onClick={() => setIsCollapsed(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors group"
            title="Collapse Properties Panel"
          >
            <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Hide Panel</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 5l7 7-7 7M5 5l7 7-7 7" 
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };

  const handleMapCoordinatesChange = (lat: string, lng: string) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  const handleSubmit = () => {
    const updatedElement = {
      ...selectedElement,
      data: {
        ...formValues
      }
    };
    onUpdate(updatedElement);
  };

  // Determine if we're dealing with a node or edge
  const isNode = !('source' in selectedElement);

  // Render the appropriate configuration component
  const renderConfiguration = () => {
    if (isNode) {
      return (
        <NodeConfiguration
          selectedNode={selectedElement as Node}
          formValues={formValues}
          onInputChange={handleInputChange}
          onMapCoordinatesChange={handleMapCoordinatesChange}
        />
      );
    } else {
      const edge = selectedElement as Edge;
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      
      return (
        <EdgeConfiguration
          selectedEdge={edge}
          formValues={formValues}
          onInputChange={handleInputChange}
          sourceNode={sourceNode}
          targetNode={targetNode}
        />
      );
    }
  };

  return (
    <div className="w-80 border-l border-border bg-card/50 backdrop-blur-sm shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border bg-gradient-to-r from-card to-card/80">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Properties</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Editing {isNode ? 'node' : 'edge'}: <span className="font-medium text-blue-600 dark:text-blue-400">{formValues.label || selectedElement.id}</span>
        </p>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderConfiguration()}
        </div>
      </div>
      
      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-6 border-t border-border bg-gradient-to-r from-card to-card/80 space-y-4">
        {/* Save Button */}
        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors group"
          title="Collapse Properties Panel"
        >
          <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Hide Panel</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 5l7 7-7 7M5 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RightPanel; 