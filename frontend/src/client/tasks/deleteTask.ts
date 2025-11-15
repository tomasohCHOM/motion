import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'

export function useDeleteTask() {
  const { apiFetch } = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      workspaceId,
    }: {
      taskId: string
      workspaceId: string
    }) => {
      await apiFetch(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/tasks/${taskId}`,
        {
          method: 'DELETE',
        },
      )
      return { workspaceId, taskId }
    },
    onSuccess: ({ workspaceId }) => {
      // Invalidate and refetch tasks for this workspace
      queryClient.invalidateQueries({
        queryKey: ['workspace-tasks', workspaceId],
      })
    },
  })
}
