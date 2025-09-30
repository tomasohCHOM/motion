import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'

export const Route = createFileRoute('/sign-in')({
  component: () => (
    <div className="flex items-center justify-center min-h-screen">
      <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  ),
})