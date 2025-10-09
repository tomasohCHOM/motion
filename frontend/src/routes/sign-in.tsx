import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'

export function SignInPage() {
  // Read `redirect` from the query string (if present) and pass it to Clerk's SignIn
  const redirect =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect') ||
        window.location.pathname ||
        '/'
      : '/'

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn
        redirectUrl={redirect}
        signUpUrl={`/sign-up?redirect=${encodeURIComponent(redirect)}`}
      />
    </div>
  )
}

export const Route = createFileRoute('/sign-in')({
  component: () => <SignInPage />,
})
