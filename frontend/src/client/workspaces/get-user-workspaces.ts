import { queryOptions } from '@tanstack/react-query'
import type { UserWorkspace, UserWorkspacesResponse } from '@/types/workspace'

async function fetchUserWorkspaces(
  userId: string,
): Promise<Array<UserWorkspace>> {
  const res = await fetch(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/users/${userId}/workspaces`,
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch workspaces ${res.status}`)
  }
  const data: UserWorkspacesResponse = await res.json()
  const userWorkspaces: Array<UserWorkspace> = data.map((workspaceData) => ({
    id: workspaceData.id,
    name: workspaceData.name,
    description: workspaceData.description,
    accessType: workspaceData.access_type as UserWorkspace['accessType'],
    memberCount: workspaceData.member_count,
    createdAt: workspaceData.created_at,
    lastUpdated: workspaceData.updated_at,
  }))
  return userWorkspaces
}

export function userWorkspacesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['user-workspaces', userId],
    queryFn: () => fetchUserWorkspaces(userId),
    staleTime: 10_000,
  })
}
