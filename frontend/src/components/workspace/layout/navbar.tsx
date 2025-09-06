import { User } from 'lucide-react'

export default function AppNavbar() {
  return (
    <nav className="w-full flex items-center justify-between border-b border-sidebar-border p-5">
      <span className="font-semibold">CPSC 491's Workspace</span>
      <div>
        <User />
      </div>
    </nav>
  )
}
