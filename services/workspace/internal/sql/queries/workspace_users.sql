-- name: AddUserToWorkspace :exec
INSERT INTO workspace_users (user_id, workspace_id, access_type)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, workspace_id) DO UPDATE
    SET access_type = excluded.access_type;

-- name: RemoveUserFromWorkspace :exec
DELETE FROM workspace_users
WHERE
    user_id = $1
    AND workspace_id = $2;

-- name: GetWorkspaceUsers :many
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.username,
    wu.access_type,
    wu.joined_at
FROM workspace_users AS wu
INNER JOIN users AS u ON wu.user_id = u.id
WHERE wu.workspace_id = $1
ORDER BY wu.joined_at ASC;

-- name: IsWorkspaceUser :one
SELECT EXISTS(
    SELECT 1
    FROM workspace_users
    WHERE
        user_id = $1
        AND workspace_id = $2
);

-- name: GetUserWorkspaces :many
SELECT
    w.id,
    w.name,
    w.description,
    w.created_at,
    w.updated_at,
    COUNT(wu2.user_id) AS member_count
FROM workspaces AS w
INNER JOIN workspace_users AS wu ON w.id = wu.workspace_id
INNER JOIN workspace_users AS wu2 ON w.id = wu2.workspace_id
WHERE wu.user_id = $1
GROUP BY
    w.id,
    w.name,
    w.description,
    w.created_at,
    w.updated_at
ORDER BY w.created_at DESC;

-- name: GetUserAccessType :one
SELECT access_type
FROM workspace_users
WHERE
    user_id = $1
    AND workspace_id = $2;

-- name: UpdateUserAccessType :exec
UPDATE workspace_users
SET access_type = $3
WHERE
    user_id = $1
    AND workspace_id = $2;
