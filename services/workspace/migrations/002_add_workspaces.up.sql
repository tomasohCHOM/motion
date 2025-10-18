CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_users (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    access_type TEXT DEFAULT 'member', -- 'member', 'owner'
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, workspace_id)
);