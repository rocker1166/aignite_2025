import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Check, AlertCircle } from 'lucide-react';
import { DeleteIcon } from '@/components/icons';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import debounce from 'lodash.debounce';
import NodeConfiguration from './NodeConfiguration';
import EdgeConfiguration from './EdgeConfiguration';
import TemplateGroupConfiguration from './TemplateGroupConfiguration';

// Save status type
type SaveStatus = 'saved' | 'unsaved' | 'saving';

interface RightPanelProps {
  selectedElement: Node | Edge | null;
  onUpdate: (updatedElement: Node | Edge) => void;
  onDelete?: (elementId: string) => void;
  onUngroup?: (groupId: string) => void;
  nodes?: Node[];
  onSave?: () => Promise<void>; // Add optional onSave prop for triggering parent save
}

const RightPanel: FC<RightPanelProps> = ({ selectedElement, onUpdate, onDelete, onUngroup, nodes = [], onSave }) => {
  const [formValues, setFormValues] = useState<any>({});
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  
  // Ref to track if we're currently saving
  const isSaving = useRef(false);
  
  // Ref to track the last saved time to prevent rapid flickering
  const lastSavedTime = useRef<number>(0);
  const minimumDisplayTime = 1000; // Minimum time to show "saved" status (1 second)

  // Update form values when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setFormValues(selectedElement.data || {});
      setSaveStatus('saved'); // Reset status when switching elements
    } else {
      setFormValues({});
      setSaveStatus('saved');
    }
  }, [selectedElement]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async () => {
      if (isSaving.current || !onSave) return;
      
      try {
        isSaving.current = true;
        setSaveStatus('saving');
        await onSave();
        
        // Record the time when save completed
        const currentTime = Date.now();
        lastSavedTime.current = currentTime;
        
        // Show "saved" status with smooth transition
        setSaveStatus('saved');
        
        // After minimum display time, if no new changes, keep showing saved
        setTimeout(() => {
          // Only reset if this was the last save operation and we haven't had new changes
          if (lastSavedTime.current === currentTime && saveStatus === 'saved') {
            // Keep showing saved status - don't flicker back and forth
          }
        }, minimumDisplayTime);
        
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('unsaved');
      } finally {
        isSaving.current = false;
      }
    }, 1500), // 1.5 second debounce
    [onSave, saveStatus, minimumDisplayTime]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

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

  // Status indicator component
  const SaveStatusIndicator = () => {
    const getStatusConfig = () => {
      switch (saveStatus) {
        case 'unsaved':
          return {
            icon: AlertCircle,
            text: 'Unsaved changes',
            className: 'text-amber-600 dark:text-amber-400',
            bgClassName: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
          };
        case 'saving':
          return {
            icon: Clock,
            text: 'Saving...',
            className: 'text-blue-600 dark:text-blue-400',
            bgClassName: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          };
        case 'saved':
          return {
            icon: Check,
            text: 'All changes saved',
            className: 'text-green-600 dark:text-green-400',
            bgClassName: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
          };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={saveStatus} // Force re-render on status change for smooth transitions
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgClassName}`}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother animation
              staggerChildren: 0.1
            }
          }}
          exit={{ 
            opacity: 0, 
            y: -5, 
            scale: 0.95,
            transition: {
              duration: 0.2,
              ease: "easeOut"
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ 
              opacity: 1, 
              rotate: 0,
              transition: { duration: 0.3, delay: 0.1 }
            }}
          >
            <motion.div
              animate={saveStatus === 'saving' ? { rotate: 360 } : {}}
              transition={saveStatus === 'saving' ? { 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear" 
              } : { 
                duration: 0.3, 
                ease: "easeOut" 
              }}
            >
              <Icon className={`h-4 w-4 ${config.className}`} />
            </motion.div>
          </motion.div>
          <motion.span 
            className={`text-sm font-medium ${config.className}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              transition: { duration: 0.3, delay: 0.15 }
            }}
          >
            {config.text}
          </motion.span>
        </motion.div>
      </AnimatePresence>
    );
  };

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
                  <DeleteIcon size={20} className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors mx-auto" />
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
            <motion.div
              variants={iconVariants}
              animate="collapsed"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mx-auto" />
            </motion.div>
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
                    <span className="font-medium">Tip:</span> Changes are automatically saved after you stop editing. No need to manually save!
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
            <motion.div
              variants={iconVariants}
              animate="expanded"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
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
    
    // Only change to unsaved if we're not already in unsaved state
    // This prevents rapid flickering between states
    if (saveStatus !== 'unsaved') {
      setSaveStatus('unsaved');
    }
    
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

    // Trigger debounced save
    debouncedSave();
  };

  const handleMapCoordinatesChange = (lat: string, lng: string, address?: string) => {
    setLatitude(lat)
    setLongitude(lng)
    // Also update the address field if provided
    if (address) {
      const updatedFormValues = {
        ...formValues,
        address: address
      };
      setFormValues(updatedFormValues);
      
      // Only change to unsaved if we're not already in unsaved state
      if (saveStatus !== 'unsaved') {
        setSaveStatus('unsaved');
      }
      
      // Update the element immediately for real-time preview
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
      
      // Trigger debounced save
      debouncedSave();
    }
  }

  // Render the appropriate configuration component
  const renderConfiguration = () => {
    if (isNode) {
      const node = selectedElement as Node;
      
      // Handle template groups
      if (node.type === 'group' && node.data.isTemplate) {
        return <TemplateGroupConfiguration node={node} nodes={nodes} />;
      }
      
      // Handle regular nodes
      return (
        <NodeConfiguration
          selectedNode={node}
          formValues={formValues}
          onInputChange={handleInputChange}
          onMapCoordinatesChange={handleMapCoordinatesChange}
        />
      );
    } else {
      // Handle edges
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
      {/* Header with Save Status */}
      <motion.div 
        className="flex-shrink-0 p-6 border-b border-border bg-gradient-to-r from-card to-card/80 space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Properties</h3>
        </div>
        
        {/* Save Status Indicator */}
        <SaveStatusIndicator />
        
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
        {/* Ungroup Button for Template Groups */}
        {isNode && selectedElement.type === 'group' && selectedElement.data.isTemplate && onUngroup && (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUngroup(selectedElement.id)}
              className="text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30"
            >
              <span className="mr-2">⚡</span>
              Ungroup Template
            </Button>
          </motion.div>
        )}

        {/* Delete Button for Regular Nodes */}
        {isNode && selectedElement.type !== 'group' && onDelete && (
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
                  <DeleteIcon size={12} className="w-3 h-3 mr-1" />
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
        
        {/* Collapse Button */}
        <motion.button
          onClick={() => setIsCollapsed(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors group"
          title="Collapse Properties Panel"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Hide Panel</span>
                      <motion.div
              variants={iconVariants}
              animate="expanded"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default RightPanel; 