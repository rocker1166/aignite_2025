-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_logs (
  user_id uuid,
  action text,
  details jsonb,
  log_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.blockchain_traceability (
  supply_chain_id uuid,
  event_type text,
  details jsonb,
  trace_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  blockchain_timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT blockchain_traceability_pkey PRIMARY KEY (trace_id),
  CONSTRAINT blockchain_traceability_supply_chain_id_fkey FOREIGN KEY (supply_chain_id) REFERENCES public.supply_chains(supply_chain_id)
);
CREATE TABLE public.cost_benefit_analysis (
  strategy_id uuid,
  baseline_cost numeric,
  strategy_cost numeric,
  savings_estimate numeric,
  analysis_details jsonb,
  analysis_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  calculated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cost_benefit_analysis_pkey PRIMARY KEY (analysis_id),
  CONSTRAINT cost_benefit_analysis_strategy_id_fkey FOREIGN KEY (strategy_id) REFERENCES public.strategies(strategy_id)
);
CREATE TABLE public.edges (
  supply_chain_id uuid,
  from_node_id uuid,
  to_node_id uuid,
  relationship_type text,
  cost numeric,
  transit_time numeric,
  metadata jsonb,
  edge_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT edges_pkey PRIMARY KEY (edge_id),
  CONSTRAINT edges_to_node_id_fkey FOREIGN KEY (to_node_id) REFERENCES public.nodes(node_id),
  CONSTRAINT edges_from_node_id_fkey FOREIGN KEY (from_node_id) REFERENCES public.nodes(node_id),
  CONSTRAINT edges_supply_chain_id_fkey FOREIGN KEY (supply_chain_id) REFERENCES public.supply_chains(supply_chain_id)
);
CREATE TABLE public.esg_analytics (
  supplier_id uuid,
  environmental_score numeric,
  social_score numeric,
  governance_score numeric,
  overall_esg numeric,
  analysis_details jsonb,
  esg_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  calculated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT esg_analytics_pkey PRIMARY KEY (esg_id),
  CONSTRAINT esg_analytics_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(supplier_id)
);
CREATE TABLE public.external_signals (
  signal_type text,
  source text,
  value text,
  metadata jsonb,
  signal_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT external_signals_pkey PRIMARY KEY (signal_id)
);
CREATE TABLE public.impact_results (
  simulation_id uuid,
  metric_name text,
  metric_value numeric,
  measurement_unit text,
  impact_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT impact_results_pkey PRIMARY KEY (impact_id),
  CONSTRAINT impact_results_simulation_id_fkey FOREIGN KEY (simulation_id) REFERENCES public.simulations(simulation_id)
);
CREATE TABLE public.kpi_history (
  supply_chain_id uuid,
  metric_name text,
  metric_value numeric,
  kpi_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  recorded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kpi_history_pkey PRIMARY KEY (kpi_id),
  CONSTRAINT kpi_history_supply_chain_id_fkey FOREIGN KEY (supply_chain_id) REFERENCES public.supply_chains(supply_chain_id)
);
CREATE TABLE public.nodes (
  location text,
  coordinates text,
  industry text,
  supply_chain_id uuid,
  type text,
  name text,
  x numeric,
  y numeric,
  capacity numeric,
  current_inventory numeric,
  risk_level numeric,
  node_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT nodes_pkey PRIMARY KEY (node_id),
  CONSTRAINT nodes_supply_chain_id_fkey FOREIGN KEY (supply_chain_id) REFERENCES public.supply_chains(supply_chain_id)
);
CREATE TABLE public.notifications (
  user_id uuid,
  message text,
  notification_type text,
  citations jsonb,
  title text,
  severity text,
  notification_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  read_status boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.simulations (
  supply_chain_id uuid,
  name text,
  scenario_type text,
  parameters jsonb,
  simulation_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text DEFAULT 'pending'::text,
  result_summary jsonb,
  simulated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT simulations_pkey PRIMARY KEY (simulation_id),
  CONSTRAINT simulations_supply_chain_id_fkey FOREIGN KEY (supply_chain_id) REFERENCES public.supply_chains(supply_chain_id)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.strategies (
  simulation_id uuid,
  strategy_title text,
  description text,
  details jsonb,
  estimated_roi numeric,
  cost_estimate numeric,
  risk_reduction numeric,
  implementation_time text,
  complexity text,
  tags ARRAY,
  strategy_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text DEFAULT 'AI Generated'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT strategies_pkey PRIMARY KEY (strategy_id),
  CONSTRAINT strategies_simulation_id_fkey FOREIGN KEY (simulation_id) REFERENCES public.simulations(simulation_id)
);
CREATE TABLE public.suppliers (
  name text,
  location text,
  rating numeric,
  cost_factor numeric,
  sustainability_score numeric,
  contact_info text,
  metadata jsonb,
  supplier_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT suppliers_pkey PRIMARY KEY (supplier_id)
);
CREATE TABLE public.supply_chain_intel (
  intelligence_data jsonb,
  risk_score integer DEFAULT 0,
  quality_score numeric DEFAULT 0.0,
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  supply_chain_id uuid,
  node_id text NOT NULL,
  intel_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  news jsonb DEFAULT '[]'::jsonb,
  weather jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT supply_chain_intel_pkey PRIMARY KEY (intel_id),
  CONSTRAINT supply_chain_intel_supply_chain_id_fkey FOREIGN KEY (supply_chain_id) REFERENCES public.supply_chains(supply_chain_id),
  CONSTRAINT supply_chain_intel_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.supply_chains (
  user_id uuid,
  name text NOT NULL,
  description text,
  nodes jsonb,
  edges jsonb,
  connections jsonb,
  organisation jsonb,
  productInventories jsonb,
  supply_chain_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT supply_chains_pkey PRIMARY KEY (supply_chain_id),
  CONSTRAINT supply_chains_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_settings (
  user_id uuid,
  notification_preferences jsonb,
  dashboard_layout jsonb,
  setting_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  theme text DEFAULT 'light'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (setting_id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  email text NOT NULL UNIQUE,
  organisation_name text,
  location text,
  employee_count numeric,
  industry text,
  description text,
  sub_industry text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);