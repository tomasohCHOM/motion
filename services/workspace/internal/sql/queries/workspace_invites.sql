-- name: CreateWorkspaceInvite :one
INSERT INTO workspace_invites (
    workspace_id,
    invited_by,
    invitee_id,
    invitee_email,
    access_type,
    token
) VALUES (
    $1,  -- workspace_id
    $2,  -- invited_by (user_id)
    $4,  -- invitee_id (nullable)
    $3,  -- invitee_email
    COALESCE($5, 'member'),  -- access_type
    $6   -- token (e.g. UUID or secure random string)
)
RETURNING *;

-- name: ListInvitesForUser :many
SELECT *
FROM workspace_invites
WHERE
    (invitee_id = $1 OR invitee_email = $2)
    AND status = 'pending'
    AND expires_at > NOW()
ORDER BY created_at DESC;

-- name: AcceptWorkspaceInvite :one
UPDATE workspace_invites
SET
    status = 'accepted',
    invitee_id = $2
WHERE
    token = $1
    AND status = 'pending'
    AND expires_at > NOW()
RETURNING *;

-- name: DeleteWorkspaceInvite :exec
DELETE FROM workspace_invites
WHERE id = $1;
