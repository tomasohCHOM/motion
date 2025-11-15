export type TaskResponse = {
  task_id: string
  workspace_id: string
  title: string
  description: string | null
  status: string
  priority: string | null
  due_date: string | null
  created_at: string
  updated_at: string
  assignee_id: string | null
  assignee_first_name: string | null
  assignee_last_name: string | null
  assignee_username: string | null
  assignee_email: string | null
}

export type WorkspaceTasksResponse = Array<TaskResponse>

export type WorkspaceTask = {
  id: string
  workspaceId: string
  title: string
  description: string | null
  status: string
  priority: string | null
  dueDate: string | null
  createdAt: string
  lastUpdated: string
  assignee: {
    id: string | null
    firstName: string | null
    lastName: string | null
    username: string | null
    email: string | null
  }
}

export type CreateTaskRequest = {
  title: string
  description?: string
  assignee_id?: string
  status: string
  priority?: string
  due_date?: string
}

export type UpdateTaskRequest = {
  title?: string
  description?: string
  assignee_id?: string
  status?: string
  priority?: string
  due_date?: string
}
