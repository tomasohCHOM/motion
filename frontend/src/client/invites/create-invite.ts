import { useMutation } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'

type InviteRequestData = {
  workspaceId: string
  workspaceName: string
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
            workspace_name: inviteReqData.workspaceName,
            invited_by: inviteReqData.invitedBy,
            access_type: inviteReqData.accessType,
            identifier: inviteReqData.identifier,
          }),
        },
      ),
  })
}
