import { redirect } from '@tanstack/react-router'
import type { AuthState } from './clerk'
import type { QueryClient } from '@tanstack/react-query'
import { userQueryOptions } from '@/client/user/get-user-query'

/**
 * Ensures that the authenticated user has a corresponding DB record.
 * If not, redirects to /onboarding.
 */
export async function requireUser(queryClient: QueryClient, auth: AuthState) {
  try {
    const user = auth.user
    const token = await auth.getToken({ skipCache: true })
    const data = await queryClient.ensureQueryData(
      userQueryOptions(user!.id, token),
    )
    return data
  } catch (err) {
    if ((err as Error).message.includes('User not found')) {
      throw redirect({
        to: '/onboarding',
        search: { redirect: '/onboarding' },
      })
    }
    throw err
  }
}
