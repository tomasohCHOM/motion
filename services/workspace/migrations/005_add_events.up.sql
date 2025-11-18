CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    attendees_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_workspace_id ON events (workspace_id);
CREATE INDEX idx_events_date ON events (event_date);
