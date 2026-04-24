-- Create service_departments table for government agencies
-- Lookup table storing government service departments that receive citizen requests

CREATE TABLE service_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_kinyarwanda TEXT,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('security', 'utilities', 'health', 'finance', 'transport', 'education', 'land', 'general')),
    phone_number TEXT,
    email TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on category for efficient filtering
CREATE INDEX idx_service_departments_category ON service_departments(category);

-- Create index on is_active for filtering active departments
CREATE INDEX idx_service_departments_is_active ON service_departments(is_active);
