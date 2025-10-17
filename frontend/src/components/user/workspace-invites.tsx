import { Mail } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { WorkspaceInviteCard } from './workspace-invite'
import type React from 'react'
import type { WorkspaceInvite } from '@/types/workspace'

type Props = {
  workspaceInvites: Array<WorkspaceInvite>
}

export const WorkspaceInvites: React.FC<Props> = ({ workspaceInvites }) => {
  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-slate-700" />
          <CardTitle>Invitations</CardTitle>
        </div>
        <CardDescription>Pending workspace invitations</CardDescription>
      </CardHeader>
      <CardContent>
        {workspaceInvites.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-600">No pending invites</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workspaceInvites.map((invite, index) => (
              <WorkspaceInviteCard
                key={invite.id}
                invite={invite}
                index={index}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
