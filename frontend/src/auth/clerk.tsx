import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react'

type GetTokenOptions = {
  template?: string
  organizationId?: string
  leewayInSeconds?: number
  skipCache?: boolean
}

export type AuthState = {
  isAuthenticated: boolean
  user: { id: string; username: string; email: string } | null
  isLoading: boolean
  getToken: (options?: GetTokenOptions) => Promise<string | null>
  login: () => void
  logout: () => void
}

export function ClerkWrapper({ children }: { children: React.ReactNode }) {
  // In E2E mode, skip ClerkProvider entirely since we're bypassing Clerk auth
  const isE2EMode = import.meta.env.VITE_E2E_MODE === 'true'

  if (isE2EMode) {
    return <>{children}</>
  }

  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  )
}

export function useClerkAuth(): AuthState {
  // E2E mode: bypass Clerk and use dev user
  const isE2EMode = import.meta.env.VITE_E2E_MODE === 'true'

  // Only call Clerk hooks when NOT in E2E mode
  // This prevents errors when ClerkProvider is not rendered
  const clerkAuth = !isE2EMode ? useAuth() : null
  const clerkUser = !isE2EMode ? useUser() : null

  if (isE2EMode) {
    // In E2E mode, check localStorage for test-specific userId (for parallel test execution)
    // If not found, fall back to VITE_DEV_USER_ID
    const testUserId =
      typeof window !== 'undefined' ? localStorage.getItem('e2e-user-id') : null
    const devUserId =
      testUserId || import.meta.env.VITE_DEV_USER_ID || 'test-user-e2e'
    return {
      isAuthenticated: true,
      user: {
        id: devUserId,
        username: devUserId,
        email: `${devUserId}@test.com`,
      },
      isLoading: false,
      getToken: async () => 'mock-token-e2e',
      login: () => {},
      logout: async () => {},
    }
  }

  const { isSignedIn, isLoaded, getToken } = clerkAuth!
  const { user } = clerkUser!

  return {
    isAuthenticated: Boolean(isSignedIn),
    user: user
      ? {
          id: user.id,
          username:
            user.username || user.primaryEmailAddress?.emailAddress || '',
          email: user.primaryEmailAddress?.emailAddress || '',
        }
      : null,
    isLoading: !isLoaded,
    getToken: getToken,
    login: () => {
      // Clerk handles login through components
      window.location.href = '/sign-in'
    },
    logout: async () => {
      // Try to use Clerk's client API if available, otherwise fallback to a redirect.
      try {
        // `useClerk` is optional in some setups; try to access global Clerk object
        // at runtime and call signOut if present.
        const globalAny = globalThis as any
        if (globalAny.Clerk && typeof globalAny.Clerk.signOut === 'function') {
          await globalAny.Clerk.signOut()
          return
        }
        // Some setups expose a `clerk` instance on window
        if (globalAny.clerk && typeof globalAny.clerk.signOut === 'function') {
          await globalAny.clerk.signOut()
          return
        }
      } catch (e) {
        // ignore and fallback to redirect
      }

      // Fallback: navigate to the sign-out route which may be handled by server or Clerk
      window.location.href = '/sign-out'
    },
  }
}
