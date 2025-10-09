import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/authenticated')({
  beforeLoad: ({ context, location }) => {
    // Dev-only logging to debug auth flows

    console.debug('Authenticated route beforeLoad; auth=', context.auth)

    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: () => <Outlet />,
})
