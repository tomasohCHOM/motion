import { useRouter } from '@tanstack/react-router'
import { ArrowRight, Clock, Users } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import type { UserWorkspace } from '@/types/workspace'
import type React from 'react'
import { timeAgo } from '@/utils/date'

type Props = {
  workspace: UserWorkspace
}

export const UserWorkspaceCard: React.FC<Props> = ({ workspace }) => {
  const router = useRouter()

  const onNavigateToWorkspace = (workspaceId: string) => {
    router.navigate({
      to: '/workspace/$workspaceId',
      params: { workspaceId },
    })
  }
  return (
    <Card
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
                  {workspace.memberCount}{' '}
                  {workspace.memberCount > 1 ? 'members' : 'member'}
                </span>
              </div>
              {workspace.lastUpdated && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>Active {timeAgo(workspace.lastUpdated)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
