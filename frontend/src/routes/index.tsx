import PageContent from '@/components/layout/page-content'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RootPage,
})

function RootPage() {
  return (
    <PageContent>
      <h1 className="font-bold text-2xl md:text-4xl">Team Planner</h1>
    </PageContent>
  )
}
