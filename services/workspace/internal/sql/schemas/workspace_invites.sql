CREATE TABLE workspace_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workspace_name TEXT NOT NULL,
    invited_by TEXT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    invitee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    access_type TEXT DEFAULT 'member', -- 'member', 'owner'
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(workspace_id, invitee_id)
);