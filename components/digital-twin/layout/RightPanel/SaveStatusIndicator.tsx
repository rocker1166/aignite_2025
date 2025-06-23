import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, AlertCircle } from 'lucide-react';
import { SaveStatus } from './types';

interface SaveStatusIndicatorProps {
  saveStatus: SaveStatus;
}

const SaveStatusIndicator: FC<SaveStatusIndicatorProps> = ({ saveStatus }) => {
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

export default SaveStatusIndicator; 