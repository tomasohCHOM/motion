import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'

export function SignUpPage() {
  const redirect =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('redirect') || '/'
      : '/'

  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp
        redirectUrl={redirect}
        signInUrl={`/sign-in?redirect=${encodeURIComponent(redirect)}`}
      />
    </div>
  )
}

export const Route = createFileRoute('/sign-up')({
  component: () => <SignUpPage />,
})
