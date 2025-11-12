-- name: CreateFile :one
INSERT INTO files (
    id, user_id, original_name, storage_key, content_type, size_bytes, metadata
) VALUES (

    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetFileById :many
SELECT * FROM files
WHERE id = $1;

-- name: ListFiles :many
SELECT * FROM files;

-- name: ListFilesByUser :many
SELECT * FROM files
WHERE user_id = $1
ORDER BY uploaded_at DESC
LIMIT $2 OFFSET $3;

-- name: SearchFilesByMetadata :many
SELECT * FROM files
WHERE user_id = $1 AND metadata @> $2::jsonb
ORDER BY uploaded_at DESC;

-- name: DeleteFile :exec
DELETE FROM files
WHERE id = $1 AND user_id = $2;
