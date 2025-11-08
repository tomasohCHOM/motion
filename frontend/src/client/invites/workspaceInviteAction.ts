import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useApiClient } from '../apiClient'
import type { WorkspaceInviteResponse } from '@/types/workspace'

export function useAcceptWorkspaceInvite() {
  const { apiFetch } = useApiClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const res: WorkspaceInviteResponse = await apiFetch(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/invites/${inviteId}/accept`,
        { method: 'POST' },
      )
      return res
    },
    onSuccess: (data) => {
      router.navigate({
        to: '/workspace/$workspaceId',
        params: { workspaceId: data.workspace_id },
      })
    },
  })
}

export function useDeclineWorkspaceInvite() {
  const { apiFetch } = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      await apiFetch(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/invites/${inviteId}/decline`,
        { method: 'POST' },
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user-invites'] })
    },
  })
}
