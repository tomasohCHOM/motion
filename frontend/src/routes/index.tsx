import { createFileRoute } from '@tanstack/react-router'
import LandingPage from '@/components/landing/landing'

export const Route = createFileRoute('/')({
  component: () => <LandingPage />,
})
