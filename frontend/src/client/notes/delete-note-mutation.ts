import { useMutation } from '@tanstack/react-query'
import { useApiClient } from '../apiClient'

type DeleteNoteInput = {
  workspaceId: string
  noteId: string
}

export function useDeleteNoteMutation() {
  const { apiFetch } = useApiClient()

  return useMutation({
    mutationFn: async (input: DeleteNoteInput) => {
      await apiFetch<void>(
        `${import.meta.env.VITE_WORKSPACE_SERVICE_URL}/workspaces/${input.workspaceId}/notes/${input.noteId}`,
        {
          method: 'DELETE',
        },
      )
    },
  })
}
