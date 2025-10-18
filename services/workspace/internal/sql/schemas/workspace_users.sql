CREATE TABLE workspace_users (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    access_type TEXT DEFAULT 'member', -- 'member', 'owner'
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, workspace_id)
);