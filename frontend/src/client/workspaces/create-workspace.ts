import { useMutation } from '@tanstack/react-query'
import type { WorkspaceResponse } from '@/types/workspace'

type WorkspaceRequestData = {
  name: string
  description?: string
  userId: string
}

async function createWorkspace(
  reqData: WorkspaceRequestData,
): Promise<{ id: string }> {
  const res = await fetch(
    `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: reqData.name,
        description: reqData.description,
        owner_id: reqData.userId,
      }),
    },
  )
  if (!res.ok) throw new Error(`Falied to create workspace: ${res.status}`)
  const data: WorkspaceResponse = await res.json()
  return { id: data.id }
}

export function useCreateWorkspace() {
  return useMutation({
    mutationFn: (reqData: WorkspaceRequestData) => createWorkspace(reqData),
  })
}
