CREATE TYPE task_status AS ENUM ('To-Do', 'In Progress', 'Review', 'Done');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status task_status NOT NULL DEFAULT 'To-Do',
    priority task_priority DEFAULT 'Medium',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);