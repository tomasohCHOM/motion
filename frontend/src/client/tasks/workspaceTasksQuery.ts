import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiFetchWithToken, useApiClient } from '../apiClient'
import type { WorkspaceTask, WorkspaceTasksResponse } from '@/types/task'

export function workspaceTasksQueryOptions(
  workspaceId: string,
  token: string | null,
) {
  return queryOptions({
    queryKey: ['workspace-tasks', workspaceId],
    queryFn: async ({ queryKey }) => {
      const wsId = queryKey[1]
      const response: WorkspaceTasksResponse = await apiFetchWithToken(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${wsId}/tasks`,
        token,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(import.meta.env.VITE_ENV === 'production'
              ? {}
              : {
                  'X-Dev-UserID':
                    import.meta.env.VITE_DEV_USER_ID || 'user_dev_default',
                }),
          },
        },
      )

      const workspaceTasks: Array<WorkspaceTask> = response.map((task) => ({
        id: task.task_id,
        workspaceId: task.workspace_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        createdAt: task.created_at,
        lastUpdated: task.updated_at,
        assignee: {
          id: task.assignee_id,
          firstName: task.assignee_first_name,
          lastName: task.assignee_last_name,
          username: task.assignee_username,
          email: task.assignee_email,
        },
      }))

      return workspaceTasks
    },
  })
}

export function useWorkspaceTasksQuery(workspaceId: string) {
  const { apiFetch } = useApiClient()

  return useQuery({
    queryKey: ['workspace-tasks', workspaceId],
    queryFn: async () => {
      const data: WorkspaceTasksResponse = await apiFetch(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${workspaceId}/tasks`,
      )

      const workspaceTasks: Array<WorkspaceTask> = data.map((task) => ({
        id: task.task_id,
        workspaceId: task.workspace_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        createdAt: task.created_at,
        lastUpdated: task.updated_at,
        assignee: {
          id: task.assignee_id,
          firstName: task.assignee_first_name,
          lastName: task.assignee_last_name,
          username: task.assignee_username,
          email: task.assignee_email,
        },
      }))

      return workspaceTasks
    },
  })
}
