// Type definitions for database tables

export interface User {
  user_id: string
  username: string
  email: string
  password_hash: string
  role: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  setting_id: string
  user_id: string
  theme: string
  notification_preferences?: any
  dashboard_layout?: any
  created_at: string
  updated_at: string
}

export interface SupplyChain {
  supply_chain_id: string
  user_id: string
  name: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface Node {
  node_id: string
  supply_chain_id: string
  type: string
  name: string
  x: number
  y: number
  capacity: number
  current_inventory: number
  risk_level: number
  metadata?: any
  created_at: string
  updated_at: string
}

export interface Edge {
  edge_id: string
  supply_chain_id: string
  from_node_id: string
  to_node_id: string
  relationship_type: string
  cost: number
  transit_time: number
  metadata?: any
  created_at: string
  updated_at: string
}

export interface Simulation {
  simulation_id: string
  supply_chain_id: string
  name: string
  scenario_type: string
  parameters?: any
  status: string
  result_summary?: any
  simulated_at?: string
  created_at: string
  updated_at: string
}

export interface ImpactResult {
  impact_id: string
  simulation_id: string
  metric_name: string
  metric_value: number
  measurement_unit: string
  recorded_at: string
}

export interface KpiHistory {
  kpi_id: string
  supply_chain_id: string
  metric_name: string
  metric_value: number
  recorded_at: string
}

export interface Strategy {
  strategy_id: string
  simulation_id: string
  strategy_title: string
  description: string
  details?: any
  estimated_roi: number
  cost_estimate: number
  risk_reduction: number
  implementation_time: string
  complexity: string
  status: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CostBenefitAnalysis {
  analysis_id: string
  strategy_id: string
  baseline_cost: number
  strategy_cost: number
  savings_estimate: number
  analysis_details?: any
  calculated_at: string
}

export interface Supplier {
  supplier_id: string
  name: string
  location: string
  rating: number
  cost_factor: number
  sustainability_score: number
  contact_info: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface EsgAnalytics {
  esg_id: string
  supplier_id: string
  environmental_score: number
  social_score: number
  governance_score: number
  overall_esg: number
  analysis_details?: any
  calculated_at: string
}

export interface ExternalSignal {
  signal_id: string
  signal_type: string
  source: string
  value: string
  timestamp: string
  metadata?: any
}

export interface BlockchainTraceability {
  trace_id: string
  supply_chain_id: string
  event_type: string
  details?: any
  blockchain_timestamp: string
}

export interface Notification {
  notification_id: string
  user_id: string
  message: string
  notification_type: string
  read_status: boolean
  created_at: string
}

export interface AuditLog {
  log_id: string
  user_id: string
  action: string
  details?: any
  timestamp: string
}
