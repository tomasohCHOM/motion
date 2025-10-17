import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { AlertCircle } from 'lucide-react'
import { UserNavbar } from '@/components/user/navbar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateWorkspace } from '@/client/workspaces/create-workspace'
import { userQueryOptions } from '@/client/user/get-user-query'

export const Route = createFileRoute('/workspace/create')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    try {
      const { user } = context.auth
      const userData = await context.queryClient.ensureQueryData(
        userQueryOptions(user!.id),
      )
      return { userId: userData.id }
    } catch (err) {
      if ((err as Error).message === 'USER_NOT_FOUND') {
        throw redirect({
          to: '/onboarding',
          search: { redirect: '/onboarding' },
        })
      }
      throw err
    }
  },
  component: CreateWorkspacePage,
})

function CreateWorkspacePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  if (!isLoaded) {
    return <p className="text-center mt-20 text-muted-foreground">Loading...</p>
  }
  if (!user) {
    router.navigate({ to: '/sign-in' })
    return null
  }
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [description, setDescription] = useState('')
  const { mutate: createWorkspace, isPending, isError } = useCreateWorkspace()

  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Workspace name is required')
      return false
    }
    if (name.length < 3) {
      setNameError('Workspace name must be at least 3 characters')
      return false
    }
    if (name.length > 50) {
      setNameError('Workspace name must be less than 50 characters')
      return false
    }
    if (!/^[A-Za-z0-9\s]*$/.test(name)) {
      setNameError(
        'Workspace name must only contain letters, numbers, and spaces',
      )
      return false
    }
    setNameError('')
    return true
  }

  const onBack = () => router.navigate({ to: '/dashboard' })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    if (nameError) {
      validateName(newName)
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateName(name)) return
    createWorkspace(
      { name, description: description.trim() || undefined, userId: user.id },
      {
        onSuccess: ({ id }) => {
          router.navigate({
            to: '/workspace/$workspaceId',
            params: { workspaceId: id },
          })
        },
      },
    )
  }
  const canCreate = name.trim().length >= 3

  return (
    <form onSubmit={handleCreate}>
      <UserNavbar />
      <main className="max-w-[768px] grid gap-y-6 mx-auto px-6 mt-28 w-full">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Create a new workspace</h1>
          <p className="text-muted-foreground">
            A workspace is a shared environment where your team can collaborate
            on taking notes, managing tasks, storing files, and more.
          </p>
        </div>
        <div className="grid gap-y-8">
          <h2 className="text-xl font-semibold">General</h2>
          <div className="grid gap-2">
            <Label htmlFor="workspace-name">Workspace Name *</Label>
            <p className="text-muted-foreground text-sm">
              Choose a clear and descriptive name for your workspace. It must
              only contain letters, numbers, and spaces.
            </p>
            <Input
              id="workspace-name"
              value={name}
              aria-invalid={nameError.length > 0}
              onChange={handleNameChange}
              onBlur={() => validateName(name)}
              maxLength={50}
            />
            {nameError ? (
              <p className="text-destructive text-sm flex gap-1 items-center">
                <AlertCircle className="w-4 h-4" /> {nameError}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                {name.length}/50 characters
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="workspace-description">
              Description (optional)
            </Label>
            <Textarea
              id="workspace-description"
              className="min-h-[80px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of what this workspace is for..."
              maxLength={250}
            />
            <p className="text-muted-foreground text-sm">
              {description.length}/250 characters
            </p>
          </div>
        </div>
        {isError && (
          <p className="text-destructive text-sm flex gap-1 items-center">
            <AlertCircle className="w-4 h-4" /> Something went wrong while
            creating your workspace. Please try again later.{' '}
          </p>
        )}
        <div className="flex items-center justify-between pt-4 pb-8">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button
            size="lg"
            type="submit"
            disabled={!canCreate || isPending}
            className="cursor-pointer shadow-md hover:shadow-lg transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isPending ? 'Create workspace' : 'Creating...'}
          </Button>
        </div>
      </main>
    </form>
  )
}
