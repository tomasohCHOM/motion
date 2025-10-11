import { createFileRoute, redirect } from '@tanstack/react-router'
import { userQueryOptions } from '@/client/user/get-user-query'

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
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard"!</div>
}
