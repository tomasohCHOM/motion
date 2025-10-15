import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
  ArrowRight,
  Check,
  Clock,
  FolderKanban,
  LayoutGrid,
  Mail,
  Plus,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { userQueryOptions } from '@/client/user/get-user-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { userWorkspacesQueryOptions } from '@/client/workspaces/get-user-workspaces'

export const Route = createFileRoute('/dashboard')({
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
      return { user }
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
  loader: ({ context }) => {
    const { user, queryClient } = context
    return queryClient.ensureQueryData(userWorkspacesQueryOptions(user!.id))
  },
  component: DashboardPage,
})

type WorkspaceInvite = {
  id: string
  workspaceName: string
  invitedBy: string
  invitedAt: string
}

function DashboardPage() {
  const router = useRouter()
  const workspaces = Route.useLoaderData()
  const invites: Array<WorkspaceInvite> = []

  const onCreateWorkspace = () => {
    router.navigate({ to: '/workspace/create' })
  }

  const onNavigateToWorkspace = (workspaceId: string) => {
    router.navigate({
      to: '/workspace/$workspaceId',
      params: { workspaceId },
    })
  }

  // TODO: Implement these handlers once we get workspace invites working
  const onAcceptInvite = (workspaceId: string) => {
    console.log(workspaceId)
  }
  const onDeclineInvite = (workspaceId: string) => {
    console.log(workspaceId)
  }

  return (
    <div className="">
      <div className="z-10 bg-background p-4 fixed flex w-full top-0 items-center justify-between border border-b-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">Motion</span>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      <main className="max-w-[1280px] mx-auto px-6 mt-24 w-full">
        <div className="flex items-center py-4 justify-between border-b-2 border-border">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl">Welcome Back, Tomas!</h1>
            <p className="text-muted-foreground">
              Select a workspace to continue or create a new one
            </p>
          </div>
          <Button
            onClick={onCreateWorkspace}
            className="shadow-md hover:shadow-lg cursor-pointer transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Workspace
          </Button>
        </div>
        <div className="pt-12 pb-6 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-slate-700" />
          <h2 className="text-xl">Your Workspaces</h2>
          <Badge variant="secondary" className="ml-2">
            {workspaces.length}
          </Badge>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div>
              {workspaces.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <FolderKanban className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="mb-2">No workspaces yet</h3>
                    <p className="text-slate-600 text-center mb-4 text-sm">
                      Create your first workspace to get started with your team
                    </p>
                    <Button onClick={onCreateWorkspace} variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Workspace
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {workspaces.map((workspace) => (
                    <Card
                      key={workspace.id}
                      onClick={() => onNavigateToWorkspace(workspace.id)}
                      className="hover:shadow-lg transition-all cursor-pointer group border-border"
                    >
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="group-hover:text-blue-600 transition-colors">
                                {workspace.name}
                              </h3>
                              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>
                            {workspace.description && (
                              <p className="text-slate-600 text-sm mb-3">
                                {workspace.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>
                                  {workspace.member_count}{' '}
                                  {workspace.member_count > 1
                                    ? 'members'
                                    : 'member'}
                                </span>
                              </div>
                              {workspace.updated_at && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>Active {workspace.updated_at}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-slate-700" />
                  <CardTitle>Invitations</CardTitle>
                </div>
                <CardDescription>Pending workspace invitations</CardDescription>
              </CardHeader>
              <CardContent>
                {invites.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600">No pending invites</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invites.map((invite, index) => (
                      <div key={invite.id}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="space-y-3">
                          <div>
                            <p className="mb-1">{invite.workspaceName}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <span>Invited by {invite.invitedBy}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              {invite.invitedAt}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onAcceptInvite(invite.id)
                              }}
                              className="flex-1 cursor-pointer"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeclineInvite(invite.id)
                              }}
                              className="flex-1 cursor-pointer"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
