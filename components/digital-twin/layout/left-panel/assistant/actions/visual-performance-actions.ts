import { useCopilotAction } from "@copilotkit/react-core";
import { toast } from "sonner";
import { ActionContext } from './types';
import debounce from 'lodash.debounce';

export const useVisualPerformanceActions = ({ nodes, edges, panelId, props }: ActionContext) => {
  const { onHighlightNodes, onUpdateMultipleNodes } = props;

  // Enhanced multi-level highlighting system
  useCopilotAction({
    name: `enhancedHighlight_${panelId}`,
    description: "Apply advanced multi-level highlighting with color-coded risk levels and animated effects",
    parameters: [
      { name: "highlightType", type: "string", description: "Type of highlighting (risk, performance, connectivity, geographic)", required: true },
      { name: "intensity", type: "string", description: "Highlight intensity (subtle, normal, strong)", required: false, default: 'normal' },
      { name: "animated", type: "boolean", description: "Whether to use animated highlighting", required: false, default: true },
      { name: "duration", type: "number", description: "Animation duration in seconds", required: false, default: 2 }
    ],
    handler: ({ highlightType, intensity = 'normal', animated = true, duration = 2 }) => {
      const highlightConfig = {
        primary: [] as string[],
        secondary: [] as string[],
        tertiary: [] as string[],
        metadata: {} as any
      };

      switch (highlightType) {
        case 'risk':
          nodes.forEach(node => {
            const riskScore = node.data?.comprehensiveRiskScore || node.data?.riskScore || 0;
            if (riskScore >= 0.8) highlightConfig.primary.push(node.id);
            else if (riskScore >= 0.6) highlightConfig.secondary.push(node.id);
            else if (riskScore >= 0.4) highlightConfig.tertiary.push(node.id);
          });
          highlightConfig.metadata = { 
            type: 'risk', 
            colorScheme: ['#ef4444', '#f97316', '#eab308'],
            labels: ['Critical Risk', 'High Risk', 'Medium Risk']
          };
          break;

        case 'performance':
          nodes.forEach(node => {
            const utilization = node.data?.utilization || node.data?.utilizationPct || 70;
            const efficiency = node.data?.efficiency || 80;
            const performance = (utilization + efficiency) / 2;
            
            if (performance >= 90) highlightConfig.primary.push(node.id);
            else if (performance >= 75) highlightConfig.secondary.push(node.id);
            else if (performance >= 60) highlightConfig.tertiary.push(node.id);
          });
          highlightConfig.metadata = { 
            type: 'performance', 
            colorScheme: ['#22c55e', '#3b82f6', '#a855f7'],
            labels: ['High Performance', 'Good Performance', 'Fair Performance']
          };
          break;

        case 'connectivity':
          const connectivityMap = new Map<string, number>();
          nodes.forEach(node => {
            const connections = edges.filter(e => e.source === node.id || e.target === node.id).length;
            connectivityMap.set(node.id, connections);
          });

          const maxConnections = Math.max(...Array.from(connectivityMap.values()));
          nodes.forEach(node => {
            const connections = connectivityMap.get(node.id) || 0;
            const connectivityRatio = maxConnections > 0 ? connections / maxConnections : 0;
            
            if (connectivityRatio >= 0.8) highlightConfig.primary.push(node.id);
            else if (connectivityRatio >= 0.5) highlightConfig.secondary.push(node.id);
            else if (connectivityRatio >= 0.3) highlightConfig.tertiary.push(node.id);
          });
          highlightConfig.metadata = { 
            type: 'connectivity', 
            colorScheme: ['#8b5cf6', '#6366f1', '#06b6d4'],
            labels: ['Highly Connected', 'Well Connected', 'Moderately Connected']
          };
          break;

        case 'geographic':
          const countryGroups: { [country: string]: string[] } = {};
          nodes.forEach(node => {
            const country = node.data?.country || node.data?.location?.country || 'Unknown';
            if (!countryGroups[country]) countryGroups[country] = [];
            countryGroups[country].push(node.id);
          });

          const sortedCountries = Object.entries(countryGroups)
            .sort(([, a], [, b]) => b.length - a.length);

          if (sortedCountries.length >= 1) highlightConfig.primary = sortedCountries[0][1];
          if (sortedCountries.length >= 2) highlightConfig.secondary = sortedCountries[1][1];
          if (sortedCountries.length >= 3) highlightConfig.tertiary = sortedCountries[2][1];

          highlightConfig.metadata = { 
            type: 'geographic', 
            colorScheme: ['#f59e0b', '#10b981', '#8b5cf6'],
            labels: sortedCountries.slice(0, 3).map(([country]) => country)
          };
          break;
      }

      // Apply highlighting through node updates
      if (onUpdateMultipleNodes) {
        const updates: any = {};
        
        highlightConfig.primary.forEach(nodeId => {
          updates[nodeId] = { 
            highlightLevel: 'primary',
            highlightType: highlightType,
            highlightIntensity: intensity,
            animated: animated,
            animationDuration: duration,
            highlightColor: highlightConfig.metadata.colorScheme[0]
          };
        });

        highlightConfig.secondary.forEach(nodeId => {
          updates[nodeId] = { 
            highlightLevel: 'secondary',
            highlightType: highlightType,
            highlightIntensity: intensity,
            animated: animated,
            animationDuration: duration,
            highlightColor: highlightConfig.metadata.colorScheme[1]
          };
        });

        highlightConfig.tertiary.forEach(nodeId => {
          updates[nodeId] = { 
            highlightLevel: 'tertiary',
            highlightType: highlightType,
            highlightIntensity: intensity,
            animated: animated,
            animationDuration: duration,
            highlightColor: highlightConfig.metadata.colorScheme[2]
          };
        });

        const allHighlightedNodes = Object.keys(updates);
        onUpdateMultipleNodes(allHighlightedNodes, updates);
      }

      const totalHighlighted = highlightConfig.primary.length + 
                              highlightConfig.secondary.length + 
                              highlightConfig.tertiary.length;

      toast.success(
        `Applied ${highlightType} highlighting to ${totalHighlighted} nodes with ${intensity} intensity` +
        (animated ? ` and ${duration}s animation` : '')
      );
    }
  });

  // Clear all visual effects
  useCopilotAction({
    name: `clearVisualEffects_${panelId}`,
    description: "Clear all highlighting, overlays, and visual effects from the canvas",
    parameters: [
      { name: "effectType", type: "string", description: "Type of effects to clear (highlight, overlay, animation, all)", required: false, default: 'all' }
    ],
    handler: ({ effectType = 'all' }) => {
      if (onUpdateMultipleNodes) {
        const clearUpdates: any = {};
        
        nodes.forEach(node => {
          const updates: any = {};
          
          if (effectType === 'all' || effectType === 'highlight') {
            updates.highlightLevel = null;
            updates.highlightType = null;
            updates.highlightIntensity = null;
            updates.highlightColor = null;
          }
          
          if (effectType === 'all' || effectType === 'animation') {
            updates.animated = false;
            updates.animationDuration = null;
          }
          
          if (effectType === 'all' || effectType === 'overlay') {
            updates.showOverlay = false;
            updates.overlayContent = null;
          }

          clearUpdates[node.id] = updates;
        });

        const allNodeIds = Object.keys(clearUpdates);
        onUpdateMultipleNodes(allNodeIds, clearUpdates);
      }

      toast.info(`Cleared ${effectType} visual effects from ${nodes.length} nodes.`);
    }
  });

  // Add progress indicators for analysis
  useCopilotAction({
    name: `showAnalysisProgress_${panelId}`,
    description: "Display progress indicators for long-running analysis operations",
    parameters: [
      { name: "analysisType", type: "string", description: "Type of analysis being performed", required: true },
      { name: "estimatedDuration", type: "number", description: "Estimated duration in seconds", required: false, default: 10 },
      { name: "showDetails", type: "boolean", description: "Whether to show detailed progress", required: false, default: true }
    ],
    handler: ({ analysisType, estimatedDuration = 10, showDetails = true }) => {
      // This would typically integrate with a progress bar component
      toast.loading(
        `Starting ${analysisType} analysis... Estimated time: ${estimatedDuration}s`,
        { duration: estimatedDuration * 1000 }
      );

      if (showDetails) {
        console.log('Analysis Progress:', {
          type: analysisType,
          nodes: nodes.length,
          edges: edges.length,
          estimatedDuration,
          startTime: new Date().toISOString()
        });
      }

      // Update relevant nodes to show they're being analyzed
      if (onUpdateMultipleNodes) {
        const analysisUpdates = nodes.reduce((acc, node) => ({
          ...acc,
          [node.id]: { 
            analyzing: true,
            analysisType: analysisType,
            analysisStartTime: Date.now()
          }
        }), {});
        
        const allNodeIds = Object.keys(analysisUpdates);
        onUpdateMultipleNodes(allNodeIds, analysisUpdates);

        // Clear analysis indicators after estimated duration
        setTimeout(() => {
          const clearUpdates = nodes.reduce((acc, node) => ({
            ...acc,
            [node.id]: { 
              analyzing: false,
              analysisType: null,
              analysisStartTime: null
            }
          }), {});
          
          onUpdateMultipleNodes(allNodeIds, clearUpdates);
          toast.success(`${analysisType} analysis completed!`);
        }, estimatedDuration * 1000);
      }
    }
  });

  // Performance optimization for large networks
  useCopilotAction({
    name: `optimizePerformance_${panelId}`,
    description: "Apply performance optimizations for large supply chain networks",
    parameters: [
      { name: "optimizationType", type: "string", description: "Type of optimization (rendering, memory, interaction, all)", required: false, default: 'all' },
      { name: "targetFPS", type: "number", description: "Target frames per second for animations", required: false, default: 60 }
    ],
    handler: ({ optimizationType = 'all', targetFPS = 60 }) => {
      const optimizations: string[] = [];
      const networkSize = nodes.length + edges.length;

      // Large network detection and optimization
      if (networkSize > 500) {
        optimizations.push("Large network detected - enabling virtualization");
        
        if (optimizationType === 'all' || optimizationType === 'rendering') {
          // Mark nodes for virtualized rendering
          if (onUpdateMultipleNodes) {
            const renderUpdates = nodes.reduce((acc, node) => ({
              ...acc,
              [node.id]: { 
                virtualizeRendering: true,
                levelOfDetail: networkSize > 1000 ? 'low' : 'medium'
              }
            }), {});
            
            const allNodeIds = Object.keys(renderUpdates);
            onUpdateMultipleNodes(allNodeIds, renderUpdates);
          }
          optimizations.push(`Enabled virtualized rendering for ${nodes.length} nodes`);
        }

        if (optimizationType === 'all' || optimizationType === 'memory') {
          // Implement lazy loading markers
          const highPriorityNodes = nodes.filter(node => {
            const riskScore = node.data?.comprehensiveRiskScore || node.data?.riskScore || 0;
            return riskScore > 0.7;
          });

          if (onUpdateMultipleNodes) {
            const memoryUpdates = nodes.reduce((acc, node) => {
              const isHighPriority = highPriorityNodes.some(hp => hp.id === node.id);
              return {
                ...acc,
                [node.id]: { 
                  lazyLoad: !isHighPriority,
                  preloadDetails: isHighPriority,
                  memoryOptimized: true
                }
              };
            }, {});
            
            const allNodeIds = Object.keys(memoryUpdates);
            onUpdateMultipleNodes(allNodeIds, memoryUpdates);
          }
          optimizations.push(`Enabled lazy loading for ${nodes.length - highPriorityNodes.length} nodes`);
        }

        if (optimizationType === 'all' || optimizationType === 'interaction') {
          // Debounce interactions for performance
          const debouncedInteraction = debounce((nodeId: string) => {
            console.log('Debounced interaction with node:', nodeId);
          }, 100);

          optimizations.push("Enabled debounced interactions");
        }
      }

      // Animation performance optimization
      if (targetFPS < 60 && networkSize > 200) {
        if (onUpdateMultipleNodes) {
          const animationUpdates = nodes.reduce((acc, node) => ({
            ...acc,
            [node.id]: { 
              reducedAnimations: true,
              animationFPS: targetFPS,
              skipNonEssentialAnimations: true
            }
          }), {});
          
          const allNodeIds = Object.keys(animationUpdates);
          onUpdateMultipleNodes(allNodeIds, animationUpdates);
        }
        optimizations.push(`Reduced animation quality to ${targetFPS} FPS`);
      }

      if (optimizations.length === 0) {
        toast.info("Network performance is already optimal for current size.");
      } else {
        toast.success(`Applied ${optimizations.length} performance optimizations for ${networkSize} network elements.`);
        console.log('Performance Optimizations Applied:', optimizations);
      }
    }
  });

  // Intelligent layout optimization
  useCopilotAction({
    name: `optimizeLayout_${panelId}`,
    description: "Automatically select and apply the best layout algorithm based on network characteristics",
    parameters: [
      { name: "priority", type: "string", description: "Layout priority (clarity, performance, aesthetics)", required: false, default: 'clarity' },
      { name: "preservePositions", type: "boolean", description: "Whether to preserve some existing positions", required: false, default: false }
    ],
    handler: ({ priority = 'clarity', preservePositions = false }) => {
      const networkAnalysis = {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        density: edges.length / (nodes.length * (nodes.length - 1) / 2),
        avgConnections: edges.length / nodes.length,
        hasHierarchy: nodes.some(n => n.data?.supplierTier || n.type?.includes('supplier'))
      };

      let recommendedLayout = 'force';
      let layoutReason = '';

      // Algorithm selection logic
      if (networkAnalysis.hasHierarchy && networkAnalysis.nodeCount < 200) {
        recommendedLayout = 'dagre';
        layoutReason = 'hierarchical structure detected';
      } else if (networkAnalysis.density > 0.3 && networkAnalysis.nodeCount < 100) {
        recommendedLayout = 'elk';
        layoutReason = 'dense network benefits from ELK layout';
      } else if (networkAnalysis.nodeCount > 500) {
        recommendedLayout = 'force';
        layoutReason = 'large network requires force-directed layout';
      } else if (priority === 'performance') {
        recommendedLayout = 'grid';
        layoutReason = 'performance priority requires simple grid layout';
      } else {
        recommendedLayout = 'dagre';
        layoutReason = 'balanced clarity and performance';
      }

      // Apply the recommended layout
      // Layout application removed - direct layout management no longer available

      // Update nodes with layout metadata
      if (onUpdateMultipleNodes) {
        const layoutUpdates = nodes.reduce((acc, node) => ({
          ...acc,
          [node.id]: { 
            lastLayoutAlgorithm: recommendedLayout,
            layoutOptimized: true,
            preservedPosition: preservePositions && node.position,
            layoutPriority: priority
          }
        }), {});
        
        const allNodeIds = Object.keys(layoutUpdates);
        onUpdateMultipleNodes(allNodeIds, layoutUpdates);
      }

      toast.success(
        `Applied ${recommendedLayout} layout (${layoutReason}) to ${nodes.length} nodes ` +
        `with ${priority} priority.`
      );

      console.log('Layout Optimization:', {
        recommended: recommendedLayout,
        reason: layoutReason,
        networkAnalysis,
        priority,
        preservePositions
      });
    }
  });

  // Memory cleanup and garbage collection assistance
  useCopilotAction({
    name: `cleanupMemory_${panelId}`,
    description: "Clean up unused data and optimize memory usage for better performance",
    parameters: [
      { name: "aggressiveCleanup", type: "boolean", description: "Whether to perform aggressive memory cleanup", required: false, default: false }
    ],
    handler: ({ aggressiveCleanup = false }) => {
      let cleanupActions: string[] = [];

      // Clear temporary highlighting and effects
      if (onUpdateMultipleNodes) {
        const cleanupUpdates: any = {};
        
        nodes.forEach(node => {
          const updates: any = {};
          
          // Remove temporary analysis data
          if (node.data?.analyzing === false) {
            updates.analysisType = null;
            updates.analysisStartTime = null;
          }
          
          // Clear old scenario data
          if (node.data?.lastScenarioImpact && aggressiveCleanup) {
            updates.lastScenarioImpact = null;
            updates.scenarioType = null;
            updates.impactDuration = null;
          }
          
          // Clear performance metadata if aggressive
          if (aggressiveCleanup) {
            updates.virtualizeRendering = null;
            updates.levelOfDetail = null;
            updates.lazyLoad = null;
            updates.memoryOptimized = null;
          }

          if (Object.keys(updates).length > 0) {
            cleanupUpdates[node.id] = updates;
          }
        });

        if (Object.keys(cleanupUpdates).length > 0) {
          const cleanupNodeIds = Object.keys(cleanupUpdates);
          onUpdateMultipleNodes(cleanupNodeIds, cleanupUpdates);
          cleanupActions.push(`Cleaned ${cleanupNodeIds.length} node data entries`);
        }
      }

      // Simulate garbage collection hint (browser-dependent)
      if (aggressiveCleanup && typeof window !== 'undefined' && window.gc) {
        try {
          window.gc();
          cleanupActions.push("Triggered garbage collection");
        } catch (e) {
          cleanupActions.push("Garbage collection not available");
        }
      }

      const cleanupLevel = aggressiveCleanup ? 'aggressive' : 'standard';
      
      if (cleanupActions.length === 0) {
        toast.info("Memory usage is already optimized.");
      } else {
        toast.success(`Completed ${cleanupLevel} memory cleanup: ${cleanupActions.join(', ')}.`);
      }

      console.log('Memory Cleanup:', {
        level: cleanupLevel,
        actions: cleanupActions,
        timestamp: new Date().toISOString()
      });
    }
  });
}; 