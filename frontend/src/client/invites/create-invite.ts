import { useMutation } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'

type InviteRequestData = {
  workspaceId: string
  identifier: string
  accessType?: string
  invitedBy: string
}

export function useCreateInvite() {
  const { apiFetch } = useApiClient()

  return useMutation({
    mutationFn: (inviteReqData: InviteRequestData) =>
      apiFetch(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${inviteReqData.workspaceId}/invites`,
        {
          method: 'POST',
          body: JSON.stringify({
            invited_by: inviteReqData.invitedBy,
            access_type: inviteReqData.accessType,
            identifier: inviteReqData.identifier,
          }),
        },
      ),
  })
}
