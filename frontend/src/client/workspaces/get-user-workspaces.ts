import { queryOptions } from '@tanstack/react-query'
import type { UserWorkspace, UserWorkspacesResponse } from '@/types/workspace'
import { apiFetchWithToken } from '@/client/apiClient'

async function fetchUserWorkspaces(
  userId: string,
  token: string | null,
): Promise<Array<UserWorkspace>> {
  const data: UserWorkspacesResponse = await apiFetchWithToken(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/users/${userId}/workspaces`,
    token,
  )

  return data.map((workspaceData) => ({
    id: workspaceData.id,
    name: workspaceData.name,
    description: workspaceData.description,
    accessType: workspaceData.access_type as UserWorkspace['accessType'],
    memberCount: workspaceData.member_count,
    createdAt: workspaceData.created_at,
    lastUpdated: workspaceData.updated_at,
  }))
}

export function userWorkspacesQueryOptions(
  userId: string,
  token: string | null,
) {
  return queryOptions({
    queryKey: ['user-workspaces', userId],
    queryFn: () => fetchUserWorkspaces(userId, token),
    staleTime: 10_000,
  })
}
