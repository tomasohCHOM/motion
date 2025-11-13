import {
  Calendar,
  ChevronLeft,
  File,
  FolderClock,
  LayoutDashboard,
  MessageSquareDot,
  NotebookTabs,
  Settings,
  Users,
} from 'lucide-react'
import { Link, useMatchRoute } from '@tanstack/react-router'
import type { Workspace } from '@/types/workspace'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavItem = {
  title: string
  url: string
  icon: React.ElementType
}

type SidebarNavSectionProps = {
  items: Array<NavItem>
  workspaceId: string
  matchRoute: ReturnType<typeof useMatchRoute>
  label?: string
}

const SidebarNavSection: React.FC<SidebarNavSectionProps> = ({
  items,
  workspaceId,
  matchRoute,
  label,
}) => {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
          {items.map((item) => {
            const to = item.url.replace('$workspaceId', workspaceId)
            const isActive = !!matchRoute({ to })

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  className="transition-all"
                  isActive={isActive}
                  asChild
                >
                  <Link to={item.url} params={{ workspaceId }}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

type Props = {
  workspace: Workspace
}

export const WorkspaceSidebar: React.FC<Props> = ({ workspace }) => {
  const matchRoute = useMatchRoute()

  const mainNavItems: Array<NavItem> = [
    {
      title: 'Dashboard',
      url: '/workspace/$workspaceId/',
      icon: LayoutDashboard,
    },
    { title: 'Team', url: '/workspace/$workspaceId/team', icon: Users },
    {
      title: 'Settings',
      url: '/workspace/$workspaceId/settings',
      icon: Settings,
    },
  ]

  const workspaceNavItems: Array<NavItem> = [
    {
      title: 'Notes',
      url: '/workspace/$workspaceId/notes',
      icon: NotebookTabs,
    },
    {
      title: 'Chat',
      url: '/workspace/$workspaceId/chat',
      icon: MessageSquareDot,
    },
    {
      title: 'Planner',
      url: '/workspace/$workspaceId/planner',
      icon: Calendar,
    },
    {
      title: 'Manager',
      url: '/workspace/$workspaceId/manager',
      icon: FolderClock,
    },
    { title: 'Files', url: '/workspace/$workspaceId/files', icon: File },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="pt-5">
        <SidebarMenuButton className="transition-all">
          <Link to="/dashboard" className="text-sm w-full">
            <div className="flex items-center gap-1">
              <ChevronLeft className="w-4" />
              Back to dashboard
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      {/* <SidebarSeparator /> */}

      <SidebarContent>
        <SidebarNavSection
          items={mainNavItems}
          workspaceId={workspace.id}
          matchRoute={matchRoute}
        />

        <SidebarNavSection
          label="WORKSPACE"
          items={workspaceNavItems}
          workspaceId={workspace.id}
          matchRoute={matchRoute}
        />
      </SidebarContent>
    </Sidebar>
  )
}
