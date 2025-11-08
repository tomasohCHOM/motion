import { queryOptions } from '@tanstack/react-query'
import { apiFetchWithToken } from '../apiClient'
import type {
  WorkspaceInvite,
  WorkspaceInvitesResponse,
} from '@/types/workspace'

async function fetchUserInvites(
  userId: string,
  token: string | null,
): Promise<Array<WorkspaceInvite>> {
  const data: WorkspaceInvitesResponse = await apiFetchWithToken(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/users/${userId}/invites`,
    token,
  )

  const workspaceInvites: Array<WorkspaceInvite> = data.map((invite) => {
    return {
      id: invite.id,
      workspaceName: invite.workspace_name,
      inviterFirstName: invite.inviter_first_name,
      inviterLastName: invite.inviter_last_name,
      invitedAt: invite.created_at,
    }
  })

  return workspaceInvites
}

export function userInvitesQueryOptions(userId: string, token: string | null) {
  return queryOptions({
    queryKey: ['user-invites'],
    queryFn: async () => fetchUserInvites(userId, token),
    staleTime: 10_000,
  })
}
