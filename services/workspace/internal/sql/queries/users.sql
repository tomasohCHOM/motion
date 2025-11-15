-- name: CreateUser :one
INSERT INTO users (id, email, first_name, last_name, username)
VALUES ($1, $2, $3, $4, $5)
RETURNING
    id,
    email,
    first_name,
    last_name,
    username,
    created_at,
    updated_at;

-- name: GetUserByID :one
SELECT
    id,
    email,
    first_name,
    last_name,
    username,
    created_at,
    updated_at
FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT
    id,
    email,
    first_name,
    last_name,
    username,
    created_at,
    updated_at
FROM users
WHERE email = $1;

-- name: GetUserByUsername :one
SELECT
    id,
    email,
    first_name,
    last_name,
    username,
    created_at,
    updated_at
FROM users
WHERE username = $1;

-- name: ListUsers :many
SELECT
    id,
    email,
    first_name,
    last_name,
    username,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- name: UpdateUser :one
UPDATE users
SET
    first_name = COALESCE($2, first_name),
    last_name = COALESCE($3, last_name),
    username = COALESCE($4, username),
    updated_at = NOW()
WHERE id = $1
RETURNING
    id,
    email,
    first_name,
    last_name,
    username,
    created_at,
    updated_at;

-- name: UpsertUser :exec
INSERT INTO users (id, email, first_name, last_name, username)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (id) DO UPDATE
    SET
        email = excluded.email,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        username = excluded.username,
        updated_at = NOW();

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;
