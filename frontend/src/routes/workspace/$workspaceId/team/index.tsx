import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useCreateInvite } from '@/client/invites/create-invite'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/workspace/$workspaceId/team/')({
  component: WorkspaceTeam,
})

const TeamPageHeader: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-between p-6 border-b border-border">
      <h1 className="font-bold text-lg">Team Management</h1>
      <div className="flex items-center gap-3">
        <Button className="cursor-pointer">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>
    </div>
  )
}

function WorkspaceTeam() {
  const { user, workspace } = useLoaderData({ from: '/workspace/$workspaceId' })
  const { isPending, isError, error, mutate: createInvite } = useCreateInvite()
  const [identifier, setIdentifier] = useState('')

  const onInviteUser = () => {
    createInvite({
      workspaceId: workspace.id,
      invitedBy: user.id,
      identifier,
    })
  }

  return (
    <>
      <TeamPageHeader />
      <div className="px-6">
        <div className="max-w-[768px]">
          {isPending && 'Inviting Member'}
          {isError && `Unable to process request: ${error.message}`}
          <Input
            placeholder="The new member's username or email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Button onClick={onInviteUser}>Invite Member</Button>
        </div>
      </div>
    </>
  )
}
