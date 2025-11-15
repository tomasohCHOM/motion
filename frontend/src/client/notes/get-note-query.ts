import { queryOptions } from '@tanstack/react-query'
import { apiFetchWithToken } from '../apiClient'
import { mapNoteResponse } from './types'
import type { NoteApiResponse } from './types'
import type { Note } from '@/types/note'

const WORKSPACE_SERVICE_URL = import.meta.env.VITE_WORKSPACE_SERVICE_URL

export async function fetchWorkspaceNote(
  workspaceId: string,
  noteId: string,
  token: string | null,
): Promise<Note> {
  const data = await apiFetchWithToken<NoteApiResponse>(
    `${WORKSPACE_SERVICE_URL}/workspaces/${workspaceId}/notes/${noteId}`,
    token,
  )

  return mapNoteResponse(data)
}

export function workspaceNoteQueryOptions(
  workspaceId: string,
  noteId: string,
  token: string | null,
) {
  return queryOptions({
    queryKey: ['workspace', workspaceId, 'note', noteId],
    queryFn: () => fetchWorkspaceNote(workspaceId, noteId, token),
    staleTime: 5_000,
  })
}
