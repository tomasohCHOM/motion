import { queryOptions } from '@tanstack/react-query'
import { apiFetchWithToken } from '../apiClient'
import { mapNoteResponse } from './types'
import type { NoteApiResponse } from './types'
import type { Note } from '@/types/note'

const WORKSPACE_SERVICE_URL = import.meta.env.VITE_WORKSPACE_SERVICE_URL

export async function fetchWorkspaceNotes(
  workspaceId: string,
  token: string | null,
): Promise<Array<Note>> {
  const data = await apiFetchWithToken<Array<NoteApiResponse>>(
    `${WORKSPACE_SERVICE_URL}/workspaces/${workspaceId}/notes`,
    token,
  )

  return data.map(mapNoteResponse)
}

export function workspaceNotesQueryOptions(
  workspaceId: string,
  token: string | null,
) {
  return queryOptions({
    queryKey: ['workspace', workspaceId, 'notes'],
    queryFn: () => fetchWorkspaceNotes(workspaceId, token),
    staleTime: 10_000,
  })
}
