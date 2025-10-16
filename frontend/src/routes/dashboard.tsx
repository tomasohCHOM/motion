import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { LayoutGrid, Plus } from 'lucide-react'
import { userQueryOptions } from '@/client/user/get-user-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { userWorkspacesQueryOptions } from '@/client/workspaces/get-user-workspaces'
import { UserNavbar } from '@/components/user/navbar'
import { UserWorkspaces } from '@/components/user/user-workspaces'
import { WorkspaceInvites } from '@/components/user/workspace-invites'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    try {
      const { user } = context.auth
      await context.queryClient.ensureQueryData(userQueryOptions(user!.id))
      return { user }
    } catch (err) {
      if ((err as Error).message === 'USER_NOT_FOUND') {
        throw redirect({
          to: '/onboarding',
          search: { redirect: '/onboarding' },
        })
      }
      throw err
    }
  },
  loader: ({ context }) => {
    const { user, queryClient } = context
    return queryClient.ensureQueryData(userWorkspacesQueryOptions(user!.id))
  },
  component: DashboardPage,
})

type WorkspaceInvite = {
  id: string
  workspaceName: string
  invitedBy: string
  invitedAt: string
}

function DashboardPage() {
  const router = useRouter()
  const workspaces = Route.useLoaderData()
  const workspaceInvites: Array<WorkspaceInvite> = []

  const onCreateWorkspace: React.MouseEventHandler<HTMLButtonElement> = () => {
    router.navigate({ to: '/workspace/create' })
  }

  return (
    <div>
      <UserNavbar />
      <main className="max-w-[1280px] mx-auto px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col items-start gap-6 py-4 justify-between border-b-2 border-border md:items-center md:flex-row">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-3xl font-semibold">
              Welcome Back, Tomas!
            </h1>
            <p className="text-sm md:text-[1rem] text-muted-foreground">
              Select a workspace to continue or create a new one
            </p>
          </div>
          <Button
            onClick={onCreateWorkspace}
            className="shadow-md hover:shadow-lg cursor-pointer transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Workspace
          </Button>
        </div>
        <div className="pt-12 pb-6 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl">Your Workspaces</h2>
          <Badge variant="secondary" className="ml-2">
            {workspaces.length}
          </Badge>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <UserWorkspaces
            workspaces={workspaces}
            onCreateWorkspace={onCreateWorkspace}
          />
          <div className="lg:col-span-2">
            <WorkspaceInvites workspaceInvites={workspaceInvites} />
          </div>
        </section>
      </main>
    </div>
  )
}
