import { createFileRoute } from '@tanstack/react-router';
import PageContent from '@/components/workspace/layout/page-content';

export const Route = createFileRoute('/workspace/$workspaceId/notes')({
  component: WorkspaceNotesPage,
});

function WorkspaceNotesPage() {
  return (
    <PageContent>
      <h1>Notes</h1>
    </PageContent>
  );
}
