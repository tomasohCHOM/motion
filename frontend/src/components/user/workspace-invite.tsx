import { Check, X } from 'lucide-react'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import type { WorkspaceInvite } from '@/types/workspace'
import type React from 'react'
import { timeAgo } from '@/utils/date'
import {
  useAcceptWorkspaceInvite,
  useDeclineWorkspaceInvite,
} from '@/client/invites/workspaceInviteAction'

type Props = {
  invite: WorkspaceInvite
  index: number
}

export const WorkspaceInviteCard: React.FC<Props> = ({ invite, index }) => {
  const { mutate: acceptInvite, isPending: acceptingInvite } =
    useAcceptWorkspaceInvite()
  const { mutate: declineInvite, isPending: decliningInvite } =
    useDeclineWorkspaceInvite()

  const onAcceptWorkspaceInvite = () => {
    acceptInvite(invite.id)
  }

  const onDeclineWorkspaceInvite = () => {
    declineInvite(invite.id)
  }

  const isProcessingRequest = acceptingInvite || decliningInvite

  return (
    <div>
      {index > 0 && <Separator className="mb-4" />}
      <div className="space-y-3">
        <div>
          <p className="mb-1">{invite.workspaceName}</p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>
              Invited by {invite.inviterFirstName} {invite.inviterLastName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {timeAgo(invite.invitedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isProcessingRequest}
            onClick={(e) => {
              e.stopPropagation()
              onAcceptWorkspaceInvite()
            }}
            className="flex-1 cursor-pointer"
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isProcessingRequest}
            onClick={(e) => {
              e.stopPropagation()
              onDeclineWorkspaceInvite()
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
