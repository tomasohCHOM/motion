export type Task = {
  id: string
  title: string
  description?: string
  assignee: {
    name: string
    avatar?: string
  }
  priority: string
  dueDate?: string
  tags?: Array<string>
}

export type Column = {
  id: string
  title: string
  tasks: Array<Task>
}
