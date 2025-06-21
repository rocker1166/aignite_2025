import { FC, useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import NodeConfiguration from './NodeConfiguration';
import EdgeConfiguration from './EdgeConfiguration';

interface RightPanelProps {
  selectedElement: Node | Edge | null;
  onUpdate: (updatedElement: Node | Edge) => void;
  onDelete?: (elementId: string) => void; // Add onDelete prop
  nodes?: Node[]; // Add nodes prop to find source and target nodes
}

const RightPanel: FC<RightPanelProps> = ({ selectedElement, onUpdate, onDelete, nodes = [] }) => {
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

  // Animation variants
  const panelVariants = {
    collapsed: {
      width: 56, // w-14 equivalent
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1], // Smooth cubic-bezier
      }
    },
    expanded: {
      width: 320, // w-80 equivalent
      transition: {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    collapsed: {
      rotate: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: {
      rotate: 180,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  // Handle delete action
  const handleDelete = () => {
    if (selectedElement && onDelete) {
      onDelete(selectedElement.id);
    }
  };

  // Determine if we're dealing with a node or edge
  const isNode = selectedElement && !('source' in selectedElement);

  // Collapsed state - just show the toggle button and delete button if element is selected
  if (isCollapsed) {
    return (
      <motion.div 
        className="h-full border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shadow-sm overflow-hidden"
        variants={panelVariants}
        animate="collapsed"
        initial={false}
      >
        {/* Top spacer to avoid Save button overlap */}
        <div className="h-20 flex-shrink-0"></div>

        {/* Spacer to push content to center and buttons to bottom */}
        <div className="flex-1">
          {/* Vertical text when collapsed - always visible */}
          <motion.div 
            className="h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div 
              className="whitespace-nowrap text-xs text-muted-foreground font-medium select-none"
              initial={{ 
                rotate: 0,
                opacity: 0 
              }}
              animate={{ 
                rotate: -90,
                opacity: 1 
              }}
              transition={{ 
                duration: 0.5, 
                delay: 0.2,
                ease: "easeInOut"
              }}
            >
              Properties
            </motion.div>
          </motion.div>
        </div>
        
        {/* Delete button when collapsed and element is selected - Above expand button */}
        {selectedElement && isNode && onDelete && (
          <div className="border-t border-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <motion.button
                  className="w-full p-4 hover:bg-destructive/10 transition-colors group"
                  title="Delete Node"
                  whileHover={{ backgroundColor: "hsl(var(--destructive) / 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Trash2 className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors mx-auto" />
                </motion.button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Node</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{formValues.label || selectedElement.id}"? This action cannot be undone and will also remove all connected edges.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        
        {/* Expand button fixed at bottom */}
        <div className="border-t border-border">
          <motion.button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-4 hover:bg-accent transition-colors group"
            title="Expand Properties Panel"
            whileHover={{ backgroundColor: "hsl(var(--accent))" }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              variants={iconVariants}
              animate="collapsed"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </motion.svg>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (!selectedElement) {
    return (
      <motion.div 
        className="border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shadow-sm overflow-hidden"
        variants={panelVariants}
        animate="expanded"
        initial={false}
      >
        <motion.div 
          className="flex-1 p-8"
          variants={contentVariants}
          animate="visible"
          initial="hidden"
        >
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
            {/* Header */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-foreground">
                Properties Panel
              </h3>
              <motion.div 
                className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </motion.div>

            {/* Icon and animation */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 relative">
                {/* Outer ring with subtle animation */}
                <motion.div 
                  className="absolute inset-0 w-24 h-24 border-2 border-muted-foreground/20 rounded-full"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Inner content */}
                <div className="absolute inset-3 w-18 h-18 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full flex items-center justify-center shadow-inner">
                  <motion.svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-9 w-9 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" 
                    />
                  </motion.svg>
                </div>
              </div>
            </motion.div>

            {/* Main message */}
            <motion.div 
              className="space-y-4 max-w-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="text-base font-medium text-foreground">
                Select an element to get started
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click on any node or edge in the canvas to view and edit its properties, configuration, and details.
              </p>
            </motion.div>

            {/* Helpful tips */}
            <motion.div 
              className="w-full max-w-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
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
            </motion.div>
          </div>
        </motion.div>
        
        {/* Collapse button at bottom */}
        <motion.div 
          className="flex justify-center p-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <motion.button
            onClick={() => setIsCollapsed(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent transition-colors group"
            title="Collapse Properties Panel"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Hide Panel</span>
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              variants={iconVariants}
              animate="expanded"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 5l7 7-7 7M5 5l7 7-7 7" 
              />
            </motion.svg>
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    const updatedFormValues = {
      ...formValues,
      [field]: value
    };
    
    setFormValues(updatedFormValues);
    
    // Immediately update the React Flow node/edge data for real-time preview
    if (selectedElement) {
      const updatedElement = {
        ...selectedElement,
        data: {
          ...selectedElement.data,
          ...updatedFormValues
        }
      };
      onUpdate(updatedElement);
    }
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
      <motion.div 
        className="border-l border-border bg-card/50 backdrop-blur-sm shadow-sm flex flex-col h-full overflow-hidden"
        variants={panelVariants}
        animate="expanded"
        initial={false}
        style={{ position: 'relative', zIndex: 40 }}
      >
      {/* Header */}
      <motion.div 
        className="flex-shrink-0 p-6 border-b border-border bg-gradient-to-r from-card to-card/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">Properties</h3>
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Editing {isNode ? 'node' : 'edge'}: <span className="font-medium text-blue-600 dark:text-blue-400">{formValues.label || selectedElement.id}</span>
        </motion.p>
      </motion.div>
      
      {/* Scrollable Content */}
      <motion.div 
        className="flex-1 overflow-y-auto overflow-x-visible"
        variants={contentVariants}
        animate="visible"
        initial="hidden"
        style={{ position: 'relative' }}
      >
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedElement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderConfiguration()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Fixed Bottom Section */}
      <motion.div 
        className="flex-shrink-0 p-6 border-t border-border bg-gradient-to-r from-card to-card/80 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {/* Delete Button for Nodes */}
        {isNode && onDelete && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Node</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{formValues.label || selectedElement.id}"? This action cannot be undone and will also remove all connected edges.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        )}

        {/* Save Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </motion.div>
        
        {/* Collapse Button */}
        <motion.button
          onClick={() => setIsCollapsed(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors group"
          title="Collapse Properties Panel"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Hide Panel</span>
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            variants={iconVariants}
            animate="expanded"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
            />
          </motion.svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default RightPanel; 