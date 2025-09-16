<<<<<<< HEAD
import PageContent from '@/components/layout/page-content'
=======
>>>>>>> 0fb15f3 (Implement note taking (#9))
import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '@/components/landing/landing'

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
