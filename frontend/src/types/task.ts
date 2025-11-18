export type TaskResponse = {
  task_id: string
  workspace_id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  created_at: string
  updated_at: string
  assignee_id: string
  assignee_first_name: string
  assignee_last_name: string
  assignee_username: string
  assignee_email: string
}

export type WorkspaceTasksResponse = Array<TaskResponse>

export type WorkspaceTask = {
  id: string
  workspaceId: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  lastUpdated: string
  assignee: {
    id: string
    fullName: string
    firstName: string
    lastName: string
    username: string
    email: string
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
