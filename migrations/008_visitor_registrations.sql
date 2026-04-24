-- Create visitor_registrations table for guest tracking
-- Citizens register visitors staying in their homes, visible to Village Leaders
-- Tracks visitor information, arrival/departure dates, and location

CREATE TABLE visitor_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    visitor_name TEXT NOT NULL,
    visitor_national_id TEXT,
    visitor_phone TEXT,
    purpose_of_visit TEXT,
    arrival_date DATE NOT NULL,
    expected_departure_date DATE,
    actual_departure_date DATE,
    location_id UUID NOT NULL REFERENCES locations(id),
    is_departed BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create composite index on (location_id, is_departed) for efficient queries by Village Leaders
-- This allows fast filtering of active visitors in a specific location
CREATE INDEX idx_visitor_registrations_location_is_departed ON visitor_registrations(location_id, is_departed);

