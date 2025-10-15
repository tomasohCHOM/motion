import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/workspace/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/workspace/create"!</div>
}
