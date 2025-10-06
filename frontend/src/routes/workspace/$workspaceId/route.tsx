import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppNavbar from '@/components/workspace/layout/navbar'
import AppSidebar from '@/components/workspace/layout/sidebar'
<<<<<<< HEAD
import PageContent from '@/components/workspace/layout/page-content'
=======
>>>>>>> 0fb15f3 (Implement note taking (#9))

export const Route = createFileRoute('/workspace/$workspaceId')({
  beforeLoad: ({ context, location }) => {
    // If auth is missing or user isn't signed in, redirect to sign-in with the original path
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.pathname,
        },
      })
    }
  },
  beforeLoad: ({ context, location }) => {
    // If auth is missing or user isn't signed in, redirect to sign-in with the original path
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.pathname,
        },
      })
    }
  },
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
