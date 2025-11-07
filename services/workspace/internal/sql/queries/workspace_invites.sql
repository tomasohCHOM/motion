-- name: CreateWorkspaceInvite :one
INSERT INTO workspace_invites (
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type
) VALUES (
    $1,  -- workspace_id
    $2,  -- invited_by (user_id)
    $3,  -- invitee_id
    $4,  -- invitee_email
    COALESCE($5, 'member')  -- access_type
)
RETURNING *;

-- name: CreateWorkspaceInviteByIdentifier :one
INSERT INTO workspace_invites (
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type
)
SELECT
    $1,          -- workspace_id
    $2,          -- invited_by
    u.id,        -- invitee_id from lookoup
    u.email,     -- invitee_email from lookup
    $3           -- access_type
FROM users u
WHERE u.email = @identifier OR u.username = @identifier
RETURNING *;

-- name: GetInviteById :one
SELECT * FROM workspace_invites WHERE id = $1;

-- name: ListInvitesForUser :many
SELECT
    wi.id,
    wi.workspace_id,
    w.name AS workspace_name,
    wi.invited_by,
    wi.invitee_id,
    wi.access_type,
    wi.status,
    wi.created_at,
    wi.expires_at
FROM workspace_invites wi
JOIN workspaces w ON wi.workspace_id = w.id
WHERE
    wi.invitee_id = sqlc.arg(invitee_id)
    AND wi.status = 'pending'
    AND wi.expires_at > NOW()
ORDER BY wi.created_at DESC;

-- name: AcceptWorkspaceInvite :one
UPDATE workspace_invites
SET
    status = 'accepted',
    invitee_id = $2
WHERE
    id = $1
    AND status = 'pending'
    AND expires_at > NOW()
RETURNING *;

-- name: DeleteWorkspaceInvite :exec
DELETE FROM workspace_invites
WHERE id = $1;
