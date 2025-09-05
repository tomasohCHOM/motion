import PageContent from '@/components/layout/page-content'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/notes/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageContent>
      <h1>Notes</h1>
    </PageContent>
  )
}
