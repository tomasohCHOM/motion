import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react'
import { useClerkAuth } from '@/auth/clerk'

export default function AppNavbar() {
  const auth = useClerkAuth()
  return (
    <nav
      className="fixed top-0 right-0 left-0 flex items-center justify-between
      border-b border-sidebar-border p-5 bg-background z-10 md:left-[16rem]"
    >
      <span className="font-semibold">CPSC 491's Workspace</span>
      <div>
        {/* Dev-only auth state indicator to help debug authentication during development */}
        <span className="mr-4 text-xs text-muted-foreground">
          Auth: {auth.isLoading ? 'loading' : auth.isAuthenticated ? 'signed-in' : 'signed-out'}
        </span>
        <SignedIn>
          <div className="flex items-center gap-2">
            <UserButton />
            <button
              className="btn"
              onClick={async () => {
                await auth.logout()
              }}
            >
              Sign out
            </button>
          </div>
        </SignedIn>
        <SignedOut>
          <button
            className="btn"
            onClick={() => {
              const current = typeof window !== 'undefined' ? window.location.href : '/'
              window.location.href = `/sign-in?redirect=${encodeURIComponent(current)}`
            }}
          >
            Sign in
          </button>
        </SignedOut>
      </div>
    </nav>
  )
}
