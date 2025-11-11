-- name: CreateNewTask :one
INSERT INTO tasks (
  workspace_id,
  title,
  description,
  assignee_id,
  status,
  priority,
  due_date
) VALUES (
  $1, -- workspace_id
  $2, -- title
  $3, -- description
  $4, -- assignee_id
  $5, -- status
  $6, -- priority
  $7  -- due_date
)
RETURNING *;

-- name: GetTasksByWorkspace :many
SELECT
    t.id AS task_id,
    t.workspace_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.created_at,
    t.updated_at,

    -- Assignee info
    u.id AS assignee_id,
    u.first_name AS assignee_first_name,
    u.last_name AS assignee_last_name,
    u.username AS assignee_username,
    u.email AS assignee_email
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
WHERE t.workspace_id = $1
ORDER BY t.created_at DESC;

-- name: GetTaskByID :one
SELECT
    t.id AS task_id,
    t.workspace_id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.created_at,
    t.updated_at,

    -- Assignee info
    u.id AS assignee_id,
    u.first_name AS assignee_first_name,
    u.last_name AS assignee_last_name,
    u.username AS assignee_username,
    u.email AS assignee_email
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
WHERE t.id = $1;

-- name: UpdateTask :one
UPDATE tasks
SET
  title = $2, -- title
  description = $3, -- description
  assignee_id = $4, -- assignee_id
  status = $5, -- status
  priority = $6, -- priority
  due_date = $7  -- due_date
WHERE id = $1
RETURNING *;

-- name: DeleteTask :exec
DELETE FROM tasks WHERE id = $1;
