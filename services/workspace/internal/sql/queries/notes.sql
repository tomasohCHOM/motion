-- name: CreateNote :one
INSERT INTO notes (workspace_id, author_id, title, content, tags)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, workspace_id, author_id, title, content, tags, created_at, updated_at;

-- name: GetWorkspaceNote :one
SELECT id, workspace_id, author_id, title, content, tags, created_at, updated_at
FROM notes
WHERE workspace_id = $1 AND id = $2;

-- name: ListWorkspaceNotes :many
SELECT id, workspace_id, author_id, title, content, tags, created_at, updated_at
FROM notes
WHERE workspace_id = $1
ORDER BY updated_at DESC;

-- name: UpdateNote :one
UPDATE notes
SET
    title = $3,
    content = $4,
    tags = $5,
    updated_at = now()
WHERE workspace_id = $1 AND id = $2
RETURNING id, workspace_id, author_id, title, content, tags, created_at, updated_at;

-- name: DeleteNote :exec
DELETE FROM notes
WHERE workspace_id = $1 AND id = $2;
