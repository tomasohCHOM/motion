import { useMutation } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'
import { mapNoteResponse } from './types'
import type { NoteApiResponse } from './types'
import type { Note } from '@/types/note'

type CreateNoteInput = {
  workspaceId: string
  authorId: string
  title?: string
  content?: string
  tags?: Array<string>
}

export function useCreateNoteMutation() {
  const { apiFetch } = useApiClient()

  return useMutation({
    mutationFn: async (input: CreateNoteInput): Promise<Note> => {
      const payload = {
        author_id: input.authorId,
        title: input.title ?? 'Untitled',
        content: input.content ?? '',
        tags: input.tags ?? [],
      }

      const data = await apiFetch<NoteApiResponse>(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${input.workspaceId}/notes`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )

      return mapNoteResponse(data)
    },
  })
}
