import { FolderKanban, Plus } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { UserWorkspaceCard } from './user-workspace'
import type { UserWorkspace } from '@/types/workspace'
import type React from 'react'

type Props = {
  workspaces: Array<UserWorkspace>
  onCreateWorkspace: React.MouseEventHandler<HTMLButtonElement>
}

export const UserWorkspaces: React.FC<Props> = ({
  workspaces,
  onCreateWorkspace,
}) => {
  return (
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
              <UserWorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
