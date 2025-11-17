CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    author_id TEXT REFERENCES users (id),
    title TEXT NOT NULL DEFAULT 'Untitled',
    body TEXT NOT NULL DEFAULT '',
    tags TEXT [] NOT NULL DEFAULT '{}'::TEXT [],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_workspace_id ON notes (workspace_id);
