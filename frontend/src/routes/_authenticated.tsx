import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // Dev-only logging to debug auth flows
    // eslint-disable-next-line no-console
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

