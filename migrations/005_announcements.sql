-- Create announcements table for public messages posted by leaders
-- Announcements are visible to citizens in the posting location and all parent locations (up the hierarchy)
-- When a leader is deleted, all their announcements are cascade-deleted

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leader_id UUID NOT NULL REFERENCES leaders(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('general', 'meeting', 'infrastructure', 'health', 'security', 'umuganda', 'emergency')),
    is_urgent BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    attachment_url TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_announcements_location_id ON announcements(location_id);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_is_urgent ON announcements(is_urgent);
CREATE INDEX idx_announcements_created_at_desc ON announcements(created_at DESC);
CREATE INDEX idx_announcements_expires_at ON announcements(expires_at);

-- Create trigger to auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_announcements_updated_at();
