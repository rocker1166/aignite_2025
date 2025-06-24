import { Node, Edge } from 'reactflow';
import { NODE_TYPES, NODE_PROPERTY_SPECS, NODE_TYPE_MAP, EDGE_PROPERTY_SPECS } from '@/constants/digital-twin';

// Validation issue interface
export interface ValidationIssue {
  id: string; // Unique ID for the issue
  elementId: string; // ID of the node or edge with the issue
  elementType: 'node' | 'edge' | 'graph';
  severity: 'error' | 'warning';
  message: string; // User-friendly error message
  suggestion: string; // Actionable advice on how to fix it
}

// Main validation function
export function validateSupplyChain(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // A. Graph-Level Validation
  issues.push(...validateGraphStructure(nodes, edges));

  // B. Node-Level Validation  
  for (const node of nodes) {
    issues.push(...validateNode(node));
  }

  // C. Edge-Level Validation
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    issues.push(...validateEdge(edge, sourceNode, targetNode));
  }

  // D. Cross-Element Validation
  issues.push(...validateSupplyChainFlow(nodes, edges));

  return issues;
}

// A. Graph-Level Validation Functions
function validateGraphStructure(nodes: Node[], edges: Edge[]): ValidationIssue[] {
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

// B. Node-Level Validation Functions
function validateNode(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for incomplete essential data
  issues.push(...validateNodeEssentialData(node));
  
  // Check for country information
  issues.push(...validateNodeCountry(node));
  
  // Check for invalid numeric values
  issues.push(...validateNodeNumericValues(node));
  
  // Check external company dependency validations
  issues.push(...validateExternalCompanyDependency(node));
  
  // Check supplier-specific validations
  if (node.data.type === 'Supplier') {
    issues.push(...validateSupplierNode(node));
  }
  
  // Check factory-specific validations
  if (node.data.type === 'Factory') {
    issues.push(...validateFactoryNode(node));
  }
  
  // Check warehouse-specific validations
  if (node.data.type === 'Warehouse') {
    issues.push(...validateWarehouseNode(node));
  }
  
  // Check distribution-specific validations
  if (node.data.type === 'Distribution') {
    issues.push(...validateDistributionNode(node));
  }
  
  // Check retailer-specific validations
  if (node.data.type === 'Retailer') {
    issues.push(...validateRetailerNode(node));
  }
  
  return issues;
}

function validateNodeEssentialData(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const missingFields: string[] = [];
  
  // Check required fields
  if (!node.data.label || node.data.label.trim() === '') {
    missingFields.push('Label');
  }
  
  if (!node.data.type) {
    missingFields.push('Type');
  }
  
  // Check for country information - look in both possible locations
  const hasCountry = getNodeCountry(node);
  const hasAddress = node.data.address;
  
  if (!hasCountry && !hasAddress) {
    missingFields.push('Country or Address');
  }
  
  if (missingFields.length > 0) {
    issues.push({
      id: `incomplete-data-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Node '${node.data.label || node.id}' is missing required information: ${missingFields.join(', ')}.`,
      suggestion: 'Select the node and fill in all the required fields in the \'General\' and \'Location\' sections.'
    });
  }
  
  return issues;
}

function validateNodeNumericValues(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check risk score bounds
  if (node.data.riskScore !== undefined && (node.data.riskScore < 0 || node.data.riskScore > 1)) {
    issues.push({
      id: `invalid-risk-score-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Node '${node.data.label || node.id}' has an invalid risk score.`,
      suggestion: 'The risk score must be between 0 and 1.'
    });
  }
  
  // Mapping from field names to user-friendly names
  const fieldDisplayNames: Record<string, string> = {
    'productionCapacity': 'production capacity',
    'inventoryLevel': 'inventory level',
    'leadTime': 'lead time',
    'supplyCapacity': 'supply capacity',
    'minOrderQty': 'minimum order quantity',
    'cycleTime': 'cycle time',
    'utilizationPct': 'utilization percentage',
    'yieldRate': 'yield rate',
    'throughputCap': 'throughput capacity',
    'fleetSize': 'fleet size',
    'deliveryRangeKm': 'delivery range',
    'serviceLevelPct': 'service level percentage',
    'lastMileCap': 'last mile capacity',
    'annualThroughputTEU': 'annual throughput',
    'customsTimeDays': 'customs time',
    'berthCount': 'berth count',
    'congestionIndex': 'congestion index',
    'demandRate': 'demand rate',
    'shelfSpaceCap': 'shelf space capacity',
    'reorderPoint': 'reorder point'
  };
  
  // Check for negative values in capacity/quantity fields
  // Note: storageCapacity, storageCostPerUnit, and handlingCostPerUnit are handled specifically in node-type validations
  const numericFields = [
    'productionCapacity', 'inventoryLevel', 'leadTime',
    'supplyCapacity', 'minOrderQty', 'cycleTime', 'utilizationPct', 'yieldRate',
    'throughputCap', 'fleetSize',
    'deliveryRangeKm', 'serviceLevelPct', 'lastMileCap', 'annualThroughputTEU',
    'customsTimeDays', 'berthCount', 'congestionIndex', 'demandRate',
    'shelfSpaceCap', 'reorderPoint'
  ];
  
  for (const field of numericFields) {
    if (node.data[field] !== undefined && node.data[field] < 0) {
      const displayName = fieldDisplayNames[field] || field;
      issues.push({
        id: `negative-value-${node.id}-${field}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Node '${node.data.label || node.id}' has a negative value for ${displayName}.`,
        suggestion: `The value for ${displayName} must be a positive number.`
      });
    }
  }
  
  return issues;
}

// External company dependency validation function
function validateExternalCompanyDependency(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // If node depends on external company, validate required fields
  if (node.data.dependsOnExternalCompany === true) {
    // Check if company name is provided
    if (!node.data.externalCompanyName || typeof node.data.externalCompanyName !== 'string' || node.data.externalCompanyName.trim() === '') {
      issues.push({
        id: `missing-external-company-name-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Node '${node.data.label || node.id}' depends on an external company but the company name is missing.`,
        suggestion: 'Enter the name of the external company in the node configuration, or disable the external company dependency.'
      });
    }
    
    // Check if company country is provided
    if (!node.data.externalCompanyCountry || typeof node.data.externalCompanyCountry !== 'string' || node.data.externalCompanyCountry.trim() === '') {
      issues.push({
        id: `missing-external-company-country-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Node '${node.data.label || node.id}' depends on an external company but the company's country of origin is missing.`,
        suggestion: 'Select the country of origin for the external company in the node configuration.'
      });
    }
    
    // Optional validation: warn if company name is too short (might be placeholder text)
    if (node.data.externalCompanyName && node.data.externalCompanyName.trim().length < 2) {
      issues.push({
        id: `short-external-company-name-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'warning',
        message: `Node '${node.data.label || node.id}' has a very short external company name.`,
        suggestion: 'Provide a more descriptive company name to better identify the external dependency.'
      });
    }
    
    // Optional validation: warn if description is missing (helps with context)
    if (!node.data.externalCompanyDescription || node.data.externalCompanyDescription.trim() === '') {
      issues.push({
        id: `missing-external-company-description-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'warning',
        message: `Node '${node.data.label || node.id}' depends on an external company but lacks a description.`,
        suggestion: 'Consider adding a description of the external company\'s role and relationship for better context.'
      });
    }
  }
  
  return issues;
}

// Supplier-specific validation function
function validateSupplierNode(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // 1. Check if supplierTier value is present
  if (!node.data.supplierTier) {
    issues.push({
      id: `missing-supplier-tier-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Supplier node '${node.data.label || node.id}' is missing supplier tier information.`,
      suggestion: 'Select the supplier tier (tier1, tier2, or tier3+) in the node configuration.'
    });
  }
  
  // 2. Check if supplyCapacity is greater than 0
  if (node.data.supplyCapacity !== undefined) {
    if (node.data.supplyCapacity <= 0) {
      issues.push({
        id: `invalid-supply-capacity-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'warning',
        message: `Supplier node '${node.data.label || node.id}' has zero or negative supply capacity.`,
        suggestion: 'Consider removing this node if it has no supply capacity, or update the capacity to a positive value.'
      });
    }
  } else {
    issues.push({
      id: `missing-supply-capacity-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Supplier node '${node.data.label || node.id}' is missing supply capacity information.`,
      suggestion: 'Enter the annual supply capacity for this supplier in the node configuration, must be greater than 0.'
    });
  }
  
  // 3. Check if materialType is present and has string value (mandatory field)
  if (!node.data.materialType || typeof node.data.materialType !== 'string' || node.data.materialType.trim() === '') {
    issues.push({
      id: `missing-material-type-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Supplier node '${node.data.label || node.id}' is missing material/component type information.`,
      suggestion: 'Specify the type of material or component this supplier provides.'
    });
  }
  
  // 4. Check if reliabilityPct is positive when present (optional field)
  if (node.data.reliabilityPct !== undefined) {
    if (typeof node.data.reliabilityPct !== 'number' || node.data.reliabilityPct < 0) {
      issues.push({
        id: `invalid-reliability-pct-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Supplier node '${node.data.label || node.id}' has an invalid reliability percentage.`,
        suggestion: 'The reliability percentage must be a positive number (0-100).'
      });
    }
    if (node.data.reliabilityPct > 100) {
      issues.push({
        id: `excessive-reliability-pct-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'warning',
        message: `Supplier node '${node.data.label || node.id}' has a reliability percentage greater than 100%.`,
        suggestion: 'Reliability percentage should typically be between 0-100%.'
      });
    }
  }
  
  return issues;
}

// Factory-specific validation function
function validateFactoryNode(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  

  
  // 2. Check if cycleTime is present and must be greater than 0
  if (node.data.cycleTime === undefined) {
    issues.push({
      id: `missing-cycle-time-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Factory node '${node.data.label || node.id}' is missing cycle time information.`,
      suggestion: 'Enter the cycle time (days/unit) for this factory in the node configuration.'
    });
  } else if (typeof node.data.cycleTime !== 'number' || node.data.cycleTime <= 0) {
    issues.push({
      id: `invalid-cycle-time-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Factory node '${node.data.label || node.id}' has an invalid cycle time.`,
      suggestion: 'The cycle time must be a positive number greater than 0.'
    });
  }
  
  // 3. Check utilizationPct - must be present and should be positive
  if (node.data.utilizationPct === undefined) {
    issues.push({
      id: `missing-utilization-pct-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Factory node '${node.data.label || node.id}' is missing utilization percentage information.`,
      suggestion: 'Enter the average utilization percentage for this factory in the node configuration.'
    });
  } else if (typeof node.data.utilizationPct !== 'number' || node.data.utilizationPct <= 0) {
    issues.push({
      id: `invalid-utilization-pct-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Factory node '${node.data.label || node.id}' has an invalid utilization percentage.`,
      suggestion: 'The utilization percentage must be a positive number.'
    });
  } else if (node.data.utilizationPct > 100) {
    issues.push({
      id: `excessive-utilization-pct-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'warning',
      message: `Factory node '${node.data.label || node.id}' has a utilization percentage greater than 100%.`,
      suggestion: 'Utilization percentage should typically be between 0-100%. Values over 100% may indicate overutilization or incorrect data.'
    });
  }
  
  return issues;
}

// Warehouse-specific validation function
function validateWarehouseNode(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // 1. Check storageCapacity - custom handling for warehouses
  if (node.data.storageCapacity === undefined) {
    issues.push({
      id: `missing-storage-capacity-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Warehouse node '${node.data.label || node.id}' is missing storage capacity information.`,
      suggestion: 'Enter the total storage capacity for this warehouse in the node configuration.'
    });
  } else if (node.data.storageCapacity < 0) {
    issues.push({
      id: `negative-storage-capacity-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Warehouse node '${node.data.label || node.id}' has a negative storage capacity.`,
      suggestion: 'The storage capacity must be a positive number or zero.'
    });
  } else if (node.data.storageCapacity === 0) {
    issues.push({
      id: `zero-storage-capacity-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'warning',
      message: `Warehouse node '${node.data.label || node.id}' has zero storage capacity.`,
      suggestion: 'Consider removing this warehouse if it has no storage capacity, or update the capacity to a positive value.'
    });
  }
  
  // 2. Check storageCostPerUnit - if present, must be positive
  if (node.data.storageCostPerUnit !== undefined) {
    if (typeof node.data.storageCostPerUnit !== 'number' || node.data.storageCostPerUnit <= 0) {
      issues.push({
        id: `invalid-storage-cost-per-unit-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Warehouse node '${node.data.label || node.id}' has an invalid storage cost per unit.`,
        suggestion: 'The storage cost per unit must be a positive number.'
      });
    }
  }
  
  // 3. Check temperatureControl - must be present (true or false)
  if (typeof node.data.temperatureControl !== 'boolean') {
    issues.push({
      id: `missing-temperature-control-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Warehouse node '${node.data.label || node.id}' is missing temperature control information.`,
      suggestion: 'Specify whether this warehouse has temperature-controlled storage (true or false) in the node configuration.'
    });
  }
  
  // 4. Check handlingCostPerUnit - if present, must be greater than -1
  if (node.data.handlingCostPerUnit !== undefined) {
    if (typeof node.data.handlingCostPerUnit !== 'number' || node.data.handlingCostPerUnit <= -1) {
      issues.push({
        id: `invalid-handling-cost-per-unit-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Warehouse node '${node.data.label || node.id}' has an invalid handling cost per unit.`,
        suggestion: 'The handling cost per unit must be greater than -1.'
      });
    }
  }
  
  return issues;
}

// Distribution-specific validation function
function validateDistributionNode(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // 1. Check fleetSize - can be 0 (warning) but not negative (error)
  if (node.data.fleetSize !== undefined) {
    if (typeof node.data.fleetSize !== 'number' || node.data.fleetSize < 0) {
      issues.push({
        id: `negative-fleet-size-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Distribution node '${node.data.label || node.id}' has a negative fleet size.`,
        suggestion: 'The fleet size must be a positive number or zero.'
      });
    } else if (node.data.fleetSize === 0) {
      issues.push({
        id: `zero-fleet-size-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'warning',
        message: `Distribution node '${node.data.label || node.id}' has zero fleet size.`,
        suggestion: 'Consider removing this distribution node if it has no vehicles, or update the fleet size to a positive value.'
      });
    }
  }
  
  // 2. Check deliveryRangeKm - must be greater than 0
  if (node.data.deliveryRangeKm !== undefined) {
    if (typeof node.data.deliveryRangeKm !== 'number' || node.data.deliveryRangeKm <= 0) {
      issues.push({
        id: `invalid-delivery-range-${node.id}`,
        elementId: node.id,
        elementType: 'node',
        severity: 'error',
        message: `Distribution node '${node.data.label || node.id}' has an invalid delivery range.`,
        suggestion: 'The delivery range must be a positive number greater than 0.'
      });
    }
  }
  
  return issues;
}

// Retailer-specific validation function
function validateRetailerNode(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // 1. Check demandRate - must be present and non-negative
  if (node.data.demandRate === undefined) {
    issues.push({
      id: `missing-demand-rate-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Retailer node '${node.data.label || node.id}' is missing demand rate information.`,
      suggestion: 'Enter the average demand (units/day) for this retailer in the node configuration.'
    });
  } else if (typeof node.data.demandRate !== 'number' || node.data.demandRate < 0) {
    issues.push({
      id: `negative-demand-rate-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Retailer node '${node.data.label || node.id}' has a negative demand rate.`,
      suggestion: 'The demand rate must be a non-negative number (zero or positive).'
    });
  } else if (node.data.demandRate === 0) {
    issues.push({
      id: `zero-demand-rate-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'warning',
      message: `Retailer node '${node.data.label || node.id}' has zero demand rate.`,
      suggestion: 'Consider removing this retailer if it has no demand, or update the demand rate to a positive value.'
    });
  }
  
  return issues;
}

// C. Edge-Level Validation Functions
function validateEdge(edge: Edge, sourceNode?: Node, targetNode?: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for incomplete connection data
  issues.push(...validateEdgeEssentialData(edge, sourceNode, targetNode));
  
  // Check for logical transport mode issues
  issues.push(...validateTransportMode(edge, sourceNode, targetNode));
  
  // Check for risk and disruption field validations
  issues.push(...validateEdgeRiskFields(edge, sourceNode, targetNode));
  
  return issues;
}

function validateEdgeEssentialData(edge: Edge, sourceNode?: Node, targetNode?: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const missingFields: string[] = [];
  
  if (!edge.data.cost || edge.data.cost <= 0) {
    missingFields.push('Cost');
  }
  
  if (!edge.data.transitTime || edge.data.transitTime <= 0) {
    missingFields.push('Transit Time');
  }
  
  if (missingFields.length > 0) {
    const sourceLabel = sourceNode?.data.label || edge.source;
    const targetLabel = targetNode?.data.label || edge.target;
    
    issues.push({
      id: `incomplete-edge-data-${edge.id}`,
      elementId: edge.id,
      elementType: 'edge',
      severity: 'error',
      message: `The connection between '${sourceLabel}' and '${targetLabel}' has missing or invalid data: ${missingFields.join(', ')}.`,
      suggestion: 'Select the edge and provide valid Cost and Transit Time values.'
    });
  }
  
  return issues;
}

function validateTransportMode(edge: Edge, sourceNode?: Node, targetNode?: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  if (!sourceNode || !targetNode) return issues;
  
  // Get country from either location structure or direct property
  const sourceCountry = getNodeCountry(sourceNode);
  const targetCountry = getNodeCountry(targetNode);
  const mode = edge.data.mode;
  
  // Check for inefficient transport modes
  if (sourceCountry && targetCountry && sourceCountry === targetCountry) {
    if (mode === 'sea' || mode === 'air') {
      issues.push({
        id: `inefficient-transport-${edge.id}`,
        elementId: edge.id,
        elementType: 'edge',
        severity: 'warning',
        message: `The transport mode between '${sourceNode.data.label}' and '${targetNode.data.label}' might be inefficient for domestic connections.`,
        suggestion: 'Consider \'Road\' or \'Rail\' for domestic connections instead of \'Sea\' or \'Air\'.'
      });
    }
  }
  
  return issues;
}

function validateEdgeRiskFields(edge: Edge, sourceNode?: Node, targetNode?: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Validate avgDelayDays - should be non-negative if present
  if (edge.data.avgDelayDays !== undefined) {
    if (typeof edge.data.avgDelayDays !== 'number' || edge.data.avgDelayDays < 0) {
      issues.push({
        id: `invalid-avg-delay-${edge.id}`,
        elementId: edge.id,
        elementType: 'edge',
        severity: 'error',
        message: `Average historical delay must be a non-negative number.`,
        suggestion: 'Enter a valid number of days (0 or greater) for the average delay.'
      });
    }
  }
  
  // Validate frequencyOfDisruptions - should be non-negative if present
  if (edge.data.frequencyOfDisruptions !== undefined) {
    if (typeof edge.data.frequencyOfDisruptions !== 'number' || edge.data.frequencyOfDisruptions < 0) {
      issues.push({
        id: `invalid-disruption-frequency-${edge.id}`,
        elementId: edge.id,
        elementType: 'edge',
        severity: 'error',
        message: `Disruption frequency must be a non-negative number.`,
        suggestion: 'Enter a valid number (0 or greater) for disruptions per year.'
      });
    }
  }
  
  // Validate alternative route details dependency
  if (edge.data.hasAltRoute === true) {
    if (!edge.data.altRouteDetails || typeof edge.data.altRouteDetails !== 'string' || edge.data.altRouteDetails.trim() === '') {
      issues.push({
        id: `missing-alt-route-details-${edge.id}`,
        elementId: edge.id,
        elementType: 'edge',
        severity: 'warning',
        message: `Alternative route options are enabled but no details provided.`,
        suggestion: 'Describe the alternative routes available, or disable alternative route options if none exist.'
      });
    }
  }
  
  // Validate chokepoint details dependency
  if (edge.data.passesThroughChokepoint === true) {
    if (!edge.data.chokepointNames || (Array.isArray(edge.data.chokepointNames) && edge.data.chokepointNames.length === 0)) {
      issues.push({
        id: `missing-chokepoint-names-${edge.id}`,
        elementId: edge.id,
        elementType: 'edge',
        severity: 'warning',
        message: `Route passes through chokepoints but none are specified.`,
        suggestion: 'Select the specific global chokepoints this route passes through, or disable chokepoint option if none apply.'
      });
    }
  }
  
  // Validate chokepoint names for international routes only
  if (edge.data.chokepointNames && Array.isArray(edge.data.chokepointNames) && edge.data.chokepointNames.length > 0) {
    // Get country from either location structure or direct property
    const sourceCountry = sourceNode ? getNodeCountry(sourceNode) : undefined;
    const targetCountry = targetNode ? getNodeCountry(targetNode) : undefined;
    
    if (sourceCountry && targetCountry && sourceCountry === targetCountry) {
      issues.push({
        id: `chokepoint-domestic-route-${edge.id}`,
        elementId: edge.id,
        elementType: 'edge',
        severity: 'warning',
        message: `Global chokepoints selected for a domestic route.`,
        suggestion: 'Global chokepoints typically apply to international routes. Verify if this is correct for a domestic connection.'
      });
    }
  }
  
  // Warn about high disruption frequency without alternative routes
  if (edge.data.frequencyOfDisruptions !== undefined && edge.data.frequencyOfDisruptions > 3) {
    if (edge.data.hasAltRoute !== true) {
      issues.push({
        id: `high-disruption-no-alt-${edge.id}`,
        elementId: edge.id,
        elementType: 'edge',
        severity: 'warning',
        message: `High disruption frequency (${edge.data.frequencyOfDisruptions}/year) without alternative routes.`,
        suggestion: 'Consider identifying alternative routes for this high-risk connection to improve supply chain resilience.'
      });
    }
  }
  
  // Warn about chokepoint exposure without alternative routes
  if (edge.data.passesThroughChokepoint === true && edge.data.hasAltRoute !== true) {
    issues.push({
      id: `chokepoint-no-alt-${edge.id}`,
      elementId: edge.id,
      elementType: 'edge',
      severity: 'warning',
      message: `Route passes through global chokepoints without alternative routes.`,
      suggestion: 'Consider identifying alternative routes to reduce dependency on chokepoints and improve supply chain resilience.'
    });
  }
  
  return issues;
}

// D. Cross-Element Validation Functions
function validateSupplyChainFlow(nodes: Node[], edges: Edge[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Check for illogical supply chain flow
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      const sourceType = sourceNode.data.type;
      const targetType = targetNode.data.type;
      
      // Check for unconventional connections
      if (isUnconventionalConnection(sourceType, targetType)) {
        issues.push({
          id: `unconventional-flow-${edge.id}`,
          elementId: edge.id,
          elementType: 'edge',
          severity: 'warning',
          message: `An unconventional connection exists from a '${sourceType}' to a '${targetType}'.`,
          suggestion: 'Verify that the direction of this connection is correct. Typically, goods flow from suppliers to retailers.'
        });
      }
    }
  }
  
  return issues;
}

function isUnconventionalConnection(sourceType: string, targetType: string): boolean {
  // Define unconventional flows (these might be intentional but worth flagging)
  const unconventionalFlows = [
    ['Retailer', 'Manufacturer'],
    ['Retailer', 'Factory'],
    ['Retailer', 'Supplier'],
    ['Manufacturer', 'Supplier'],
    ['Factory', 'Supplier'],
    ['Distribution', 'Factory'],
    ['Distribution', 'Manufacturer']
  ];
  
  return unconventionalFlows.some(([source, target]) => 
    sourceType === source && targetType === target
  );
}

// Utility function to get validation summary
export function getValidationSummary(issues: ValidationIssue[]): { 
  errors: number; 
  warnings: number; 
  canSave: boolean;
  errorsByType: Record<string, number>;
  warningsByType: Record<string, number>;
} {
  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');
  
  const errorsByType = errors.reduce((acc, issue) => {
    acc[issue.elementType] = (acc[issue.elementType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const warningsByType = warnings.reduce((acc, issue) => {
    acc[issue.elementType] = (acc[issue.elementType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    errors: errors.length,
    warnings: warnings.length,
    canSave: errors.length === 0,
    errorsByType,
    warningsByType
  };
}

// Helper function to get country from node data (checking both possible locations)
function getNodeCountry(node: Node): string | undefined {
  return node.data.location?.country || node.data.country;
}

// Helper function to set country in the proper structure for consistency
function ensureCountryConsistency(node: Node): void {
  const country = getNodeCountry(node);
  if (country) {
    // Ensure both formats exist for backward compatibility
    if (!node.data.country) {
      node.data.country = country;
    }
    if (!node.data.location?.country) {
      if (!node.data.location) {
        node.data.location = {};
      }
      node.data.location.country = country;
    }
  }
}

// Add a specific country validation function
function validateNodeCountry(node: Node): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // Get country from either location structure or direct property
  const country = getNodeCountry(node);
  
  if (!country) {
    issues.push({
      id: `missing-country-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error', // Changed to error since country is critical for supply chain analysis
      message: `Node '${node.data.label || node.id}' is missing country information.`,
      suggestion: 'Select a country in the Location section. Country information is required for accurate supply chain risk assessment, logistics planning, and regulatory compliance analysis.'
    });
  } else if (typeof country !== 'string' || country.trim() === '') {
    issues.push({
      id: `invalid-country-${node.id}`,
      elementId: node.id,
      elementType: 'node',
      severity: 'error',
      message: `Node '${node.data.label || node.id}' has invalid country information.`,
      suggestion: 'Please re-select a valid country from the dropdown in the Location section.'
    });
  } else {
    // Country is valid, ensure consistency across data structure
    ensureCountryConsistency(node);
  }
  
  return issues;
} 