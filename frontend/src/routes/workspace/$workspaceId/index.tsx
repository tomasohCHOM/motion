import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/workspace/$workspaceId/')({
  component: WorkspaceDashboard,
})

function WorkspaceDashboard() {
  const { workspace } = useLoaderData({ from: '/workspace/$workspaceId' })

  return (
    <div className="p-8 pt-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl md:text-3xl font-semibold">{workspace.name}</h1>
        <p className="text-sm md:text-[1rem] text-muted-foreground">
          {workspace.description}
        </p>
      </div>
    </div>
  )
}
