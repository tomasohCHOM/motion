import { useCreateUser } from '@/client/user/create-user-query'
import { useUser } from '@clerk/clerk-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingForm,
})

export function OnboardingForm() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()
  const { mutate: createUser, isPending } = useCreateUser()
  if (!isLoaded) {
    return <p className="text-center mt-20 text-muted-foreground">Loading...</p>
  }
  if (!user) {
    navigate({ to: '/sign-in' })
    return null
  }
  const [firstName, setFirstName] = useState(user.firstName || '')
  const [lastName, setLastName] = useState(user.lastName || '')
  const [email, _] = useState(user.primaryEmailAddress?.emailAddress || '')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        createUser(
          { id: user.id, firstName, lastName, email },
          {
            onSuccess: () => {
              navigate({ to: '/dashboard' })
            },
          },
        )
      }}
      className="flex flex-col gap-4 max-w-md mx-auto mt-20"
    >
      <h1 className="text-xl font-bold">Welcome! Let's get you set up</h1>

      <input
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
        className="border p-2 rounded"
      />

      <input
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
        className="border p-2 rounded"
      />

      <input
        value={email}
        placeholder="Email"
        className="border p-2 rounded"
        disabled
      />

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {isPending ? 'Creating...' : 'Finish Set Up'}
      </button>
    </form>
  )
}
