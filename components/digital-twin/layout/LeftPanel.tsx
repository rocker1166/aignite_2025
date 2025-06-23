"use client"
import { FC, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Upload, Download, RotateCcw, Building2 } from 'lucide-react';
import { DeleteIcon } from '@/components/icons';
import { BlocksIcon } from '@/components/icons/blocks';
import { LayoutPanelTopIcon } from '@/components/icons/layout-panel-top';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { NODE_TYPES, SUPPLY_CHAIN_TEMPLATES } from '@/constants/digital-twin';

interface LeftPanelProps {
  onAddNode: (nodeType: string) => void;
  onClearAllNodes: () => void;
  onLoadTemplate?: (templateId: string) => void;
  simulationMode: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const LeftPanel: FC<LeftPanelProps> = ({ onAddNode, onClearAllNodes, onLoadTemplate, simulationMode, isCollapsed, setIsCollapsed }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };


  const SectionHeader = ({ 
    title, 
    isExpanded, 
    onClick, 
    icon: Icon 
  }: { 
    title: string; 
    isExpanded: boolean; 
    onClick: () => void;
    icon?: any;
  }) => (
    <Button
      variant="ghost"
      className={`  w-full justify-between p-3 h-auto font-medium text-left hover:bg-muted/50 ${isExpanded ? '' : 'shadow-md'}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{title}</span>
      </div>
      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  );

  return (
    <motion.div 
      className="h-full border-r border-border bg-background/50 backdrop-blur-sm flex flex-col"
      initial={false}
      animate={{ 
        width: isCollapsed ? 48 : 320 
      }}
      transition={{ 
        duration: 0.3, 
        ease: [0.4, 0.0, 0.2, 1] 
      }}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="w-full h-full flex flex-col"
          >
            {/* Spacer to push content to center and button to bottom */}
            <div className="flex-1 flex items-center justify-center">
              {/* Vertical text when collapsed */}
              <motion.div 
                className="text-xs text-muted-foreground font-medium select-none"
                style={{ 
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed'
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                Supply Chain Builder
              </motion.div>
            </div>
            
            {/* Expand button fixed at bottom */}
            <div className="mt-auto border-t border-border">
              <motion.button
                onClick={() => setIsCollapsed(false)}
                className="w-full p-4 hover:bg-muted transition-colors group flex items-center justify-center"
                title="Expand Builder Panel"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="w-full flex flex-col h-full"
          >
            {/* Header */}
            <motion.div 
              className="p-6 border-b border-border"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Supply Chain Builder
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Design and configure your supply chain network
              </p>
            </motion.div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <motion.div 
                className="p-4 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                
                {/* Add Nodes Section */}
                <Card>
                  <CardContent className="p-0">
                    <SectionHeader
                      title="Add Nodes"
                      isExpanded={expandedSection === 'nodes'}
                      onClick={() => toggleSection('nodes')}
                      icon={BlocksIcon}
                    />
                    
                    <AnimatePresence>
                      {expandedSection === 'nodes' && (
                        <motion.div 
                          className="p-4 pt-0 space-y-2 shadow-md"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {NODE_TYPES.map((node, index) => {
                            const IconComponent = node.icon;
                            return (
                              <motion.div
                                key={node.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Button
                                  variant="outline"
                                  onClick={() => onAddNode(node.id)}
                                  disabled={simulationMode}
                                  className={`w-full h-auto p-3 justify-start ${node.color} dark:bg-card dark:hover:bg-muted/50 dark:border-border shadow-md ${
                                    simulationMode ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white dark:bg-background ${node.iconColor} border dark:border-2 dark:border-background`}>
                                      <IconComponent className="h-4 w-4 dark:text-white" />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-medium text-sm dark:text-foreground">{node.id}</div>
                                      <div className="text-xs text-muted-foreground">{node.description}</div>
                                    </div>
                                  </div>
                                </Button>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
                
                {/* Templates Section */}
                <Card>
                  <CardContent className="p-0">
                    <SectionHeader
                      title="Templates"
                      isExpanded={expandedSection === 'templates'}
                      onClick={() => toggleSection('templates')}
                      icon={LayoutPanelTopIcon}
                    />
                    
                    <AnimatePresence>
                      {expandedSection === 'templates' && (
                        <motion.div 
                          className="p-3 pt-0 space-y-1.5 shadow-md"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Info about grouping */}
                          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                            <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                              🔗 Template Grouping
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Templates load as grouped units that can be moved together. Double-click to ungroup individual nodes.
                            </div>
                          </div>

                          {/* Category Grouping */}
                          <TooltipProvider>
                            {['Industry', 'Characteristics', 'Geographic', 'Complexity'].map((category) => {
                              const categoryTemplates = SUPPLY_CHAIN_TEMPLATES.filter(template => template.category === category);
                              if (categoryTemplates.length === 0) return null;
                              
                              return (
                                <div key={category} className="space-y-1.5">
                                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                                    {category}
                                  </div>
                                  {categoryTemplates.map((template, index) => (
                                    <motion.div
                                      key={template.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2, delay: index * 0.03 }}
                                    >
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            onClick={() => onLoadTemplate?.(template.id)}
                                            disabled={simulationMode || !onLoadTemplate}
                                            className={`w-full h-auto p-2.5 justify-start hover:bg-muted/80 shadow-sm transition-all duration-200 ${
                                              simulationMode ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                                            }`}
                                          >
                                            <div className="flex items-center w-full min-h-[40px]">
                                              <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                                                <div className="text-base leading-none flex-shrink-0">
                                                  {template.icon}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                  <div className="font-medium text-sm leading-tight dark:text-foreground truncate">
                                                    {template.name}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground leading-tight truncate">
                                                    {template.description}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs">
                                          <div className="space-y-2">
                                            <div className="font-semibold text-sm">{template.name}</div>
                                            <div className="text-xs text-muted-foreground">{template.description}</div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-muted-foreground">Nodes:</span>
                                              <span className="font-medium">{template.nodes}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-muted-foreground">Complexity:</span>
                                              <span className={`font-medium ${
                                                template.complexity === 'High' ? 'text-red-600' :
                                                template.complexity === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                                              }`}>
                                                {template.complexity}
                                              </span>
                                            </div>
                                            <div className="space-y-1">
                                              <div className="text-xs text-muted-foreground">Features:</div>
                                              <div className="flex flex-wrap gap-1">
                                                {template.features.map((feature, idx) => (
                                                  <span key={idx} className="inline-block px-1.5 py-0.5 bg-muted/60 text-xs rounded-sm">
                                                    {feature}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </motion.div>
                                  ))}
                                </div>
                              );
                            })}
                          </TooltipProvider>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Actions Footer */}
            <motion.div 
              className="p-4 border-t border-border bg-muted/30"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  onClick={onClearAllNodes}
                  disabled={simulationMode}
                  className={`w-full gap-2 ${
                    simulationMode ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <DeleteIcon size={16} className="h-4 w-4" />
                  Clear All Nodes
                </Button>
                
                {/* Collapse button */}
                <div className="flex justify-center pt-2">
                  <motion.button
                    onClick={() => setIsCollapsed(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-muted/50 transition-colors group cursor-pointer bg-transparent border-none outline-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    title="Collapse Builder Panel"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xs text-muted-foreground group-hover:text-primary font-medium pointer-events-auto cursor-pointer select-none">Hide Panel</span>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-auto cursor-pointer" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LeftPanel; 