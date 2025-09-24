import { createFileRoute } from '@tanstack/react-router'
import WorkspaceFiles from '@/components/workspace/files/files'

export const Route = createFileRoute('/workspace/$workspaceId/files/')({
  component: WorkspaceFiles,
})
