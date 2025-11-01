import { createFileRoute, useRouter } from '@tanstack/react-router'
import { LayoutGrid, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { userWorkspacesQueryOptions } from '@/client/workspaces/get-user-workspaces'
import { UserNavbar } from '@/components/user/navbar'
import { UserWorkspaces } from '@/components/user/user-workspaces'
import { WorkspaceInvites } from '@/components/user/workspace-invites'
import { requireAuth } from '@/auth/requireAuth'
import { requireUser } from '@/auth/requireUser'
import { LoadingPage } from '@/components/common/loading'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context, location }) => {
    requireAuth(context, location.pathname)
    const user = await requireUser(context.queryClient, context.auth!)
    return { user, first_name: user.first_name, auth: context.auth! }
  },
  loader: async ({ context }) => {
    const { user, first_name, queryClient, auth } = context
    const token = await auth.getToken({ skipCache: true })
    const workspaces = await queryClient.ensureQueryData(
      userWorkspacesQueryOptions(user.id, token),
    )
    return { workspaces, first_name }
  },
  pendingComponent: () => <LoadingPage />,
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
  const { workspaces, first_name: firstName } = Route.useLoaderData()
  const workspaceInvites: Array<WorkspaceInvite> = []
  const [redirectingCreatePage, setRedirectingCreatePage] = useState(false)

  const onCreateWorkspace: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    setRedirectingCreatePage(true)
    await router.navigate({ to: '/workspace/create' })
    setRedirectingCreatePage(false)
  }

  return (
    <div>
      <UserNavbar />
      <main className="max-w-[1280px] mx-auto px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col items-start gap-6 py-4 justify-between border-b-2 border-border md:items-center md:flex-row">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-3xl font-semibold">
              Welcome Back, {firstName}!
            </h1>
            <p className="text-sm md:text-[1rem] text-muted-foreground">
              Select a workspace to continue or create a new one
            </p>
          </div>
          <Button
            disabled={redirectingCreatePage}
            onClick={onCreateWorkspace}
            className="shadow-md hover:shadow-lg cursor-pointer transition-all"
          >
            {redirectingCreatePage ? (
              <>
                <Spinner />
                Loading
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                New Workspace
              </>
            )}
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
            redirectingCreatePage={redirectingCreatePage}
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
