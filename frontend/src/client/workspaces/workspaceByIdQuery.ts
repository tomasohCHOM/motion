import { queryOptions } from '@tanstack/react-query'
import { apiFetchWithToken } from '../apiClient'
import type { Workspace, WorkspaceDataResponse } from '@/types/workspace'
import type { WorkspaceUser } from '@/types/user'

async function fetchWorkspaceById(workspaceId: string, token: string | null) {
  const data: WorkspaceDataResponse = await apiFetchWithToken(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${workspaceId}`,
    token,
  )

  const workspace: Workspace = {
    id: data.workspace.id,
    name: data.workspace.name,
    description: data.workspace.description,
    createdAt: data.workspace.created_at,
    lastUpdated: data.workspace.updated_at,
  }

  const workspaceUsers: Array<WorkspaceUser> = data.users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    accessType: user.access_type,
    createdAt: user.created_at,
  }))

  return { workspace, workspaceUsers }
}

export function workspaceByIdQueryOptions(
  workspaceId: string,
  token: string | null,
) {
  return queryOptions({
    queryKey: ['workspace-by-id', workspaceId],
    queryFn: () => fetchWorkspaceById(workspaceId, token),
    staleTime: 10_000,
  })
}
