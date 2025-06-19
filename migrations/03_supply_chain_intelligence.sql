-- Supply Chain Intelligence Storage Migration
-- This migration creates the necessary tables and indexes for the production intelligence agent

-- Supply Chain Intelligence table
CREATE TABLE IF NOT EXISTS supply_chain_intel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supply_chain_id UUID NOT NULL REFERENCES supply_chains(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES nodes(node_id) ON DELETE CASCADE,
    intelligence_data JSONB NOT NULL,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint on supply_chain_id and node_id for upserts
    UNIQUE(supply_chain_id, node_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_supply_chain_id ON supply_chain_intel(supply_chain_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_node_id ON supply_chain_intel(node_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_risk_score ON supply_chain_intel(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_quality_score ON supply_chain_intel(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_updated_at ON supply_chain_intel(updated_at DESC);

-- GIN index for JSONB intelligence data for complex queries
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_intelligence_data ON supply_chain_intel USING GIN (intelligence_data);

-- Intelligence Archive table for historical data
CREATE TABLE IF NOT EXISTS supply_chain_intel_archive (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supply_chain_id UUID NOT NULL,
    node_id UUID NOT NULL,
    intelligence_data JSONB NOT NULL,
    risk_score INTEGER,
    quality_score DECIMAL(3,2),
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_created_at TIMESTAMP WITH TIME ZONE,
    original_updated_at TIMESTAMP WITH TIME ZONE
);

-- Index for archive table
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_archive_node_id ON supply_chain_intel_archive(node_id);
CREATE INDEX IF NOT EXISTS idx_supply_chain_intel_archive_archived_at ON supply_chain_intel_archive(archived_at DESC);

-- Intelligence Metrics table for tracking performance
CREATE TABLE IF NOT EXISTS intel_agent_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supply_chain_id UUID NOT NULL,
    node_id UUID,
    request_type VARCHAR(50) NOT NULL, -- 'single_node', 'full_chain', 'memory_retrieval'
    processing_time_ms INTEGER NOT NULL,
    sources_checked INTEGER DEFAULT 0,
    cache_hit BOOLEAN DEFAULT FALSE,
    memory_enhanced BOOLEAN DEFAULT FALSE,
    error_occurred BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for metrics
CREATE INDEX IF NOT EXISTS idx_intel_agent_metrics_supply_chain_id ON intel_agent_metrics(supply_chain_id);
CREATE INDEX IF NOT EXISTS idx_intel_agent_metrics_created_at ON intel_agent_metrics(created_at DESC);

-- Function to archive old intelligence data (older than 30 days)
CREATE OR REPLACE FUNCTION archive_old_intel() RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move old records to archive
    INSERT INTO supply_chain_intel_archive (
        supply_chain_id, node_id, intelligence_data, 
        risk_score, quality_score, original_created_at, original_updated_at
    )
    SELECT 
        supply_chain_id, node_id, intelligence_data,
        risk_score, quality_score, created_at, updated_at
    FROM supply_chain_intel
    WHERE updated_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Delete old records from main table
    DELETE FROM supply_chain_intel 
    WHERE updated_at < NOW() - INTERVAL '30 days';
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest intelligence for a supply chain
CREATE OR REPLACE FUNCTION get_latest_supply_chain_intel(sc_id UUID)
RETURNS TABLE (
    node_id UUID,
    node_name TEXT,
    node_type TEXT,
    intelligence_data JSONB,
    risk_score INTEGER,
    quality_score DECIMAL(3,2),
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sci.node_id,
        n.name as node_name,
        n.type as node_type,
        sci.intelligence_data,
        sci.risk_score,
        sci.quality_score,
        sci.updated_at
    FROM supply_chain_intel sci
    JOIN nodes n ON sci.node_id = n.node_id
    WHERE sci.supply_chain_id = sc_id
    ORDER BY sci.risk_score DESC, sci.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get critical events across a supply chain
CREATE OR REPLACE FUNCTION get_critical_events(sc_id UUID)
RETURNS TABLE (
    node_id UUID,
    node_name TEXT,
    critical_events JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sci.node_id,
        n.name as node_name,
        sci.intelligence_data->'intelligence'->'criticalEvents' as critical_events
    FROM supply_chain_intel sci
    JOIN nodes n ON sci.node_id = n.node_id
    WHERE sci.supply_chain_id = sc_id
    AND sci.intelligence_data->'intelligence'->'criticalEvents' IS NOT NULL
    AND jsonb_array_length(sci.intelligence_data->'intelligence'->'criticalEvents') > 0;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if using Row Level Security)
-- Enable RLS
ALTER TABLE supply_chain_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_chain_intel_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_agent_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Users can access their own supply chain intel" ON supply_chain_intel
    FOR ALL USING (
        supply_chain_id IN (
            SELECT id FROM supply_chains 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their own intel archive" ON supply_chain_intel_archive
    FOR ALL USING (
        supply_chain_id IN (
            SELECT id FROM supply_chains 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can access their own metrics" ON intel_agent_metrics
    FOR ALL USING (
        supply_chain_id IN (
            SELECT id FROM supply_chains 
            WHERE user_id = auth.uid()
        )
    );

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_supply_chain_intel_updated_at
    BEFORE UPDATE ON supply_chain_intel
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
