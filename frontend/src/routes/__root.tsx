import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import type { QueryClient } from '@tanstack/react-query'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import AppNavigationMenu from '@/components/layout/navbar'
import type { AuthState } from '@/auth/clerk'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'
import AppNavigationMenu from '@/components/layout/navbar'

interface MyRouterContext {
  queryClient: QueryClient
  // `auth` is optional at router construction time because Clerk isn't loaded yet.
  auth?: AuthState
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
<<<<<<< HEAD
      <Outlet />
=======
      <SidebarProvider>
        <AppSidebar />
        <div className="w-full">
          <AppNavigationMenu />
          <Outlet />
        </div>
      </SidebarProvider>
>>>>>>> d903053 (Start working on team workspace UI layout (#6))
      <TanstackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
})
