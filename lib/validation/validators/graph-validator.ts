import { Node, Edge } from 'reactflow';
import { ValidationIssue } from './types';

// A. Graph-Level Validation Functions
export function validateGraphStructure(nodes: Node[], edges: Edge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check for duplicate node IDs
    issues.push(...findDuplicateNodeIds(nodes));

    // Check for duplicate node names/labels
    issues.push(...findDuplicateNodeLabels(nodes));

    // Check for duplicate edge IDs
    issues.push(...findDuplicateEdgeIds(edges));

    // Check for orphaned nodes
    issues.push(...findOrphanedNodes(nodes, edges));

    // Check for disconnected components
    issues.push(...findDisconnectedComponents(nodes, edges));

    // Check for missing source or sink
    issues.push(...checkSourceAndSink(nodes, edges));

    // Check for circular dependencies
    issues.push(...findCircularDependencies(nodes, edges));

    return issues;
}

function findDuplicateNodeIds(nodes: Node[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const idCount = new Map<string, Node[]>();

    // Group nodes by ID
    for (const node of nodes) {
        if (!idCount.has(node.id)) {
            idCount.set(node.id, []);
        }
        idCount.get(node.id)!.push(node);
    }

    // Find duplicates
    for (const [id, nodeGroup] of idCount) {
        if (nodeGroup.length > 1) {
            for (const node of nodeGroup) {
                issues.push({
                    id: `duplicate-id-${id}`,
                    elementId: node.id,
                    elementType: 'node',
                    severity: 'error',
                    message: `Node ID '${id}' is used by multiple nodes. Each node must have a unique ID.`,
                    suggestion: 'Delete one of the duplicate nodes or regenerate the supply chain to ensure unique IDs.'
                });
            }
        }
    }

    return issues;
}

function findDuplicateNodeLabels(nodes: Node[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const labelCount = new Map<string, Node[]>();

    // Group nodes by label (only for non-empty labels)
    for (const node of nodes) {
        const label = node.data.label?.trim();
        if (label) {
            if (!labelCount.has(label)) {
                labelCount.set(label, []);
            }
            labelCount.get(label)!.push(node);
        }
    }

    // Find duplicates
    for (const [label, nodeGroup] of labelCount) {
        if (nodeGroup.length > 1) {
            for (const node of nodeGroup) {
                issues.push({
                    id: `duplicate-label-${node.id}`,
                    elementId: node.id,
                    elementType: 'node',
                    severity: 'warning',
                    message: `Multiple nodes have the same name '${label}'. This can be confusing when identifying nodes.`,
                    suggestion: 'Give each node a unique, descriptive name to make them easier to distinguish.'
                });
            }
        }
    }

    return issues;
}

function findDuplicateEdgeIds(edges: Edge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const idCount = new Map<string, Edge[]>();

    // Group edges by ID
    for (const edge of edges) {
        if (!idCount.has(edge.id)) {
            idCount.set(edge.id, []);
        }
        idCount.get(edge.id)!.push(edge);
    }

    // Find duplicates
    for (const [id, edgeGroup] of idCount) {
        if (edgeGroup.length > 1) {
            for (const edge of edgeGroup) {
                issues.push({
                    id: `duplicate-edge-id-${id}`,
                    elementId: edge.id,
                    elementType: 'edge',
                    severity: 'error',
                    message: `Edge ID '${id}' is used by multiple connections. Each connection must have a unique ID.`,
                    suggestion: 'Delete one of the duplicate connections or regenerate the supply chain to ensure unique IDs.'
                });
            }
        }
    }

    return issues;
}

function findOrphanedNodes(nodes: Node[], edges: Edge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const node of nodes) {
        const hasIncomingEdge = edges.some(edge => edge.target === node.id);
        const hasOutgoingEdge = edges.some(edge => edge.source === node.id);

        if (!hasIncomingEdge && !hasOutgoingEdge) {
            issues.push({
                id: `orphaned-${node.id}`,
                elementId: node.id,
                elementType: 'node',
                severity: 'error',
                message: `Node '${node.data.label || node.id}' is not connected to the supply chain.`,
                suggestion: 'Connect this node to another node, or remove it if it\'s not part of the supply chain.'
            });
        }
    }

    return issues;
}

function findDisconnectedComponents(nodes: Node[], edges: Edge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (nodes.length === 0) return issues;

    // Build adjacency list (treating edges as undirected for connectivity check)
    const adjacencyList: Record<string, string[]> = {};
    for (const node of nodes) {
        adjacencyList[node.id] = [];
    }

    for (const edge of edges) {
        adjacencyList[edge.source].push(edge.target);
        adjacencyList[edge.target].push(edge.source);
    }

    // Find connected components using DFS
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            const component: string[] = [];
            dfs(node.id, adjacencyList, visited, component);
            components.push(component);
        }
    }

    // If more than one component, report as error
    if (components.length > 1) {
        issues.push({
            id: 'disconnected-components',
            elementId: 'graph',
            elementType: 'graph',
            severity: 'error',
            message: `The supply chain has ${components.length} disconnected parts.`,
            suggestion: 'Ensure all parts of the supply chain are connected to form a single network.'
        });
    }

    return issues;
}

function dfs(nodeId: string, adjacencyList: Record<string, string[]>, visited: Set<string>, component: string[]) {
    visited.add(nodeId);
    component.push(nodeId);

    for (const neighbor of adjacencyList[nodeId]) {
        if (!visited.has(neighbor)) {
            dfs(neighbor, adjacencyList, visited, component);
        }
    }
}

function checkSourceAndSink(nodes: Node[], edges: Edge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const nodesWithIncoming = new Set(edges.map(e => e.target));
    const nodesWithOutgoing = new Set(edges.map(e => e.source));

    const sourceNodes = nodes.filter(node => !nodesWithIncoming.has(node.id));
    const sinkNodes = nodes.filter(node => !nodesWithOutgoing.has(node.id));

    if (sourceNodes.length === 0 && nodes.length > 0) {
        issues.push({
            id: 'missing-source',
            elementId: 'graph',
            elementType: 'graph',
            severity: 'warning',
            message: 'The supply chain may be missing a starting point (e.g., Supplier).',
            suggestion: 'Review your supply chain to ensure it models the complete flow from start to finish.'
        });
    }

    if (sinkNodes.length === 0 && nodes.length > 0) {
        issues.push({
            id: 'missing-sink',
            elementId: 'graph',
            elementType: 'graph',
            severity: 'warning',
            message: 'The supply chain may be missing an endpoint (e.g., Retailer).',
            suggestion: 'Review your supply chain to ensure it models the complete flow from start to finish.'
        });
    }

    return issues;
}

function findCircularDependencies(nodes: Node[], edges: Edge[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Build adjacency list
    const adjacencyList: Record<string, string[]> = {};
    for (const node of nodes) {
        adjacencyList[node.id] = [];
    }

    for (const edge of edges) {
        adjacencyList[edge.source].push(edge.target);
    }

    // DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of nodes) {
        if (!visited.has(node.id)) {
            const cycleNodes = detectCycle(node.id, adjacencyList, visited, recursionStack, []);
            if (cycleNodes.length > 0) {
                const cycleNodeLabels = cycleNodes.map(id => {
                    const node = nodes.find(n => n.id === id);
                    return node?.data.label || id;
                }).join(' → ');

                issues.push({
                    id: `circular-dependency-${cycleNodes[0]}`,
                    elementId: cycleNodes[0],
                    elementType: 'node',
                    severity: 'error',
                    message: `A circular dependency was detected: ${cycleNodeLabels}`,
                    suggestion: 'Remove the connection that creates the loop. Supply chains should generally flow in one direction.'
                });
                break; // Report only the first cycle found
            }
        }
    }

    return issues;
}

function detectCycle(
    nodeId: string,
    adjacencyList: Record<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
): string[] {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    for (const neighbor of adjacencyList[nodeId]) {
        if (!visited.has(neighbor)) {
            const cycleNodes = detectCycle(neighbor, adjacencyList, visited, recursionStack, [...path]);
            if (cycleNodes.length > 0) return cycleNodes;
        } else if (recursionStack.has(neighbor)) {
            // Found a cycle - return the cycle path
            const cycleStart = path.indexOf(neighbor);
            return path.slice(cycleStart).concat([neighbor]);
        }
    }

    recursionStack.delete(nodeId);
    return [];
} 