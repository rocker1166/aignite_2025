'use client'

import DigitalTwinSkeleton from '@/components/digital-twin/display/DigitalTwinViewSkeleton'
import { useParams } from 'next/navigation'
import { useSupplyChainView } from '@/lib/hooks/useSupplyChainView'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent }  from '@/components/ui/card'
import { motion } from 'framer-motion'
import DigitalTwinCanvas from '@/components/digital-twin/canvas/digital-twin-canvas'
import { ViewModeHeader, ReadOnlyRightPanel, ViewModeAIChatPanel } from '@/components/digital-twin/layout/view-mode'
import { ReactFlowProvider } from 'reactflow'
import React, { Component, ReactNode } from 'react'
import DataValidationErrorDisplay from '@/components/digital-twin/display/DataValidationErrorDisplay'
import DigitalTwinViewSkeleton from '@/components/digital-twin/display/DigitalTwinViewSkeleton'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

interface DataValidationError {
  type: 'missing_data' | 'invalid_nodes' | 'invalid_edges' | 'missing_positions' | 'invalid_references' | 'malformed_data'
  message: string
  details?: string[]
  count?: number
}

// Comprehensive data validation function
function validateSupplyChainData(arch: any): DataValidationError[] {
  const errors: DataValidationError[] = []

  // Check if arch exists
  if (!arch) {
    errors.push({
      type: 'missing_data',
      message: 'Supply chain data is missing',
      details: ['The loaded architecture data is null or undefined']
    })
    return errors
  }

  // Check if nodes exist and are valid
  if (!arch.nodes) {
    errors.push({
      type: 'invalid_nodes',
      message: 'Nodes data is missing',
      details: ['No nodes array found in the supply chain data']
    })
  } else if (!Array.isArray(arch.nodes)) {
    errors.push({
      type: 'invalid_nodes',
      message: 'Nodes data is not an array',
      details: [`Expected array but got ${typeof arch.nodes}`]
    })
  } else {
    // Validate each node
    const nodeIssues: string[] = []
    const missingPositions: string[] = []
    
    arch.nodes.forEach((node: any, index: number) => {
      if (!node) {
        nodeIssues.push(`Node at index ${index} is null/undefined`)
        return
      }

      // Check for node ID (support both React Flow format and database format)
      const nodeId = node.id || node.node_id
      if (!nodeId) {
        nodeIssues.push(`Node at index ${index} is missing an ID`)
      }

      // Check for position data (support both React Flow format and database format)
      const hasReactFlowPosition = node.position && 
        typeof node.position === 'object' && 
        typeof node.position.x === 'number' && !isNaN(node.position.x) &&
        typeof node.position.y === 'number' && !isNaN(node.position.y)
      
      const hasDatabasePosition = typeof node.location_lat === 'number' && !isNaN(node.location_lat) &&
        typeof node.location_lng === 'number' && !isNaN(node.location_lng)

      if (!hasReactFlowPosition && !hasDatabasePosition) {
        missingPositions.push(`Node "${nodeId || index}" is missing position data`)
      }

      if (node.type && typeof node.type !== 'string') {
        nodeIssues.push(`Node "${nodeId || index}" has invalid type`)
      }
    })

    if (nodeIssues.length > 0) {
      errors.push({
        type: 'invalid_nodes',
        message: 'Invalid node data detected',
        details: nodeIssues,
        count: nodeIssues.length
      })
    }

    if (missingPositions.length > 0) {
      errors.push({
        type: 'missing_positions',
        message: 'Nodes with missing or invalid position data',
        details: missingPositions,
        count: missingPositions.length
      })
    }
  }

  // Check if edges exist and are valid
  if (!arch.edges) {
    errors.push({
      type: 'invalid_edges',
      message: 'Edges data is missing',
      details: ['No edges array found in the supply chain data']
    })
  } else if (!Array.isArray(arch.edges)) {
    errors.push({
      type: 'invalid_edges',
      message: 'Edges data is not an array',
      details: [`Expected array but got ${typeof arch.edges}`]
    })
  } else {
    // Validate each edge
    const edgeIssues: string[] = []
    const referenceIssues: string[] = []
    
    // Build node ID set (support both formats)
    const nodeIds = new Set(
      arch.nodes?.map((n: any) => n?.id || n?.node_id).filter(Boolean) || []
    )
    
    arch.edges.forEach((edge: any, index: number) => {
      if (!edge) {
        edgeIssues.push(`Edge at index ${index} is null/undefined`)
        return
      }

      // Check for edge ID (support both React Flow format and database format)
      const edgeId = edge.id || edge.edge_id
      if (!edgeId) {
        edgeIssues.push(`Edge at index ${index} is missing an ID`)
      }

      // Check for source (support both React Flow format and database format)
      const source = edge.source || edge.from_node_id
      if (!source) {
        edgeIssues.push(`Edge "${edgeId || index}" is missing source`)
      } else if (nodeIds.size > 0 && !nodeIds.has(source)) {
        referenceIssues.push(`Edge "${edgeId || index}" references non-existent source node "${source}"`)
      }

      // Check for target (support both React Flow format and database format)
      const target = edge.target || edge.to_node_id
      if (!target) {
        edgeIssues.push(`Edge "${edgeId || index}" is missing target`)
      } else if (nodeIds.size > 0 && !nodeIds.has(target)) {
        referenceIssues.push(`Edge "${edgeId || index}" references non-existent target node "${target}"`)
      }

      if (edge.type && typeof edge.type !== 'string') {
        edgeIssues.push(`Edge "${edgeId || index}" has invalid type`)
      }
    })

    if (edgeIssues.length > 0) {
      errors.push({
        type: 'invalid_edges',
        message: 'Invalid edge data detected',
        details: edgeIssues,
        count: edgeIssues.length
      })
    }

    if (referenceIssues.length > 0) {
      errors.push({
        type: 'invalid_references',
        message: 'Edges with invalid node references',
        details: referenceIssues,
        count: referenceIssues.length
      })
    }
  }

  return errors
}

export default function DigitalTwinViewPage() {
  // `id` comes from dynamic route /digital-twin/view/[id]
  const params = useParams<{ id: string }>()
  const id = params?.id ?? null

  const { loading, error, arch } = useSupplyChainView(id)

  if (loading) {
    return <DigitalTwinViewSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-md border-0 bg-card/90 backdrop-blur-sm">
            <CardContent className="text-center p-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </motion.div>
              
              <h2 className="text-xl font-semibold mb-3 text-foreground">
                Failed to Load Supply Chain
              </h2>
              
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {error.message || 'An unexpected error occurred while loading the supply chain data.'}
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button
                  onClick={() => history.back()}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-6">
                If the problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!arch) {
    return <DigitalTwinSkeleton />
  }

  // Validate the loaded data
  const validationErrors = validateSupplyChainData(arch)
  
  if (validationErrors.length > 0) {
    return (
      <DataValidationErrorDisplay 
        errors={validationErrors}
        onRetry={() => window.location.reload()}
        onGoBack={() => history.back()}
      />
    )
  }

  // Additional safety check: Ensure data has required structure
  try {
    if (!arch.nodes || !Array.isArray(arch.nodes)) {
      throw new Error('Invalid nodes data structure')
    }
    if (!arch.edges || !Array.isArray(arch.edges)) {
      throw new Error('Invalid edges data structure')
    }
    
    // Validate that nodes have the minimum required properties
    for (const node of arch.nodes) {
      if (!node || typeof node !== 'object') {
        throw new Error('Invalid node object detected')
      }
      
      // Check for node ID (support both React Flow format and database format)
      const nodeAny = node as any
      const nodeId = nodeAny.id || nodeAny.node_id
      if (!nodeId) {
        throw new Error(`Node missing required 'id' property`)
      }
      
      // Check for position data (support both React Flow format and database format)
      const hasReactFlowPosition = nodeAny.position && 
        typeof nodeAny.position.x === 'number' && 
        typeof nodeAny.position.y === 'number'
      
      const hasDatabasePosition = typeof nodeAny.location_lat === 'number' && 
        typeof nodeAny.location_lng === 'number'

      if (!hasReactFlowPosition && !hasDatabasePosition) {
        throw new Error(`Node '${nodeId}' has invalid position data`)
      }
    }

    // Validate that edges have the minimum required properties
    for (const edge of arch.edges) {
      if (!edge || typeof edge !== 'object') {
        throw new Error('Invalid edge object detected')
      }
      
      // Check for source and target (support both React Flow format and database format)
      const edgeAny = edge as any
      const source = edgeAny.source || edgeAny.from_node_id
      const target = edgeAny.target || edgeAny.to_node_id
      const edgeId = edgeAny.id || edgeAny.edge_id
      
      if (!source || !target) {
        throw new Error(`Edge '${edgeId || 'unknown'}' missing source or target`)
      }
    }
  } catch (validationError: any) {
    const runtimeErrors: DataValidationError[] = [{
      type: 'malformed_data',
      message: 'Runtime data validation failed',
      details: [validationError.message || 'Unknown validation error']
    }]
    
    return (
      <DataValidationErrorDisplay 
        errors={runtimeErrors}
        onRetry={() => window.location.reload()}
        onGoBack={() => history.back()}
      />
    )
  }

  // Render the full view-only workspace with the loaded data
  return (
    <ReactFlowProvider>
      <ErrorBoundary
        fallback={
          <DataValidationErrorDisplay 
            errors={[{
              type: 'malformed_data',
              message: 'Rendering error occurred',
              details: ['An unexpected error occurred while rendering the supply chain visualization']
            }]}
            onRetry={() => window.location.reload()}
            onGoBack={() => history.back()}
          />
        }
      >
        <div className="flex flex-col h-screen">
          <ViewModeHeader title={`Supply Chain View`} />
          
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - AI Chat (collapsible) */}
            <ViewModeAIChatPanel 
              nodes={arch.nodes}
              edges={arch.edges}
            />

            {/* Center - Digital Twin Canvas */}
            <div className="flex-1 relative">
              <DigitalTwinCanvas 
                initialNodes={arch.nodes}
                initialEdges={arch.edges}
                viewOnly={true}
              />
            </div>

            {/* Right Panel - Read-Only Inspector */}
            <ReadOnlyRightPanel />
          </div>
        </div>
      </ErrorBoundary>
    </ReactFlowProvider>
  )
} 