-- Create locations table for Rwanda's 5-level administrative hierarchy
-- Levels: 1=Province, 2=District, 3=Sector, 4=Cell, 5=Village

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_kinyarwanda TEXT,
    level SMALLINT NOT NULL CHECK (level >= 1 AND level <= 5),
    parent_id UUID REFERENCES locations(id),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint: only level 1 (Province) can have NULL parent_id
    CONSTRAINT only_level_1_null_parent CHECK (level = 1 OR parent_id IS NOT NULL),
    
    -- Constraint: unique combination of name and parent_id within same parent
    UNIQUE (name, parent_id)
);

-- Create indexes for efficient hierarchy queries
CREATE INDEX idx_locations_parent_id ON locations(parent_id);
CREATE INDEX idx_locations_level ON locations(level);
CREATE INDEX idx_locations_level_parent_id ON locations(level, parent_id);
