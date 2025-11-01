import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppNavbar from '@/components/workspace/layout/navbar'
import AppSidebar from '@/components/workspace/layout/sidebar'
import PageContent from '@/components/workspace/layout/page-content'
import { requireAuth } from '@/auth/requireAuth'
import { requireUser } from '@/auth/requireUser'
import { LoadingPage } from '@/components/common/loading'

export const Route = createFileRoute('/workspace/$workspaceId')({
  beforeLoad: async ({ context, location }) => {
    requireAuth(context, location.pathname)
    const user = await requireUser(context.queryClient, context.auth!)
    return { user, first_name: user.first_name, auth: context.auth! }
  },
  pendingComponent: () => <LoadingPage />,
  component: WorkspaceLayout,
})

function WorkspaceLayout() {
  const { workspaceId } = Route.useParams()

  return (
    <>
      <SidebarProvider>
        <AppSidebar workspaceId={workspaceId} />
        <div className="w-full">
          <AppNavbar />
          <PageContent>
            <Outlet />
          </PageContent>
        </div>
      </SidebarProvider>
    </>
  )
}
