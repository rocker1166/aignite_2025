import { FC } from 'react';
import { Node } from 'reactflow';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { DeleteIcon } from '@/components/icons';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { panelVariants, iconVariants } from './animations';
import { isNodeElement } from './functions';

interface CollapsedStateProps {
  selectedElement: Node | null;
  formValues: any;
  onExpand: () => void;
  onDelete?: (elementId: string) => void;
}

const CollapsedState: FC<CollapsedStateProps> = ({ 
  selectedElement, 
  formValues, 
  onExpand, 
  onDelete 
}) => {
  const handleDelete = () => {
    if (selectedElement && onDelete) {
      onDelete(selectedElement.id);
    }
  };

  const isNode = isNodeElement(selectedElement);

  return (
    <motion.div 
      className="h-full border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shadow-sm overflow-hidden dark:bg-slate-950"
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
          onClick={onExpand}
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
};

export default CollapsedState; 