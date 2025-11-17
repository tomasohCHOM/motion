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
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      {children}
    </ClerkProvider>
  )
}

export function useClerkAuth(): AuthState {
  const { isSignedIn, isLoaded, getToken } = useAuth()
  const { user } = useUser()

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
