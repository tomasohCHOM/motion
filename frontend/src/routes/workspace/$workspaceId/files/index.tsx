import { createFileRoute } from '@tanstack/react-router'
import WorkspaceFiles from '@/components/workspace/files/files'
import { filesServiceHealthQueryOptions } from '@/client/files/health-check-query'

export const Route = createFileRoute('/workspace/$workspaceId/files/')({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(filesServiceHealthQueryOptions())
  },
  component: WorkspaceFiles,
  errorComponent: () => (
    <div className="flex flex-col m-12 items-center justify-center">
      <h1 className="text-xl font-semibold text-red-500">
        500 — Internal Server Error
      </h1>
      <p>This page is unavailable right now. Please try again later.</p>
    </div>
  ),
})
