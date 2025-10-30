import { redirect } from '@tanstack/react-router'
import type { MyRouterContext } from '@/routes/__root' // adjust import as needed

/**
 * Ensures the user is authenticated with Clerk.
 * If not authenticated, redirects to /sign-in with a redirect param.
 */
export function requireAuth(context: MyRouterContext, pathname: string) {
  const auth = context.auth

  if (!auth?.isAuthenticated) {
    throw redirect({
      to: '/sign-in',
      search: { redirect: pathname },
    })
  }

  return auth
}
