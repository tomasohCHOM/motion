import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { WorkspaceNavbar } from '@/components/workspace/layout/navbar'
import { WorkspaceSidebar } from '@/components/workspace/layout/sidebar'
import PageContent from '@/components/workspace/layout/page-content'
import { requireAuth } from '@/auth/requireAuth'
import { requireUser } from '@/auth/requireUser'
import { LoadingPage } from '@/components/common/loading'
import { workspaceByIdQueryOptions } from '@/client/workspaces/workspaceByIdQuery'

export const Route = createFileRoute('/workspace/$workspaceId')({
  beforeLoad: async ({ context, location, params }) => {
    const auth = requireAuth(context, location.pathname)
    const user = await requireUser(context.queryClient, auth)
    const token = await auth.getToken({ skipCache: false })
    const { workspace, workspaceUsers } =
      await context.queryClient.ensureQueryData(
        workspaceByIdQueryOptions(params.workspaceId, token),
      )

    return {
      user,
      first_name: user.first_name,
      auth: context.auth!,
      workspace: workspace,
      workspaceUsers,
    }
  },
  loader: ({ context }) => ({
    user: context.user,
    workspace: context.workspace,
    workspaceUsers: context.workspaceUsers,
  }),
  pendingComponent: () => <LoadingPage />,
  component: WorkspaceLayout,
})

function WorkspaceLayout() {
  const { workspace, workspaceUsers } = Route.useLoaderData()

  return (
    <>
      <SidebarProvider>
        <WorkspaceSidebar workspace={workspace} />
        <div className="w-full">
          <WorkspaceNavbar
            workspace={workspace}
            workspaceUsers={workspaceUsers}
          />
          <PageContent>
            <Outlet />
          </PageContent>
        </div>
      </SidebarProvider>
    </>
  )
}
