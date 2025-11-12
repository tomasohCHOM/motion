-- name: CreateFile :one
INSERT INTO files (
    id, user_id, original_name, storage_key, content_type, size_bytes, metadata
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING id, user_id, original_name, storage_key, content_type, size_bytes, metadata, uploaded_at;

-- name: GetFileById :many
SELECT id, user_id, original_name, storage_key, content_type, size_bytes, metadata, uploaded_at
FROM files
WHERE id = $1;

-- name: ListFiles :many
SELECT id, user_id, original_name, storage_key, content_type, size_bytes, metadata, uploaded_at
FROM files;

-- name: ListFilesByUser :many
SELECT id, user_id, original_name, storage_key, content_type, size_bytes, metadata, uploaded_at
FROM files
WHERE user_id = $1
ORDER BY uploaded_at DESC
LIMIT $2 OFFSET $3;

-- name: SearchFilesByMetadata :many
SELECT id, user_id, original_name, storage_key, content_type, size_bytes, metadata, uploaded_at
FROM files
WHERE user_id = $1 AND metadata @> $2::jsonb
ORDER BY uploaded_at DESC;

-- name: DeleteFile :exec
DELETE FROM files
WHERE id = $1 AND user_id = $2;
