import { createFileRoute } from '@tanstack/react-router'
import { UserNavbar } from '@/components/user/navbar'

export const Route = createFileRoute('/workspace/create')({
  component: CreateWorkspacePage,
})

function CreateWorkspacePage() {
  return (
    <div>
      <UserNavbar />
      <main className="max-w-[1024px] mx-auto px-6 mt-28 w-full">
        <h1 className="text-2xl font-semibold">Create a new workspace</h1>
      </main>
    </div>
  )
}
