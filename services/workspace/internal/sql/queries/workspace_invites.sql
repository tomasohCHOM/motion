-- name: CreateWorkspaceInvite :one
INSERT INTO workspace_invites (
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type
)
VALUES (
    $1, -- workspace_id
    $2, -- invited_by (user_id)
    $3, -- invitee_id
    $4, -- invitee_email
    COALESCE($5, 'member') -- access_type
)
RETURNING
    id,
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type,
    status,
    created_at,
    expires_at;

-- name: CreateWorkspaceInviteByIdentifier :one
INSERT INTO workspace_invites (
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type
)
SELECT
    $1 AS workspace_id,
    $2 AS invited_by,
    u.id AS invitee_id,
    u.email AS invitee_email,
    $3 AS access_type
FROM users AS u
WHERE
    u.email = $4
    OR u.username = $4
RETURNING
    id,
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type,
    status,
    created_at,
    expires_at;

-- name: GetInviteById :one
SELECT
    id,
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type,
    status,
    created_at,
    expires_at
FROM workspace_invites
WHERE id = $1;

-- name: ListInvitesForUser :many
SELECT
    wi.id,
    wi.workspace_id,
    w.name AS workspace_name,
    u.first_name AS inviter_first_name,
    u.last_name AS inviter_last_name,
    wi.invitee_id,
    wi.access_type,
    wi.status,
    wi.created_at,
    wi.expires_at
FROM workspace_invites AS wi
INNER JOIN workspaces AS w ON wi.workspace_id = w.id
INNER JOIN users AS u ON wi.invited_by = u.id
WHERE
    wi.invitee_id = $1
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
RETURNING
    id,
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type,
    status,
    created_at,
    expires_at;

-- name: DeleteWorkspaceInvite :exec
DELETE FROM workspace_invites
WHERE id = $1;
