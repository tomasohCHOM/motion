CREATE TABLE workspace_users (
    user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    -- Values: 'member', 'owner'
    access_type TEXT DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (user_id, workspace_id)
);
