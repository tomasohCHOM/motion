import { SignedIn, UserButton } from '@clerk/clerk-react'

export default function AppNavbar() {
  return (
    <nav
      className="fixed top-0 right-0 left-0 flex items-center justify-between
      border-b border-sidebar-border p-5 bg-background z-10 md:left-[16rem]"
    >
      <span className="font-semibold">CPSC 491's Workspace</span>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  )
}
