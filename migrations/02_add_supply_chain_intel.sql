-- Supply Chain Intelligence Table
CREATE TABLE IF NOT EXISTS supply_chain_intel (
  intel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  supply_chain_id UUID REFERENCES supply_chains(supply_chain_id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  news JSONB DEFAULT '[]',
  weather JSONB DEFAULT '{}'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_user_id ON supply_chain_intel(user_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_supply_chain_id ON supply_chain_intel(supply_chain_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_node_id ON supply_chain_intel(node_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_created_at ON supply_chain_intel(created_at);