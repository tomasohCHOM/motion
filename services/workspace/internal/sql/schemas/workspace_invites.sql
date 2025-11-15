CREATE TABLE workspace_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    invited_by TEXT NOT NULL REFERENCES users (id) ON DELETE SET NULL,
    invitee_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    -- Values: 'member', 'owner'
    access_type TEXT DEFAULT 'member',
    -- Values: 'pending', 'accepted', 'declined', 'expired'
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
    UNIQUE (workspace_id, invitee_id)
);
