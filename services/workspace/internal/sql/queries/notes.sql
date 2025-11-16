-- name: CreateNote :one
INSERT INTO notes (workspace_id, author_id, title, content, tags)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetWorkspaceNote :one
SELECT * FROM notes
WHERE workspace_id = $1 AND id = $2;

-- name: ListWorkspaceNotes :many
SELECT * FROM notes
WHERE workspace_id = $1
ORDER BY updated_at DESC;

-- name: UpdateNote :one
UPDATE notes
SET
  title = $3,
  content = $4,
  tags = $5,
  updated_at = NOW()
WHERE workspace_id = $1 AND id = $2
RETURNING *;

-- name: DeleteNote :exec
DELETE FROM notes
WHERE workspace_id = $1 AND id = $2;
