import { useMutation } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'
import type { WorkspaceResponse } from '@/types/workspace'

type WorkspaceRequestData = {
  name: string
  description?: string
  userId: string
}

export function useCreateWorkspace() {
  const { apiFetch } = useApiClient()

  return useMutation({
    mutationFn: (reqData: WorkspaceRequestData) =>
      apiFetch<WorkspaceResponse>(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: reqData.name,
            description: reqData.description,
            owner_id: reqData.userId,
          }),
        },
      ).then((data) => ({ id: data.id })),
  })
}
