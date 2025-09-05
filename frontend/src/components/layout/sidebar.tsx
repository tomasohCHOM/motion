import {
  Calendar,
  File,
  FolderClock,
  HelpCircle,
  MessageSquareDot,
  NotebookTabs,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const navItems = [
  {
    title: 'Notes',
    url: '/notes',
    icon: NotebookTabs,
  },
  {
    title: 'Chat',
    url: '/chat',
    icon: MessageSquareDot,
  },
  {
    title: 'Planner',
    url: '/planner',
    icon: Calendar,
  },
  {
    title: 'Manager',
    url: '/manager',
    icon: FolderClock,
  },
  {
    title: 'Files',
    url: '/files',
    icon: File,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <SidebarContent className="ml-auto">
          <HelpCircle size={16} />
        </SidebarContent>
      </SidebarFooter>
    </Sidebar>
  )
}
