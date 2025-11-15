import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'
import type { UpdateTaskRequest, WorkspaceTask } from '@/types/task'

export function useUpdateTask() {
  const { apiFetch } = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      taskData,
      workspaceId,
    }: {
      taskId: string
      taskData: UpdateTaskRequest
      workspaceId: string
    }) => {
      const response = await apiFetch<WorkspaceTask>(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/tasks/${taskId}`,
        {
          method: 'PATCH',
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
