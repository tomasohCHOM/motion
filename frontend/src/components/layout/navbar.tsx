import { User } from 'lucide-react'

export default function AppNavigationMenu() {
  return (
    <nav className="w-full flex items-center justify-between border-b border-sidebar-border p-5">
      <span className="font-semibold">Motion's team</span>
      <div>
        <User />
      </div>
    </nav>
  )
}
