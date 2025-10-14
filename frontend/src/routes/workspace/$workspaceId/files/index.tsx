import { createFileRoute } from '@tanstack/react-router'
import WorkspaceFiles from '@/components/workspace/files/files'
import { filesServiceHealthQueryOptions } from '@/client/files/health-check-query'
import { PageError } from '@/components/workspace/common/error'

export const Route = createFileRoute('/workspace/$workspaceId/files/')({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(filesServiceHealthQueryOptions())
  },
  component: WorkspaceFiles,
  errorComponent: PageError,
})
