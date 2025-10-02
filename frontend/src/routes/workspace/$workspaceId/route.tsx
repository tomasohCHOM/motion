import { Outlet, createFileRoute } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppNavbar from '@/components/workspace/layout/navbar'
import AppSidebar from '@/components/workspace/layout/sidebar'
import PageContent from '@/components/workspace/layout/page-content'

export const Route = createFileRoute('/workspace/$workspaceId')({
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
