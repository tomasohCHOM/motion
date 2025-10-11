import { useUser } from '@clerk/clerk-react'
import {
  createFileRoute,
  isRedirect,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { Mail, Sparkles, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { useCreateUser } from '@/client/user/create-user-query'
import { userQueryOptions } from '@/client/user/get-user-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context, location }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.pathname },
      })
    }
    try {
      const { user } = context.auth
      await context.queryClient.ensureQueryData(userQueryOptions(user!.id))
      throw redirect({ to: '/dashboard' })
    } catch (err) {
      if (isRedirect(err)) throw err
      if ((err as Error).message === 'USER_NOT_FOUND') return
    }
  },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUser(
      { id: user.id, firstName, lastName, email },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard' })
        },
      },
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2 font-semibold">Welcome! 🎉</h1>
          <p className="text-slate-600">Let's get your workspace set up</p>
        </div>
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Create your profile</CardTitle>
            <CardDescription>
              Tell us a bit about yourself to personalize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-slate-500" />
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                  className="transition-all focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-slate-500" />
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                  className="transition-all focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Email (Disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">
                  This is your verified email address
                </p>
              </div>
              <Button
                type="submit"
                disabled={isPending || !firstName.trim() || !lastName.trim()}
                className="w-full shadow-md hover:shadow-lg transition-all duration-200 mt-6"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating your profile...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Complete Setup
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-slate-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
