import { queryOptions } from '@tanstack/react-query'

type UserWorkspaces = {
  id: string
  name: string
  description: string
  access_type: string
  member_count: number
  created_at: string
  updated_at: string
}

async function fetchUserWorkspaces(
  userId: string,
): Promise<Array<UserWorkspaces>> {
  const res = await fetch(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/users/${userId}/workspaces`,
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch workspaces ${res.status}`)
  }
  return await res.json()
}

export function userWorkspacesQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['user-workspaces', userId],
    queryFn: () => fetchUserWorkspaces(userId),
    staleTime: 10_000,
  })
}
