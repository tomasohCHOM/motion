import { createFileRoute } from '@tanstack/react-router'
import PageContent from '@/components/workspace/layout/page-content'

export const Route = createFileRoute('/workspace/$workspaceId/manager')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageContent>
      <h1>Planner</h1>
    </PageContent>
  )
}
