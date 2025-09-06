import { createFileRoute } from '@tanstack/react-router';
import WorkspaceManager from '@/components/workspace/manager/manager';

export const Route = createFileRoute('/workspace/$workspaceId/manager')({
  component: WorkspaceManager,
});
