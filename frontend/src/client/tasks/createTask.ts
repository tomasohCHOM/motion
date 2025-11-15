import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'
import type { CreateTaskRequest, WorkspaceTask } from '@/types/task'

export function useCreateTask() {
  const { apiFetch } = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      workspaceId,
      taskData,
    }: {
      workspaceId: string
      taskData: CreateTaskRequest
    }) => {
      const response = await apiFetch<WorkspaceTask>(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${workspaceId}/tasks`,
        {
          method: 'POST',
          body: JSON.stringify(taskData),
        },
      )
      return { workspaceId, task: response }
    },
    onSuccess: ({ workspaceId }) => {
      // Invalidate and refetch tasks for this workspace
      queryClient.invalidateQueries({
        queryKey: ['workspace-tasks', workspaceId],
      })
    },
  })
}
