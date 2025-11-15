import { useMutation } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'
import { mapNoteResponse } from './types'
import type { NoteApiResponse } from './types'
import type { Note } from '@/types/note'

type UpdateNoteInput = {
  workspaceId: string
  noteId: string
  title?: string
  content?: string
  tags?: Array<string>
}

export function useUpdateNoteMutation() {
  const { apiFetch } = useApiClient()

  return useMutation({
    mutationFn: async (input: UpdateNoteInput): Promise<Note> => {
      const payload: Record<string, unknown> = {}
      if (typeof input.title !== 'undefined') {
        payload.title = input.title
      }
      if (typeof input.content !== 'undefined') {
        payload.content = input.content
      }
      if (typeof input.tags !== 'undefined') {
        payload.tags = input.tags
      }

      const data = await apiFetch<NoteApiResponse>(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${input.workspaceId}/notes/${input.noteId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      )

      return mapNoteResponse(data)
    },
  })
}
