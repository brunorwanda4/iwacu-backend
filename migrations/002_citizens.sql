-- Create citizens table for user registration with National ID-based login
-- Citizens are registered users identified by Rwanda's National ID (no password)

CREATE TABLE citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('M', 'F')),
    home_location_id UUID NOT NULL REFERENCES locations(id),
    profile_photo_url TEXT,
    is_leader BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_citizens_national_id ON citizens(national_id);
CREATE INDEX idx_citizens_home_location_id ON citizens(home_location_id);

-- Create trigger to auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_citizens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_citizens_updated_at
BEFORE UPDATE ON citizens
FOR EACH ROW
EXECUTE FUNCTION update_citizens_updated_at();
