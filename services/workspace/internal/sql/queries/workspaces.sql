-- name: CreateWorkspace :one
INSERT INTO workspaces (name, description)
VALUES ($1, $2)
RETURNING *;

-- name: GetWorkspaceById :one
SELECT * FROM workspaces WHERE id = $1;

-- name: UpdateWorkspaceInfo :one
UPDATE workspaces
SET
  name = COALESCE($2, name),
  description = COALESCE($3, description),
  updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteWorkspace :exec
DELETE FROM workspaces WHERE id = $1;