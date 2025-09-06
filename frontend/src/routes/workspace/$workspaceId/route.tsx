import { SidebarProvider } from '@/components/ui/sidebar'
import AppNavbar from '@/components/workspace/layout/navbar'
import AppSidebar from '@/components/workspace/layout/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

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
          <Outlet />
        </div>
      </SidebarProvider>
    </>
  )
}
