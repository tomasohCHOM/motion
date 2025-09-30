import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-up')({
  component: () => (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp redirectUrl="/dashboard" signInUrl="/sign-in" />
    </div>
  ),
})