import { User } from 'lucide-react'

export default function AppNavbar() {
  return (
    <nav
      className="fixed top-0 right-0 left-0 flex items-center justify-between
      border-b border-sidebar-border p-5 bg-background z-10 md:left-[var(--sidebar-length,_16rem)]"
    >
      <span className="font-semibold">CPSC 491's Workspace</span>
      <div>
        <User />
      </div>
    </nav>
  )
}
