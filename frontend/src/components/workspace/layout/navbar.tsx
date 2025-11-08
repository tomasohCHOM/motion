import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { WorkspaceUser } from '@/types/user'
import type { Workspace } from '@/types/workspace'
import { getMemberInitials } from '@/utils/initals'
import { SignedIn, UserButton } from '@clerk/clerk-react'
import { useRouter } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'

type Props = {
  workspace: Workspace
  workspaceUsers: WorkspaceUser[]
}

export const WorkspaceNavbar: React.FC<Props> = ({
  workspace,
  workspaceUsers,
}) => {
  const router = useRouter()

  return (
    <nav
      className="fixed top-0 right-0 left-0 flex items-center justify-between
      border-b border-sidebar-border p-5 bg-background z-10 md:left-[16rem]"
    >
      <span className="font-semibold">{workspace.name}</span>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          {workspaceUsers.map((user) => (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getMemberInitials(user.firstName + ' ' + user.lastName)}
              </AvatarFallback>
            </Avatar>
          ))}
          <Button
            onClick={() =>
              router.navigate({
                to: '/workspace/$workspaceId/team',
                params: { workspaceId: workspace.id },
              })
            }
            variant="outline"
            size="icon"
            className="cursor-pointer h-8 w-8 rounded-full"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  )
}
