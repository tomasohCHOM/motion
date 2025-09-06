import {
  Calendar,
  File,
  FolderClock,
  HelpCircle,
  MessageSquareDot,
  NotebookTabs,
} from 'lucide-react';
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
} from '@/components/ui/sidebar';

export default function AppSidebar({ workspaceId }: { workspaceId: string }) {
  const workspaceDynamicRoute = `/workspace/${workspaceId}`;
  const navItems = [
    {
      title: 'Notes',
      url: `${workspaceDynamicRoute}/notes`,
      icon: NotebookTabs,
    },
    {
      title: 'Chat',
      url: `${workspaceDynamicRoute}/chat`,
      icon: MessageSquareDot,
    },
    {
      title: 'Planner',
      url: `${workspaceDynamicRoute}/planner`,
      icon: Calendar,
    },
    {
      title: 'Manager',
      url: `${workspaceDynamicRoute}/manager`,
      icon: FolderClock,
    },
    {
      title: 'Files',
      url: `${workspaceDynamicRoute}/files`,
      icon: File,
    },
  ];
  return (
    <Sidebar>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
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
  );
}
