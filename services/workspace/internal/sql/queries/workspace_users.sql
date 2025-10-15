-- name: AddUserToWorkspace :exec
INSERT INTO workspace_users (user_id, workspace_id, access_type)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, workspace_id) DO UPDATE
SET access_type = EXCLUDED.access_type;

-- name: RemoveUserFromWorkspace :exec
DELETE FROM workspace_users
WHERE user_id = $1 AND workspace_id = $2;

-- name: GetWorkspaceUsers :many
SELECT u.id, u.email, u.first_name, u.last_name, wu.access_type, wu.joined_at
FROM workspace_users wu
JOIN users u ON wu.user_id = u.id
WHERE wu.workspace_id = $1
ORDER BY wu.joined_at ASC;

-- name: GetUserWorkspaces :many
SELECT
  w.*,
  COUNT(wu2.user_id) AS member_count
FROM workspaces w
JOIN workspace_users wu ON w.id = wu.workspace_id
JOIN workspace_users wu2 ON w.id = wu2.workspace_id
WHERE wu.user_id = $1
GROUP BY w.id
ORDER BY w.created_at DESC;

-- name: GetUserAccessType :one
SELECT access_type
FROM workspace_users
WHERE user_id = $1 AND workspace_id = $2;

-- name: UpdateUserAccessType :exec
UPDATE workspace_users
SET access_type = $3
WHERE user_id = $1 AND workspace_id = $2;
