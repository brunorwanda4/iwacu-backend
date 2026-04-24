-- Create service_requests table for citizen complaints and requests
-- Citizens submit service requests to government departments with auto-generated reference numbers
-- Reference numbers follow format: IWC-YEAR-NNNNN (e.g., IWC-2026-00001)

-- Create sequence for reference_number generation
CREATE SEQUENCE service_requests_reference_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES service_departments(id),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    reference_number TEXT UNIQUE NOT NULL,
    response_text TEXT,
    responded_at TIMESTAMPTZ,
    location_id UUID REFERENCES locations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_service_requests_citizen_id ON service_requests(citizen_id);
CREATE INDEX idx_service_requests_department_id ON service_requests(department_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_created_at_desc ON service_requests(created_at DESC);

-- Create trigger to auto-generate reference_number on INSERT
CREATE OR REPLACE FUNCTION generate_service_request_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reference_number = 'IWC-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || 
                           LPAD(nextval('service_requests_reference_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_service_requests_reference
BEFORE INSERT ON service_requests
FOR EACH ROW
EXECUTE FUNCTION generate_service_request_reference();

-- Create trigger to auto-update updated_at on UPDATE
CREATE OR REPLACE FUNCTION update_service_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_service_requests_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW
EXECUTE FUNCTION update_service_requests_updated_at();
