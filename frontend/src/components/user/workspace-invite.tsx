import { Check, X } from 'lucide-react'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import type { WorkspaceInvite } from '@/types/workspace'
import type React from 'react'
import { timeAgo } from '@/utils/date'

type Props = {
  invite: WorkspaceInvite
  index: number
}

export const WorkspaceInviteCard: React.FC<Props> = ({ invite, index }) => {
  // TODO: Implement these handlers once we get workspace invites working
  const onAcceptInvite = (workspaceId: string) => {
    console.log(workspaceId)
  }
  const onDeclineInvite = (workspaceId: string) => {
    console.log(workspaceId)
  }

  return (
    <div>
      {index > 0 && <Separator className="mb-4" />}
      <div className="space-y-3">
        <div>
          <p className="mb-1">{invite.workspaceName}</p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Invited by {invite.invitedBy}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {timeAgo(invite.invitedAt)}
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
  )
}
