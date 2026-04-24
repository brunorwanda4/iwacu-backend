-- Create leaders table for government officials assigned to locations
-- Each location has at most one leader (UNIQUE constraint on location_id)
-- Leaders are also Citizens (reference to citizens table)

CREATE TABLE leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES citizens(id),
    location_id UUID NOT NULL UNIQUE REFERENCES locations(id),
    title TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    office_address TEXT,
    office_latitude NUMERIC(10, 7),
    office_longitude NUMERIC(10, 7),
    profile_photo_url TEXT,
    bio TEXT,
    can_post_announcements BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    appointed_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_leaders_location_id ON leaders(location_id);
CREATE INDEX idx_leaders_citizen_id ON leaders(citizen_id);
CREATE INDEX idx_leaders_is_active ON leaders(is_active);

-- Create trigger to auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_leaders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leaders_updated_at
BEFORE UPDATE ON leaders
FOR EACH ROW
EXECUTE FUNCTION update_leaders_updated_at();
